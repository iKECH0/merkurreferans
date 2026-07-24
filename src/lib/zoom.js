export async function getZoomAccessToken() {
  const accountId = process.env.ZOOM_ACCOUNT_ID;
  const clientId = process.env.ZOOM_CLIENT_ID;
  const clientSecret = process.env.ZOOM_CLIENT_SECRET;

  if (!accountId || !clientId || !clientSecret) {
    return null;
  }

  try {
    const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    
    const response = await fetch(`https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      console.error("Zoom Token Error:", await response.text());
      return null;
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error("Zoom getZoomAccessToken Exception:", error);
    return null;
  }
}

export async function createZoomMeeting(topic, startTime, durationMins) {
  const token = await getZoomAccessToken();
  if (!token) return null;

  try {
    let targetUserId = "me";
    const userRes = await fetch('https://api.zoom.us/v2/users', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (userRes.ok) {
      const userData = await userRes.json();
      if (userData.users && userData.users.length > 0) {
        targetUserId = userData.users[0].id;
      }
    }

    const response = await fetch(`https://api.zoom.us/v2/users/${targetUserId}/meetings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        topic: topic,
        type: 2, // 2 = Scheduled meeting
        start_time: startTime.toISOString(), 
        duration: durationMins,
        timezone: 'Europe/Istanbul',
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: false,
          mute_upon_entry: true,
          watermark: false,
          use_pmi: false,
          approval_type: 2, // 2 = No registration required
          waiting_room: true
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Zoom Create Meeting Error:", errorText);
      return { error: `Zoom Toplantı Hatası: ${errorText}` };
    }

    const data = await response.json();
    return {
      join_url: data.join_url,
      start_url: data.start_url, // Admin/Host start url
      meeting_id: data.id.toString(),
      password: data.password
    };
  } catch (error) {
    console.error("Zoom createZoomMeeting Exception:", error);
    return { error: `Zoom Sunucu Hatası: ${error.message}` };
  }
}
