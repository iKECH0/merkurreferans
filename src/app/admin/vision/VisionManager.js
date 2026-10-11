'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, Circle, Crop, Download, Eraser, FileText, Highlighter, ImagePlus, Minus, Pen, Play, Plus, RectangleHorizontal, RotateCcw, Save, Trash2, Undo2, Video, VideoOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { upload as uploadBlob } from '@vercel/blob/client';
import styles from './vision.module.css';

const COLORS = ['#111827', '#ffffff', '#ef4444', '#2563eb', '#16a34a', '#9333ea', '#f59e0b'];
const DEFAULT_BACKGROUNDS = {
  '16:9': '/vision/merkur-vizyon-horizontal.jpeg',
  '9:16': '/vision/merkur-vizyon-vertical.jpeg',
  '1:1': '/vision/merkur-vizyon-square.jpeg'
};
const emptyPage = (number = 1) => ({ id: crypto.randomUUID(), title: `Sayfa ${number}`, actions: [], background: null });
const TOOL_GROUPS = [
  { title: 'Çizim', tools: [['pen', 'Kalem', Pen], ['highlighter', 'Fosforlu', Highlighter], ['eraser', 'Silgi', Eraser]] },
  { title: 'Şekiller', tools: [['line', 'Çizgi', Minus], ['rectangle', 'Dikdörtgen', RectangleHorizontal], ['circle', 'Daire', Circle]] }
];

function drawAction(ctx, action) {
  if (!action.points?.length) return;
  const first = action.points[0];
  const last = action.points[action.points.length - 1];
  ctx.save();
  ctx.strokeStyle = action.color;
  ctx.fillStyle = action.color;
  ctx.lineWidth = action.tool === 'highlighter' ? action.size * 3 : action.tool === 'eraser' ? action.size * 2 : action.size;
  ctx.lineCap = action.tool === 'highlighter' ? 'butt' : 'round';
  ctx.lineJoin = 'round';
  if (action.tool === 'highlighter') ctx.globalAlpha = 0.35;
  if (action.tool === 'eraser') ctx.globalCompositeOperation = 'destination-out';
  if (['pen', 'highlighter', 'eraser'].includes(action.tool)) {
    if (action.points.length === 1) {
      ctx.beginPath();
      if (action.tool === 'highlighter') {
        ctx.fillRect(first.x - ctx.lineWidth / 2, first.y - ctx.lineWidth / 2, ctx.lineWidth, ctx.lineWidth);
      } else {
        ctx.arc(first.x, first.y, ctx.lineWidth / 2, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (action.tool === 'highlighter') {
      // Draw the translucent marker as one continuous stroke. Drawing every
      // segment separately makes overlapping round caps appear as dark dots.
      ctx.beginPath();
      ctx.moveTo(first.x, first.y);
      for (let index = 1; index < action.points.length - 1; index += 1) {
        const current = action.points[index];
        const next = action.points[index + 1];
        ctx.quadraticCurveTo(current.x, current.y, (current.x + next.x) / 2, (current.y + next.y) / 2);
      }
      ctx.lineTo(last.x, last.y);
      ctx.stroke();
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

function drawBackground(ctx, image, width, height) {
  if (!image?.width || !image?.height) return;
  const scale = Math.min(width / image.width, height / image.height);
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;
  ctx.drawImage(image, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight);
}

function getQuestionImageRect(image, width, height, format, requestedScale = 1.25) {
  const regions = {
    '16:9': { x: width * .19, y: height * .23, width: width * .74, height: height * .33 },
    '9:16': { x: width * .08, y: height * .25, width: width * .84, height: height * .46 },
    '1:1': { x: width * .09, y: height * .24, width: width * .82, height: height * .37 }
  };
  const region = regions[format] || { x: width * .07, y: height * .09, width: width * .86, height: height * .82 };
  const fitScale = Math.min(region.width / image.width, region.height / image.height);
  const questionScale = Math.min(1.8, Math.max(.5, Number(requestedScale) || 1.25));
  const maxScale = Math.min(width * .94 / image.width, height * .86 / image.height);
  const scale = Math.min(fitScale * questionScale, maxScale);
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;
  const centerX = region.x + region.width / 2;
  const centerY = region.y + region.height / 2;
  return {
    x: centerX - drawWidth / 2,
    y: centerY - drawHeight / 2,
    width: drawWidth,
    height: drawHeight
  };
}

function drawQuestionImage(ctx, image, width, height, format, questionScale) {
  if (!image?.width || !image?.height) return;
  const rect = getQuestionImageRect(image, width, height, format, questionScale);
  const padding = Math.max(8, Math.min(width, height) * .012);
  const radius = Math.max(10, Math.min(width, height) * .018);
  ctx.save();
  ctx.shadowColor = 'rgba(2,6,23,.24)';
  ctx.shadowBlur = Math.max(12, Math.min(width, height) * .025);
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.roundRect(rect.x - padding, rect.y - padding, rect.width + padding * 2, rect.height + padding * 2, radius);
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.drawImage(image, rect.x, rect.y, rect.width, rect.height);
  ctx.restore();
}

function Studio({ onClose, onSaved, initial }) {
  const canvasRef = useRef(null);
  const cameraRef = useRef(null);
  const streamRef = useRef(null);
  const activeRef = useRef(null);
  const recorderRef = useRef(null);
  const recordingFrameRef = useRef(null);
  const recordingOutputStreamRef = useRef(null);
  const recordingSessionRef = useRef(0);
  const cropSelectionRef = useRef(null);
  const currentPageRef = useRef(null);
  const brandBackgroundRef = useRef(null);
  const backgroundImageRef = useRef(null);
  const startedAt = useRef(Date.now());
  const initialData = initial?.data || {};
  const [title, setTitle] = useState(initial?.title || 'Yeni Vizyon Dersi');
  const [format, setFormat] = useState(initial?.format || '1:1');
  const [pages, setPages] = useState(initialData.pages?.length ? initialData.pages : [emptyPage()]);
  const [pageId, setPageId] = useState(initialData.currentPageId || initialData.pages?.[0]?.id);
  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState(DEFAULT_BACKGROUNDS[initial?.format] ? '#ffffff' : '#111827');
  const [size, setSize] = useState(4);
  const [saving, setSaving] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isFinalizingRecording, setIsFinalizingRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [videoUrl, setVideoUrl] = useState(initial?.videoUrl || null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [documentLoading, setDocumentLoading] = useState(false);
  const [cropMode, setCropMode] = useState(false);
  const [cropSelection, setCropSelection] = useState(null);
  const [backgroundAsset, setBackgroundAsset] = useState(null);
  const page = pages.find((item) => item.id === pageId) || pages[0];

  useEffect(() => {
    currentPageRef.current = page;
  }, [page]);

  useEffect(() => {
    cropSelectionRef.current = null;
    setCropSelection(null);
    setCropMode(false);
  }, [pageId, format]);

  useEffect(() => {
    const brandSource = DEFAULT_BACKGROUNDS[format] || null;
    const questionSource = page?.background || null;
    let cancelled = false;
    brandBackgroundRef.current = null;
    backgroundImageRef.current = null;
    setBackgroundAsset(null);
    const loadImage = (source) => new Promise((resolve, reject) => {
      if (!source) return resolve(null);
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = source;
    });
    Promise.all([loadImage(brandSource), loadImage(questionSource)]).then(([brandImage, questionImage]) => {
      if (cancelled) return;
      brandBackgroundRef.current = brandImage;
      backgroundImageRef.current = questionImage;
      setBackgroundAsset({ brandSource, questionSource, brandImage, questionImage });
    }).catch(() => {
      if (cancelled) return;
      brandBackgroundRef.current = null;
      backgroundImageRef.current = null;
      setBackgroundAsset(null);
      toast.error('Tahta görsellerinden biri yüklenemedi.');
    });
    return () => { cancelled = true; };
  }, [page?.background, format]);

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
    const brandSource = DEFAULT_BACKGROUNDS[format] || null;
    const questionSource = page.background || null;
    if (backgroundAsset?.brandSource === brandSource && backgroundAsset.brandImage?.complete) {
      drawBackground(ctx, backgroundAsset.brandImage, rect.width, rect.height);
    }
    if (backgroundAsset?.questionSource === questionSource && backgroundAsset.questionImage?.complete) {
      drawQuestionImage(ctx, backgroundAsset.questionImage, rect.width, rect.height, format, page.questionScale);
    }
    page.actions.forEach((action) => drawAction(ctx, action));
  }, [page, format, backgroundAsset]);

  useEffect(() => { render(); }, [render]);
  useEffect(() => {
    const listener = () => render();
    window.addEventListener('resize', listener);
    return () => window.removeEventListener('resize', listener);
  }, [render]);
  useEffect(() => () => {
    recordingSessionRef.current += 1;
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
    recordingOutputStreamRef.current?.getVideoTracks().forEach((track) => track.stop());
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
    if (cropMode) {
      if (!page.background) return toast.error('Kırpmak için önce bir PDF veya görsel ekleyin.');
      const origin = point(event);
      const selection = { start: origin, end: origin };
      cropSelectionRef.current = selection;
      setCropSelection(selection);
      return;
    }
    activeRef.current = { id: crypto.randomUUID(), tool, color, size, points: [point(event)], startTime: Date.now() - startedAt.current };
  };
  const move = (event) => {
    if (cropMode && cropSelectionRef.current) {
      const selection = { ...cropSelectionRef.current, end: point(event) };
      cropSelectionRef.current = selection;
      setCropSelection(selection);
      return;
    }
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
  const applyCrop = (selection) => {
    const canvas = canvasRef.current;
    const image = backgroundImageRef.current;
    if (!canvas || !image?.width || !image?.height || !selection) return toast.error('PDF sayfası henüz hazırlanıyor. Birkaç saniye sonra tekrar deneyin.');
    const rect = canvas.getBoundingClientRect();
    const questionRect = getQuestionImageRect(image, rect.width, rect.height, format, page.questionScale);
    const displayScale = questionRect.width / image.width;
    const displayWidth = questionRect.width;
    const displayHeight = questionRect.height;
    const offsetX = questionRect.x;
    const offsetY = questionRect.y;
    const left = Math.max(offsetX, Math.min(selection.start.x, selection.end.x));
    const top = Math.max(offsetY, Math.min(selection.start.y, selection.end.y));
    const right = Math.min(offsetX + displayWidth, Math.max(selection.start.x, selection.end.x));
    const bottom = Math.min(offsetY + displayHeight, Math.max(selection.start.y, selection.end.y));
    if (right - left < 20 || bottom - top < 20) {
      toast.error('Kırpılacak alan çok küçük. Daha geniş bir alan seçin.');
      return;
    }
    const sourceX = Math.max(0, Math.round((left - offsetX) / displayScale));
    const sourceY = Math.max(0, Math.round((top - offsetY) / displayScale));
    const sourceWidth = Math.min(image.width - sourceX, Math.round((right - left) / displayScale));
    const sourceHeight = Math.min(image.height - sourceY, Math.round((bottom - top) / displayScale));
    const outputScale = Math.min(1, 2400 / Math.max(sourceWidth, sourceHeight));
    const cropCanvas = document.createElement('canvas');
    cropCanvas.width = Math.max(1, Math.round(sourceWidth * outputScale));
    cropCanvas.height = Math.max(1, Math.round(sourceHeight * outputScale));
    const context = cropCanvas.getContext('2d', { alpha: false });
    context.fillStyle = '#fff';
    context.fillRect(0, 0, cropCanvas.width, cropCanvas.height);
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, cropCanvas.width, cropCanvas.height);
    const croppedBackground = cropCanvas.toDataURL('image/jpeg', 0.92);
    setPages((old) => old.map((item) => item.id === page.id ? {
      ...item,
      backgroundHistory: [...(item.backgroundHistory || []).slice(-4), item.background],
      background: croppedBackground
    } : item));
    setCropMode(false);
    toast.success('Seçilen alan kırpıldı.');
  };
  const end = () => {
    if (cropMode && cropSelectionRef.current) {
      const selection = cropSelectionRef.current;
      cropSelectionRef.current = null;
      setCropSelection(null);
      applyCrop(selection);
      return;
    }
    if (!activeRef.current) return;
    const action = { ...activeRef.current, endTime: Date.now() - startedAt.current };
    setPages((old) => old.map((item) => item.id === page.id ? { ...item, actions: [...item.actions.filter((a) => a.id !== action.id), action] } : item));
    activeRef.current = null;
  };

  const undoCrop = () => {
    if (!page.backgroundHistory?.length) return;
    setPages((old) => old.map((item) => {
      if (item.id !== page.id) return item;
      const history = [...item.backgroundHistory];
      const previousBackground = history.pop();
      return { ...item, background: previousBackground, backgroundHistory: history };
    }));
    setCropMode(false);
    setCropSelection(null);
    cropSelectionRef.current = null;
    toast.success('Son kırpma geri alındı.');
  };

  const setQuestionScale = (questionScale) => {
    setPages((old) => old.map((item) => item.id === page.id ? { ...item, questionScale } : item));
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
      const cameraLayout = format === '1:1' ? 'bottom-square' : format === '9:16' ? 'bottom-portrait-compact' : 'bottom-compact';
      const response = await fetch(initial?.id ? `/api/vision/${initial.id}` : '/api/vision', { method: initial?.id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, format, durationMs, status, videoUrl: uploadedVideoUrl, data: { version: 2, pages, currentPageId: pageId, cameraLayout } }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Kayıt başarısız.');
      toast.success(status === 'PUBLISHED' ? 'İçerik yayımlandı.' : 'Taslak kaydedildi.');
      onSaved();
    } catch (error) { toast.error(error.message); } finally { setSaving(false); setUploadProgress(0); }
  };

  const handleDocumentUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) return toast.error('Dosya en fazla 15 MB olabilir.');
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => setPages((old) => old.map((item) => item.id === page.id ? { ...item, background: reader.result, backgroundHistory: [], questionScale: 1.25 } : item));
      reader.readAsDataURL(file);
      return;
    }
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) return toast.error('Lütfen bir görsel veya PDF seçin.');
    setDocumentLoading(true);
    try {
      const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
      pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
      const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
      if (pdf.numPages > 20) throw new Error('PDF en fazla 20 sayfa olabilir.');
      const importedPages = [];
      let estimatedPayloadSize = 0;
      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        const pdfPage = await pdf.getPage(pageNumber);
        const naturalViewport = pdfPage.getViewport({ scale: 1 });
        const scale = Math.min(2, 1500 / Math.max(naturalViewport.width, naturalViewport.height));
        const viewport = pdfPage.getViewport({ scale });
        const pdfCanvas = document.createElement('canvas');
        pdfCanvas.width = Math.ceil(viewport.width);
        pdfCanvas.height = Math.ceil(viewport.height);
        const context = pdfCanvas.getContext('2d', { alpha: false });
        context.fillStyle = '#ffffff'; context.fillRect(0, 0, pdfCanvas.width, pdfCanvas.height);
        await pdfPage.render({ canvasContext: context, viewport }).promise;
        const background = pdfCanvas.toDataURL('image/jpeg', 0.84);
        estimatedPayloadSize += background.length;
        if (estimatedPayloadSize > 6.5 * 1024 * 1024) throw new Error('PDF içeriği kaydetme sınırını aşıyor. Daha küçük bir PDF deneyin.');
        importedPages.push({
          id: crypto.randomUUID(),
          title: `${file.name.replace(/\.pdf$/i, '')} · ${pageNumber}`,
          actions: [],
          background,
          questionScale: 1.25
        });
      }
      setPages((old) => [...old, ...importedPages]);
      setPageId(importedPages[0].id);
      toast.success(`${importedPages.length} PDF sayfası tahtaya eklendi.`);
    } catch (error) {
      console.error('PDF import failed:', error);
      toast.error(error.message || 'PDF eklenemedi.');
    } finally {
      setDocumentLoading(false);
    }
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
    const brandImage = brandBackgroundRef.current;
    const questionImage = backgroundImageRef.current;
    ctx.save();
    ctx.scale(output.width / canvasRect.width, output.height / canvasRect.height);
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvasRect.width, canvasRect.height);
    if (brandImage?.complete) drawBackground(ctx, brandImage, canvasRect.width, canvasRect.height);
    if (questionImage?.complete) drawQuestionImage(ctx, questionImage, canvasRect.width, canvasRect.height, format, livePage?.questionScale);
    livePage?.actions?.forEach((action) => drawAction(ctx, action));
    ctx.restore();
    if (video?.readyState >= 2) {
      const squareCamera = format === '1:1';
      const portraitCamera = format === '9:16';
      const x = Math.round(output.width * (squareCamera ? .34 : portraitCamera ? .15 : .31));
      const y = Math.round(output.height * (squareCamera ? .65 : portraitCamera ? .75 : .59));
      const width = Math.round(output.width * (squareCamera ? .32 : portraitCamera ? .70 : .38));
      const height = Math.round(output.height * (squareCamera ? .32 : portraitCamera ? .22 : .38));
      const sourceRatio = video.videoWidth / video.videoHeight, targetRatio = width / height;
      let sx = 0, sy = 0, sw = video.videoWidth, sh = video.videoHeight;
      if (sourceRatio > targetRatio) { sw = video.videoHeight * targetRatio; sx = (video.videoWidth - sw) / 2; }
      else { sh = video.videoWidth / targetRatio; sy = (video.videoHeight - sh) / 2; }
      ctx.save();
      ctx.beginPath(); ctx.roundRect(x, y, width, height, Math.max(16, output.width * .018)); ctx.clip();
      ctx.drawImage(video, sx, sy, sw, sh, x, y, width, height);
      ctx.restore();
      ctx.save();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = Math.max(4, output.width * .004);
      ctx.beginPath();
      ctx.roundRect(x, y, width, height, Math.max(16, output.width * .018));
      ctx.stroke();
      ctx.restore();
    }
  };

  const startRecording = async () => {
    if (!window.MediaRecorder || !HTMLCanvasElement.prototype.captureStream) return toast.error('Tarayıcınız video kaydını desteklemiyor.');
    if (isRecording || isFinalizingRecording) return;
    try {
      let cameraStream = streamRef.current;
      const hasLiveVideo = cameraStream?.getVideoTracks().some((track) => track.readyState === 'live');
      const hasLiveAudio = cameraStream?.getAudioTracks().some((track) => track.readyState === 'live');
      if (!cameraStream?.active || !hasLiveVideo || !hasLiveAudio) {
        cameraStream?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        setCameraOn(false);
        cameraStream = await toggleCamera();
      }
      if (!cameraStream?.active) throw new Error('Kamera ve mikrofon akışı başlatılamadı.');
      if (cameraRef.current?.readyState < 2) {
        await new Promise((resolve, reject) => {
          const timeout = window.setTimeout(() => reject(new Error('Kamera görüntüsü hazırlanamadı.')), 5000);
          cameraRef.current.addEventListener('loadeddata', () => { window.clearTimeout(timeout); resolve(); }, { once: true });
        });
      }

      if (recordingFrameRef.current) cancelAnimationFrame(recordingFrameRef.current);
      recordingOutputStreamRef.current?.getVideoTracks().forEach((track) => track.stop());
      const sessionId = recordingSessionRef.current + 1;
      recordingSessionRef.current = sessionId;
      const dimensions = format === '9:16' ? [1080, 1920] : format === '1:1' ? [1440, 1440] : [1920, 1080];
      const output = document.createElement('canvas'); output.width = dimensions[0]; output.height = dimensions[1];
      const composedStream = output.captureStream(30);
      cameraStream.getAudioTracks().filter((track) => track.readyState === 'live').forEach((track) => composedStream.addTrack(track));
      recordingOutputStreamRef.current = composedStream;
      const mimeType = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'].find((type) => MediaRecorder.isTypeSupported(type));
      if (!mimeType) throw new Error('Tarayıcınızda desteklenen video kodlayıcı bulunamadı.');
      const recorder = new MediaRecorder(composedStream, {
        mimeType,
        videoBitsPerSecond: format === '9:16' ? 8000000 : 6500000,
        audioBitsPerSecond: 128000
      });
      const chunks = [];
      const finish = () => {
        if (recordingFrameRef.current) cancelAnimationFrame(recordingFrameRef.current);
        composedStream.getVideoTracks().forEach((track) => track.stop());
        if (recordingSessionRef.current !== sessionId) return;
        recorderRef.current = null;
        recordingOutputStreamRef.current = null;
        setIsRecording(false);
        setIsFinalizingRecording(false);
      };
      recorder.ondataavailable = (event) => { if (event.data?.size) chunks.push(event.data); };
      recorder.onerror = (event) => {
        finish();
        console.error('Vision MediaRecorder error:', event.error || event);
        toast.error('Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.');
      };
      recorder.onstop = () => {
        finish();
        if (!chunks.length) return toast.error('Video verisi oluşturulamadı. Lütfen kaydı tekrar başlatın.');
        setRecordedBlob(new Blob(chunks, { type: mimeType }));
        toast.success('Yeni kamera ve tahta kaydı hazır. Tekrar kayıt alabilir veya videoyu kaydedebilirsiniz.');
      };
      const frame = () => {
        if (recordingSessionRef.current !== sessionId || recorder.state === 'inactive') return;
        drawCompositeFrame(output, canvasRef.current, cameraRef.current);
        recordingFrameRef.current = requestAnimationFrame(frame);
      };
      recorderRef.current = recorder;
      setRecordedBlob(null);
      setIsFinalizingRecording(false);
      recorder.start(500);
      setIsRecording(true);
      frame();
    } catch (error) {
      recorderRef.current = null;
      recordingOutputStreamRef.current?.getVideoTracks().forEach((track) => track.stop());
      recordingOutputStreamRef.current = null;
      setIsRecording(false);
      setIsFinalizingRecording(false);
      console.error('Vision recording could not start:', error);
      toast.error(error.message || 'Kayıt başlatılamadı.');
    }
  };

  const stopRecording = () => {
    const recorder = recorderRef.current;
    if (recorder?.state !== 'recording') return;
    setIsFinalizingRecording(true);
    try { recorder.requestData(); } catch {}
    recorder.stop();
  };

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

  const cameraStyle = format === '1:1'
    ? { left: '34%', bottom: '3%', width: '32%', height: '32%' }
    : format === '9:16'
      ? { left: '15%', bottom: '3%', width: '70%', height: '22%' }
      : { left: '31%', bottom: '3%', width: '38%', height: '38%' };

  return <div className={styles.studio}>
    <div className={styles.studioHeader}>
      <button className={styles.iconButton} onClick={onClose} title="Geri"><ArrowLeft size={20} /></button>
      <input className={styles.titleInput} value={title} maxLength={180} onChange={(e) => setTitle(e.target.value)} />
      <select value={format} onChange={(e) => { const nextFormat = e.target.value; setFormat(nextFormat); if (DEFAULT_BACKGROUNDS[nextFormat] && color === '#111827') setColor('#ffffff'); else if (!DEFAULT_BACKGROUNDS[nextFormat] && color === '#ffffff') setColor('#111827'); }}><option value="fullscreen">Serbest</option><option value="16:9">16:9</option><option value="9:16">9:16</option><option value="1:1">1:1</option></select>
      <label className={`${styles.headerButton} ${documentLoading ? styles.disabledButton : ''}`}><ImagePlus size={18} /> {documentLoading ? 'PDF hazırlanıyor…' : 'Görsel / PDF'}<input disabled={documentLoading} hidden type="file" accept="image/*,.pdf,application/pdf" onChange={handleDocumentUpload} /></label>
      {page?.background && <button className={`${styles.headerButton} ${cropMode ? styles.cropActive : ''}`} onClick={() => { setCropMode((value) => !value); setCropSelection(null); cropSelectionRef.current = null; }} title="Tahta üzerinde kırpılacak alanı sürükleyerek seçin"><Crop size={18} /> {cropMode ? 'Kırpmayı İptal Et' : 'PDF / Görsel Kırp'}</button>}
      {!!page?.backgroundHistory?.length && <button className={styles.headerButton} onClick={undoCrop} title="Son kırpmayı geri al"><RotateCcw size={18} /> Kırpmayı Geri Al</button>}
      <button className={styles.headerButton} onClick={toggleCamera}>{cameraOn ? <VideoOff size={18} /> : <Video size={18} />} Kamera</button>
      <button disabled={isFinalizingRecording} title="Tahta, kamera ve yalnızca mikrofon sesini kaydeder" className={isRecording ? styles.recordingButton : styles.headerButton} onClick={isRecording ? stopRecording : startRecording}><Video size={18} /> {isFinalizingRecording ? 'Video hazırlanıyor…' : isRecording ? 'Kaydı Bitir' : recordedBlob ? 'Yeni Kayıt Başlat' : 'Kayıt Başlat'}</button>
      {(recordedBlob || videoUrl) && <button className={styles.headerButton} onClick={downloadVideo}><Download size={18} /> Videoyu indir</button>}
      <button className={styles.headerButton} onClick={downloadImage}><Download size={18} /> PNG indir</button>
      <button disabled={saving || isRecording || isFinalizingRecording || !title.trim()} className={styles.headerButton} onClick={() => save('DRAFT')}><Save size={18} /> {saving && uploadProgress ? `%${uploadProgress}` : 'Taslak'}</button>
      <button disabled={saving || isRecording || isFinalizingRecording || !title.trim()} className={styles.primaryButton} onClick={() => save('PUBLISHED')}><Save size={18} /> {saving && uploadProgress ? `Video yükleniyor %${uploadProgress}` : 'Kaydet ve Yayımla'}</button>
    </div>
    <div className={styles.workspace}>
      <aside className={styles.toolbar}>
        <div className={styles.toolbarBrand}><div className={styles.toolbarBrandIcon}><Pen size={18} /></div><div><strong>Kalem Paneli</strong><span>Çizim araçları</span></div></div>
        {TOOL_GROUPS.map((group) => <section className={styles.toolSection} key={group.title}>
          <p>{group.title}</p>
          <div className={styles.toolGrid}>{group.tools.map(([name, label, Icon]) => <button key={name} title={label} className={tool === name ? styles.activeTool : ''} onClick={() => setTool(name)}><Icon size={19} /><span>{label}</span></button>)}</div>
        </section>)}
        <section className={styles.toolSection}>
          <p>Renk</p>
          <div className={styles.colorGrid}>{COLORS.map((item) => <button key={item} aria-label={item} className={`${styles.color} ${color === item ? styles.activeColor : ''}`} style={{ background: item }} onClick={() => setColor(item)} />)}</div>
        </section>
        <section className={styles.toolSection}>
          <div className={styles.rangeLabel}><p>Kalınlık</p><span>{size}px</span></div>
          <input className={styles.sizeRange} aria-label="Kalınlık" type="range" min="2" max="24" value={size} onChange={(e) => setSize(Number(e.target.value))} />
          <div className={styles.strokePreview}><span style={{ width: Math.min(46, size * 2), height: Math.max(2, size / 2), background: color }} /></div>
        </section>
        {page.background && <section className={styles.toolSection}>
          <div className={styles.rangeLabel}><p>Soru Boyutu</p><span>{Math.round((page.questionScale || 1.25) * 100)}%</span></div>
          <input className={styles.sizeRange} aria-label="Soru görseli boyutu" type="range" min="50" max="180" step="5" value={Math.round((page.questionScale || 1.25) * 100)} onChange={(e) => setQuestionScale(Number(e.target.value) / 100)} />
          <div className={styles.actionGrid}>
            <button title="Soruyu çalışma alanına sığdır" onClick={() => setQuestionScale(1)}><ImagePlus size={18} /><span>Sığdır</span></button>
            <button title="Soruyu büyük göster" onClick={() => setQuestionScale(1.5)}><Plus size={18} /><span>Büyük</span></button>
          </div>
        </section>}
        <section className={styles.toolSection}>
          <p>İşlemler</p>
          <div className={styles.actionGrid}><button title="Geri al" onClick={() => setPages((old) => old.map((item) => item.id === page.id ? { ...item, actions: item.actions.slice(0, -1) } : item))}><Undo2 size={19} /><span>Geri Al</span></button><button className={styles.clearTool} title="Temizle" onClick={() => confirm('Bu sayfa temizlensin mi?') && setPages((old) => old.map((item) => item.id === page.id ? { ...item, actions: [], background: null, backgroundHistory: [] } : item))}><Trash2 size={19} /><span>Temizle</span></button></div>
        </section>
      </aside>
      <main className={styles.canvasArea}>
        <div className={`${styles.canvasShell} ${styles['format' + format.replace(':', '')]} ${isRecording ? styles.recordingShell : ''}`}>
          <canvas className={cropMode ? styles.cropCursor : ''} ref={canvasRef} onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={end} />
          {cropMode && cropSelection && <div className={styles.cropSelection} style={{ left: Math.min(cropSelection.start.x, cropSelection.end.x), top: Math.min(cropSelection.start.y, cropSelection.end.y), width: Math.abs(cropSelection.end.x - cropSelection.start.x), height: Math.abs(cropSelection.end.y - cropSelection.start.y) }} />}
          <video ref={cameraRef} autoPlay muted playsInline style={cameraStyle} className={`${styles.camera} ${cameraOn ? '' : styles.hidden}`} />
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
