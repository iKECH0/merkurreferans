// Fix test lesson: create a real Zoom meeting and update the lesson

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');

// Load .env manually
const envContent = fs.readFileSync('.env', 'utf8');
envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex > 0) {
      const key = trimmed.substring(0, eqIndex);
      let val = trimmed.substring(eqIndex + 1);
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      process.env[key] = val;
    }
  }
});

async function getZoomAccessToken() {
  const accountId = process.env.ZOOM_ACCOUNT_ID;
  const clientId = process.env.ZOOM_CLIENT_ID;
  const clientSecret = process.env.ZOOM_CLIENT_SECRET;

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const res = await fetch(`https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });

  const data = await res.json();
  return data.access_token;
}

async function createZoomMeeting(title, startTime, durationMins) {
  const token = await getZoomAccessToken();
  
  const res = await fetch('https://api.zoom.us/v2/users/me/meetings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      topic: title,
      type: 2, // scheduled
      start_time: startTime.toISOString(),
      duration: durationMins,
      timezone: 'Europe/Istanbul',
      settings: {
        join_before_host: true,
        waiting_room: false
      }
    })
  });

  const data = await res.json();
  return data;
}

async function fixTestLesson() {
  // Find the test lesson we just created
  const lesson = await prisma.lesson.findFirst({
    where: { 
      title: 'Hızlı Okuma - Temel Teknikler',
      status: 'SCHEDULED'
    }
  });

  if (!lesson) {
    console.log('Test lesson not found!');
    await prisma.$disconnect();
    return;
  }

  console.log(`Found lesson: ${lesson.title} (${lesson.id})`);
  console.log(`Creating real Zoom meeting...`);

  const durationMins = Math.round((new Date(lesson.endTime) - new Date(lesson.startTime)) / 60000);
  const meeting = await createZoomMeeting(lesson.title, new Date(lesson.startTime), durationMins);

  if (meeting.id) {
    await prisma.lesson.update({
      where: { id: lesson.id },
      data: {
        zoomLink: meeting.join_url,
        zoomStartLink: meeting.start_url,
        zoomMeetingId: String(meeting.id)
      }
    });

    console.log(`Updated lesson with real Zoom links!`);
    console.log(`Join URL: ${meeting.join_url}`);
    console.log(`Start URL: ${meeting.start_url}`);
  } else {
    console.log('Failed to create Zoom meeting:', meeting);
  }

  await prisma.$disconnect();
}

fixTestLesson().catch(e => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
