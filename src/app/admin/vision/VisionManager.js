'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, Circle, Download, Eraser, Highlighter, ImagePlus, Minus, Pen, Play, Plus, RectangleHorizontal, Save, Trash2, Undo2, Video, VideoOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { upload as uploadBlob } from '@vercel/blob/client';
import styles from './vision.module.css';

const COLORS = ['#111827', '#ef4444', '#2563eb', '#16a34a', '#9333ea', '#f59e0b'];
const emptyPage = (number = 1) => ({ id: crypto.randomUUID(), title: `Sayfa ${number}`, actions: [], background: null });

function drawAction(ctx, action) {
  if (!action.points?.length) return;
  const first = action.points[0];
  const last = action.points[action.points.length - 1];
  ctx.save();
  ctx.strokeStyle = action.color;
  ctx.fillStyle = action.color;
  ctx.lineWidth = action.tool === 'highlighter' ? action.size * 3 : action.tool === 'eraser' ? action.size * 2 : action.size;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  if (action.tool === 'highlighter') ctx.globalAlpha = 0.35;
  if (action.tool === 'eraser') ctx.globalCompositeOperation = 'destination-out';
  if (['pen', 'highlighter', 'eraser'].includes(action.tool)) {
    if (action.points.length === 1) {
      ctx.beginPath();
      ctx.arc(first.x, first.y, ctx.lineWidth / 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      let segmentStart = first;
      for (let index = 1; index < action.points.length; index += 1) {
        const current = action.points[index];
        const next = action.points[index + 1] || current;
        const midpoint = { x: (current.x + next.x) / 2, y: (current.y + next.y) / 2 };
        if (action.tool === 'pen') {
          const pressure = Number.isFinite(current.pressure) && current.pressure > 0 ? current.pressure : 0.5;
          ctx.lineWidth = action.size * (0.72 + pressure * 0.56);
        }
        ctx.beginPath();
        ctx.moveTo(segmentStart.x, segmentStart.y);
        ctx.quadraticCurveTo(current.x, current.y, midpoint.x, midpoint.y);
        ctx.stroke();
        segmentStart = midpoint;
      }
    }
  } else if (action.tool === 'line') {
    ctx.beginPath(); ctx.moveTo(first.x, first.y); ctx.lineTo(last.x, last.y); ctx.stroke();
  } else if (action.tool === 'rectangle') {
    ctx.strokeRect(first.x, first.y, last.x - first.x, last.y - first.y);
  } else if (action.tool === 'circle') {
    ctx.beginPath();
    ctx.ellipse((first.x + last.x) / 2, (first.y + last.y) / 2, Math.abs(last.x - first.x) / 2, Math.abs(last.y - first.y) / 2, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function Studio({ onClose, onSaved, initial }) {
  const canvasRef = useRef(null);
  const cameraRef = useRef(null);
  const streamRef = useRef(null);
  const activeRef = useRef(null);
  const recorderRef = useRef(null);
  const recordingFrameRef = useRef(null);
  const currentPageRef = useRef(null);
  const backgroundImageRef = useRef(null);
  const startedAt = useRef(Date.now());
  const initialData = initial?.data || {};
  const [title, setTitle] = useState(initial?.title || 'Yeni Vizyon Dersi');
  const [format, setFormat] = useState(initial?.format || '1:1');
  const [pages, setPages] = useState(initialData.pages?.length ? initialData.pages : [emptyPage()]);
  const [pageId, setPageId] = useState(initialData.currentPageId || initialData.pages?.[0]?.id);
  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState('#111827');
  const [size, setSize] = useState(4);
  const [saving, setSaving] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [videoUrl, setVideoUrl] = useState(initial?.videoUrl || null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const page = pages.find((item) => item.id === pageId) || pages[0];

  useEffect(() => {
    currentPageRef.current = page;
    if (!page?.background) {
      backgroundImageRef.current = null;
      return;
    }
    const image = new Image();
    image.onload = () => { backgroundImageRef.current = image; };
    image.src = page.background;
  }, [page]);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !page) return;
    const rect = canvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.round(rect.width * ratio));
    canvas.height = Math.max(1, Math.round(rect.height * ratio));
    const ctx = canvas.getContext('2d');
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, rect.width, rect.height);
    const paint = () => page.actions.forEach((action) => drawAction(ctx, action));
    if (page.background) {
      const image = new Image();
      image.onload = () => { ctx.drawImage(image, 0, 0, rect.width, rect.height); paint(); };
      image.src = page.background;
    } else paint();
  }, [page]);

  useEffect(() => { render(); }, [render]);
  useEffect(() => {
    const listener = () => render();
    window.addEventListener('resize', listener);
    return () => window.removeEventListener('resize', listener);
  }, [render]);
  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    if (recordingFrameRef.current) cancelAnimationFrame(recordingFrameRef.current);
  }, []);

  const point = (event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      time: Date.now() - startedAt.current,
      pressure: event.pointerType === 'mouse' ? 0.5 : Math.max(0.08, event.pressure || 0.5)
    };
  };
  const start = (event) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    activeRef.current = { id: crypto.randomUUID(), tool, color, size, points: [point(event)], startTime: Date.now() - startedAt.current };
  };
  const move = (event) => {
    if (!activeRef.current) return;
    const events = event.getCoalescedEvents?.() || [event];
    events.forEach((pointerEvent) => {
      const nextPoint = point(pointerEvent);
      const previousPoint = activeRef.current.points[activeRef.current.points.length - 1];
      const distance = Math.hypot(nextPoint.x - previousPoint.x, nextPoint.y - previousPoint.y);
      if (distance >= 0.35) activeRef.current.points.push(nextPoint);
    });
    const action = activeRef.current;
    setPages((old) => old.map((item) => item.id === page.id ? { ...item, actions: [...item.actions.filter((a) => a.id !== action.id), { ...action }] } : item));
  };
  const end = () => {
    if (!activeRef.current) return;
    const action = { ...activeRef.current, endTime: Date.now() - startedAt.current };
    setPages((old) => old.map((item) => item.id === page.id ? { ...item, actions: [...item.actions.filter((a) => a.id !== action.id), action] } : item));
    activeRef.current = null;
  };

  const save = async (status) => {
    setSaving(true);
    try {
      const durationMs = Math.max(0, ...pages.flatMap((item) => item.actions.map((action) => action.endTime || 0)));
      let uploadedVideoUrl = videoUrl;
      if (recordedBlob) {
        setUploadProgress(1);
        const result = await uploadBlob(`vision/${Date.now()}-${title.trim().replace(/[^a-zA-Z0-9_-]+/g, '-').slice(0, 60) || 'ders'}.webm`, recordedBlob, {
          access: 'private',
          handleUploadUrl: '/api/vision/upload',
          multipart: true,
          contentType: 'video/webm',
          onUploadProgress: ({ percentage }) => setUploadProgress(Math.round(percentage))
        });
        uploadedVideoUrl = result.url;
        setVideoUrl(result.url);
      }
      const response = await fetch(initial?.id ? `/api/vision/${initial.id}` : '/api/vision', { method: initial?.id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, format, durationMs, status, videoUrl: uploadedVideoUrl, data: { version: 2, pages, currentPageId: pageId, cameraLayout: 'bottom-wide' } }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Kayıt başarısız.');
      toast.success(status === 'PUBLISHED' ? 'İçerik yayımlandı.' : 'Taslak kaydedildi.');
      onSaved();
    } catch (error) { toast.error(error.message); } finally { setSaving(false); setUploadProgress(0); }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return toast.error('Lütfen bir görsel seçin.');
    if (file.size > 4 * 1024 * 1024) return toast.error('Görsel en fazla 4 MB olabilir.');
    const reader = new FileReader();
    reader.onload = () => setPages((old) => old.map((item) => item.id === page.id ? { ...item, background: reader.result } : item));
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const toggleCamera = async () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop()); streamRef.current = null; setCameraOn(false); return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1920 }, height: { ideal: 1080 }, frameRate: { ideal: 30 }, facingMode: 'user' },
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 }
      });
      streamRef.current = stream; cameraRef.current.srcObject = stream; setCameraOn(true);
      await cameraRef.current.play();
      return stream;
    } catch { toast.error('Kamera açılamadı. Tarayıcı iznini kontrol edin.'); }
  };

  const drawCompositeFrame = (output, sourceCanvas, video) => {
    const ctx = output.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, output.width, output.height);
    const canvasRect = sourceCanvas.getBoundingClientRect();
    const livePage = currentPageRef.current;
    const backgroundImage = backgroundImageRef.current;
    ctx.save();
    ctx.scale(output.width / canvasRect.width, output.height / canvasRect.height);
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvasRect.width, canvasRect.height);
    if (backgroundImage?.complete) ctx.drawImage(backgroundImage, 0, 0, canvasRect.width, canvasRect.height);
    livePage?.actions?.forEach((action) => drawAction(ctx, action));
    ctx.restore();
    if (video?.readyState >= 2) {
      const x = Math.round(output.width * .04), y = Math.round(output.height * .69);
      const width = Math.round(output.width * .92), height = Math.round(output.height * .28);
      const sourceRatio = video.videoWidth / video.videoHeight, targetRatio = width / height;
      let sx = 0, sy = 0, sw = video.videoWidth, sh = video.videoHeight;
      if (sourceRatio > targetRatio) { sw = video.videoHeight * targetRatio; sx = (video.videoWidth - sw) / 2; }
      else { sh = video.videoWidth / targetRatio; sy = (video.videoHeight - sh) / 2; }
      ctx.save();
      ctx.beginPath(); ctx.roundRect(x, y, width, height, Math.max(16, output.width * .018)); ctx.clip();
      ctx.drawImage(video, sx, sy, sw, sh, x, y, width, height);
      ctx.restore();
    }
  };

  const startRecording = async () => {
    if (!window.MediaRecorder || !HTMLCanvasElement.prototype.captureStream) return toast.error('Tarayıcınız video kaydını desteklemiyor.');
    let cameraStream = streamRef.current;
    if (!cameraStream) cameraStream = await toggleCamera();
    if (!cameraStream) return;
    const dimensions = format === '9:16' ? [1080, 1920] : format === '1:1' ? [1440, 1440] : [1920, 1080];
    const output = document.createElement('canvas'); output.width = dimensions[0]; output.height = dimensions[1];
    const composedStream = output.captureStream(30);
    cameraStream.getAudioTracks().forEach((track) => composedStream.addTrack(track));
    const mimeType = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'].find((type) => MediaRecorder.isTypeSupported(type));
    const recorder = new MediaRecorder(composedStream, {
      mimeType,
      videoBitsPerSecond: format === '9:16' ? 8000000 : 6500000,
      audioBitsPerSecond: 128000
    });
    const chunks = [];
    recorder.ondataavailable = (event) => event.data.size && chunks.push(event.data);
    recorder.onstop = () => {
      if (recordingFrameRef.current) cancelAnimationFrame(recordingFrameRef.current);
      setRecordedBlob(new Blob(chunks, { type: 'video/webm' }));
      setIsRecording(false);
      toast.success('Kamera ve tahta kaydı hazır. Kaydet ve Yayımla ile sisteme aktarabilirsiniz.');
    };
    const frame = () => { drawCompositeFrame(output, canvasRef.current, cameraRef.current); recordingFrameRef.current = requestAnimationFrame(frame); };
    recorderRef.current = recorder; recorder.start(1000); frame(); setIsRecording(true); setRecordedBlob(null);
  };

  const stopRecording = () => recorderRef.current?.state === 'recording' && recorderRef.current.stop();

  const downloadVideo = () => {
    if (recordedBlob) {
      const url = URL.createObjectURL(recordedBlob); const link = document.createElement('a');
      link.href = url; link.download = `${title.trim().replace(/[^a-zA-Z0-9çğıöşüÇĞİÖŞÜ_-]+/g, '-') || 'merkur-vizyon'}.webm`; link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000); return;
    }
    if (initial?.id && videoUrl) window.location.href = `/api/vision/${initial.id}/video`;
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `${title.trim().replace(/[^a-zA-Z0-9çğıöşüÇĞİÖŞÜ_-]+/g, '-') || 'merkur-vizyon'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const tools = [['pen', Pen], ['highlighter', Highlighter], ['eraser', Eraser], ['line', Minus], ['rectangle', RectangleHorizontal], ['circle', Circle]];
  return <div className={styles.studio}>
    <div className={styles.studioHeader}>
      <button className={styles.iconButton} onClick={onClose} title="Geri"><ArrowLeft size={20} /></button>
      <input className={styles.titleInput} value={title} maxLength={180} onChange={(e) => setTitle(e.target.value)} />
      <select value={format} onChange={(e) => setFormat(e.target.value)}><option value="fullscreen">Serbest</option><option value="16:9">16:9</option><option value="9:16">9:16</option><option value="1:1">1:1</option></select>
      <label className={styles.headerButton}><ImagePlus size={18} /> Görsel<input hidden type="file" accept="image/*" onChange={handleImageUpload} /></label>
      <button className={styles.headerButton} onClick={toggleCamera}>{cameraOn ? <VideoOff size={18} /> : <Video size={18} />} Kamera</button>
      <button title="Tahta, kamera ve yalnızca mikrofon sesini kaydeder" className={isRecording ? styles.recordingButton : styles.headerButton} onClick={isRecording ? stopRecording : startRecording}><Video size={18} /> {isRecording ? 'Kaydı Bitir' : 'Kayıt Başlat'}</button>
      {(recordedBlob || videoUrl) && <button className={styles.headerButton} onClick={downloadVideo}><Download size={18} /> Videoyu indir</button>}
      <button className={styles.headerButton} onClick={downloadImage}><Download size={18} /> PNG indir</button>
      <button disabled={saving || isRecording || !title.trim()} className={styles.headerButton} onClick={() => save('DRAFT')}><Save size={18} /> {saving && uploadProgress ? `%${uploadProgress}` : 'Taslak'}</button>
      <button disabled={saving || isRecording || !title.trim()} className={styles.primaryButton} onClick={() => save('PUBLISHED')}><Save size={18} /> {saving && uploadProgress ? `Video yükleniyor %${uploadProgress}` : 'Kaydet ve Yayımla'}</button>
    </div>
    <div className={styles.workspace}>
      <aside className={styles.toolbar}>
        {tools.map(([name, Icon]) => <button key={name} title={name} className={tool === name ? styles.activeTool : ''} onClick={() => setTool(name)}><Icon size={20} /></button>)}
        <hr />
        {COLORS.map((item) => <button key={item} aria-label={item} className={styles.color} style={{ background: item, outline: color === item ? '3px solid #60a5fa' : 'none' }} onClick={() => setColor(item)} />)}
        <input aria-label="Kalınlık" type="range" min="2" max="24" value={size} onChange={(e) => setSize(Number(e.target.value))} />
        <button title="Geri al" onClick={() => setPages((old) => old.map((item) => item.id === page.id ? { ...item, actions: item.actions.slice(0, -1) } : item))}><Undo2 size={20} /></button>
        <button title="Temizle" onClick={() => confirm('Bu sayfa temizlensin mi?') && setPages((old) => old.map((item) => item.id === page.id ? { ...item, actions: [], background: null } : item))}><Trash2 size={20} /></button>
      </aside>
      <main className={styles.canvasArea}>
        <div className={`${styles.canvasShell} ${styles['format' + format.replace(':', '')]} ${isRecording ? styles.recordingShell : ''}`}>
          <canvas ref={canvasRef} onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={end} />
          <video ref={cameraRef} autoPlay muted playsInline className={`${styles.camera} ${cameraOn ? '' : styles.hidden}`} />
        </div>
      </main>
      <aside className={styles.pages}>
        <div className={styles.pagesTitle}>Sayfalar</div>
        {pages.map((item, index) => <button key={item.id} className={item.id === page.id ? styles.activePage : ''} onClick={() => setPageId(item.id)}>{index + 1}. {item.title}</button>)}
        <button onClick={() => { const item = emptyPage(pages.length + 1); setPages((old) => [...old, item]); setPageId(item.id); }}><Plus size={16} /> Sayfa ekle</button>
      </aside>
    </div>
  </div>;
}

export default function VisionManager() {
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studio, setStudio] = useState(null);
  const load = useCallback(async () => {
    setLoading(true);
    try { const response = await fetch('/api/vision'); const result = await response.json(); if (!response.ok) throw new Error(result.error); setContents(result.contents); }
    catch (error) { toast.error(error.message || 'İçerikler yüklenemedi.'); } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);
  const openExisting = async (id) => {
    const response = await fetch(`/api/vision/${id}`); const result = await response.json();
    if (!response.ok) return toast.error(result.error); setStudio(result.content);
  };
  const remove = async (id, title) => {
    if (!confirm(`“${title}” silinsin mi? Bu işlem geri alınamaz.`)) return;
    const response = await fetch(`/api/vision/${id}`, { method: 'DELETE' }); const result = await response.json();
    if (!response.ok) return toast.error(result.error); toast.success('İçerik silindi.'); load();
  };
  if (studio !== null) return <Studio initial={studio || undefined} onClose={() => setStudio(null)} onSaved={() => { setStudio(null); load(); }} />;
  return <section>
    <div className={styles.hero}><div><span className={styles.eyebrow}>Yalnızca yönetici erişimi</span><h2>Merkür Vizyon</h2><p>Dijital tahtada ders içeriği hazırlayın, kaydedin ve yönetin.</p></div><button className={styles.primaryButton} onClick={() => setStudio({})}><Plus size={19} /> Yeni içerik hazırla</button></div>
    <div className={styles.listPanel}>
      <div className={styles.listHeader}><h3>Kayıtlı içerikler</h3><span>{contents.length} içerik</span></div>
      {loading ? <p className={styles.empty}>Yükleniyor…</p> : contents.length === 0 ? <p className={styles.empty}>Henüz kayıtlı içerik yok. İlk içeriğinizi hazırlayabilirsiniz.</p> : <div className={styles.grid}>{contents.map((item) => <article key={item.id} className={styles.card}><div className={styles.cardIcon}>{item.videoUrl ? <Video size={24} /> : <Play size={24} />}</div><div><h4>{item.title}</h4><p>{item.format} · {item.videoUrl ? 'Kamera videosu var · ' : ''}{new Date(item.updatedAt).toLocaleString('tr-TR')}</p><span className={item.status === 'PUBLISHED' ? styles.published : styles.draft}>{item.status === 'PUBLISHED' ? 'Yayımlandı' : 'Taslak'}</span></div><div className={styles.cardActions}>{item.videoUrl && <a className={styles.downloadLink} href={`/api/vision/${item.id}/video`}><Download size={16} /></a>}<button onClick={() => openExisting(item.id)}>Aç</button><button className={styles.deleteButton} onClick={() => remove(item.id, item.title)}><Trash2 size={16} /></button></div></article>)}</div>}
    </div>
  </section>;
}
