'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, Circle, Crop, Download, Eraser, FileText, Highlighter, ImagePlus, Minus, MousePointer2, Move, Pen, Play, Plus, RectangleHorizontal, RotateCcw, Save, Trash2, Undo2, Video, VideoOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { upload as uploadBlob } from '@vercel/blob/client';
import styles from './vision.module.css';

const COLORS = ['#111827', '#ffffff', '#ef4444', '#2563eb', '#16a34a', '#9333ea', '#f59e0b'];
const DEFAULT_BACKGROUNDS = {
  '16:9': '/vision/merkur-vizyon-horizontal.jpeg',
  '9:16': '/vision/merkur-vizyon-vertical.jpeg',
  '1:1': '/vision/merkur-vizyon-square.jpeg'
};
const DEFAULT_CAMERA_LAYOUTS = {
  '1:1': { x: 69, y: 5, width: 26, height: 26 },
  '9:16': { x: 61, y: 8, width: 33, height: 18 },
  '16:9': { x: 73, y: 6, width: 23, height: 31 },
  fullscreen: { x: 73, y: 6, width: 23, height: 31 }
};
const CAMERA_BACKGROUNDS = [
  { id: 'none', label: 'Fonsuz', source: null },
  { id: 'background-1', label: 'Fon 1', source: '/vision/camera-backgrounds/1.jpeg' },
  { id: 'background-2', label: 'Fon 2', source: '/vision/camera-backgrounds/2.jpeg' }
];
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const emptyPage = (number = 1) => ({ id: crypto.randomUUID(), title: `Sayfa ${number}`, actions: [], background: null });
const TOOL_GROUPS = [
  { title: 'Sunum', tools: [['laser', 'Lazer (1 sn)', MousePointer2]] },
  { title: 'Çizim', tools: [['pen', 'Kalem', Pen], ['highlighter', 'Fosforlu', Highlighter], ['eraser', 'Silgi', Eraser]] },
  { title: 'Şekiller', tools: [['line', 'Çizgi', Minus], ['rectangle', 'Dikdörtgen', RectangleHorizontal], ['circle', 'Daire', Circle]] }
];

function drawAction(ctx, action) {
  if (!action.points?.length) return;
  if (action.expiresAt && action.expiresAt <= Date.now()) return;
  // A laser click without movement should not leave a round pulse on screen.
  if (action.tool === 'laser' && action.points.length < 2) return;
  const first = action.points[0];
  const last = action.points[action.points.length - 1];
  ctx.save();
  ctx.strokeStyle = action.color;
  ctx.fillStyle = action.color;
  ctx.lineWidth = action.tool === 'highlighter' ? action.size * 3 : action.tool === 'eraser' && !action.eraserDiameter ? action.size * 2 : action.size;
  ctx.lineCap = ['highlighter', 'laser'].includes(action.tool) ? 'butt' : 'round';
  ctx.lineJoin = 'round';
  const opacity = Math.min(1, Math.max(.1, action.opacity ?? 1));
  const fade = action.expiresAt ? Math.min(1, Math.max(0, (action.expiresAt - Date.now()) / 1000)) : 1;
  ctx.globalAlpha = action.tool === 'highlighter' ? 0.35 * opacity : opacity * fade;
  if (action.tool === 'laser') {
    ctx.shadowColor = action.color;
    ctx.shadowBlur = action.size * 2.5;
  }
  if (action.tool === 'eraser') ctx.globalCompositeOperation = 'destination-out';
  if (['pen', 'highlighter', 'eraser', 'laser'].includes(action.tool)) {
    if (action.points.length === 1) {
      ctx.beginPath();
      if (action.tool === 'highlighter') {
        ctx.fillRect(first.x - ctx.lineWidth / 2, first.y - ctx.lineWidth / 2, ctx.lineWidth, ctx.lineWidth);
      } else {
        ctx.arc(first.x, first.y, ctx.lineWidth / 2, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (['highlighter', 'laser'].includes(action.tool)) {
      // Translucent tools must be a single path. Separate segments expose
      // overlapping caps as dots while fading. A single laser path also keeps
      // the complete stroke in place and fades it uniformly instead of making
      // it look as though it is retracting from one end.
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
        if (action.tool === 'pen' && action.pressureEnabled !== false) {
          const pressure = Number.isFinite(current.pressure) && current.pressure > 0 ? current.pressure : 0.5;
          const previousPressure = Number.isFinite(action.points[index - 1]?.pressure) ? action.points[index - 1].pressure : pressure;
          const smoothedPressure = previousPressure * .65 + pressure * .35;
          const pressureRange = action.penStyle === 'fountain' ? 0.8 : action.penStyle === 'technical' ? 0.22 : 0.48;
          const pressureBase = action.penStyle === 'fountain' ? 0.55 : action.penStyle === 'technical' ? 0.9 : 0.76;
          ctx.lineWidth = action.size * (pressureBase + smoothedPressure * pressureRange);
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

function getQuestionImageRect(image, width, height, format, requestedScale = 1.25, positionX = 0, positionY = 0) {
  const regions = {
    '16:9': { x: width * .19, y: height * .23, width: width * .74, height: height * .33 },
    '9:16': { x: width * .08, y: height * .25, width: width * .84, height: height * .46 },
    '1:1': { x: width * .09, y: height * .24, width: width * .82, height: height * .37 }
  };
  const region = regions[format] || { x: width * .07, y: height * .09, width: width * .86, height: height * .82 };
  const fitScale = Math.min(region.width / image.width, region.height / image.height);
  const questionScale = Math.min(5, Math.max(.25, Number(requestedScale) || 1.25));
  const scale = fitScale * questionScale;
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;
  const offsetX = Math.min(50, Math.max(-50, Number(positionX) || 0)) / 100 * width * .55;
  const offsetY = Math.min(50, Math.max(-50, Number(positionY) || 0)) / 100 * height * .55;
  const centerX = region.x + region.width / 2 + offsetX;
  const centerY = region.y + region.height / 2 + offsetY;
  const margin = Math.max(8, Math.min(width, height) * .025);
  const minX = drawWidth <= width - margin * 2 ? margin : width - drawWidth - margin;
  const maxX = drawWidth <= width - margin * 2 ? width - drawWidth - margin : margin;
  const minY = drawHeight <= height - margin * 2 ? margin : height - drawHeight - margin;
  const maxY = drawHeight <= height - margin * 2 ? height - drawHeight - margin : margin;
  return {
    x: clamp(centerX - drawWidth / 2, minX, maxX),
    y: clamp(centerY - drawHeight / 2, minY, maxY),
    width: drawWidth,
    height: drawHeight
  };
}

function drawQuestionImage(ctx, image, width, height, format, questionScale, questionX, questionY) {
  if (!image?.width || !image?.height) return;
  const rect = getQuestionImageRect(image, width, height, format, questionScale, questionX, questionY);
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

function drawActionsLayer(ctx, actions, width, height, pixelRatio = 1) {
  const ratio = Math.max(1, Math.min(3, pixelRatio || 1));
  const layer = document.createElement('canvas');
  layer.width = Math.max(1, Math.round(width * ratio));
  layer.height = Math.max(1, Math.round(height * ratio));
  const layerContext = layer.getContext('2d');
  layerContext.setTransform(ratio, 0, 0, ratio, 0, 0);
  layerContext.imageSmoothingEnabled = true;
  layerContext.imageSmoothingQuality = 'high';
  actions?.forEach((action) => drawAction(layerContext, action));
  ctx.drawImage(layer, 0, 0, layer.width, layer.height, 0, 0, width, height);
}

function Studio({ onClose, onSaved, initial }) {
  const canvasRef = useRef(null);
  const cameraRef = useRef(null);
  const cameraCompositeRef = useRef(null);
  const cameraCompositeReadyRef = useRef(false);
  const cameraSegmentationRef = useRef(null);
  const cameraSegmentationFrameRef = useRef(null);
  const streamRef = useRef(null);
  const activeRef = useRef(null);
  const recorderRef = useRef(null);
  const recordingFrameRef = useRef(null);
  const drawingFrameRef = useRef(null);
  const recordingOutputStreamRef = useRef(null);
  const recordingSessionRef = useRef(0);
  const cropSelectionRef = useRef(null);
  const questionResizeRef = useRef(null);
  const questionMoveRef = useRef(null);
  const cameraTransformRef = useRef(null);
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
  const [penSize, setPenSize] = useState(3);
  const [highlighterSize, setHighlighterSize] = useState(8);
  const [eraserSize, setEraserSize] = useState(32);
  const [laserSize, setLaserSize] = useState(5);
  const [strokeOpacity, setStrokeOpacity] = useState(100);
  const [pressureEnabled, setPressureEnabled] = useState(true);
  const [penStyle, setPenStyle] = useState('natural');
  const [laserTick, setLaserTick] = useState(0);
  const [saving, setSaving] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraBackground, setCameraBackground] = useState(initialData.cameraBackground || 'none');
  const [cameraBackgroundSource, setCameraBackgroundSource] = useState(() => CAMERA_BACKGROUNDS.find((item) => item.id === initialData.cameraBackground)?.source || null);
  const [cameraBackgroundBusy, setCameraBackgroundBusy] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isFinalizingRecording, setIsFinalizingRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [videoUrl, setVideoUrl] = useState(initial?.videoUrl || null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [documentLoading, setDocumentLoading] = useState(false);
  const [cropMode, setCropMode] = useState(false);
  const [cropSelection, setCropSelection] = useState(null);
  const [backgroundAsset, setBackgroundAsset] = useState(null);
  const [cameraLayouts, setCameraLayouts] = useState(initialData.cameraLayouts || {});
  const page = pages.find((item) => item.id === pageId) || pages[0];
  const activeSize = tool === 'eraser' ? eraserSize : tool === 'highlighter' ? highlighterSize : tool === 'laser' ? laserSize : penSize;
  const setActiveSize = tool === 'eraser' ? setEraserSize : tool === 'highlighter' ? setHighlighterSize : tool === 'laser' ? setLaserSize : setPenSize;

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

  useEffect(() => {
    if (!cameraOn || !cameraBackgroundSource) {
      cameraCompositeReadyRef.current = false;
      setCameraBackgroundBusy(false);
      if (cameraSegmentationFrameRef.current) cancelAnimationFrame(cameraSegmentationFrameRef.current);
      cameraSegmentationFrameRef.current = null;
      cameraSegmentationRef.current?.close?.();
      cameraSegmentationRef.current = null;
      return;
    }
    let cancelled = false;
    let processing = false;
    cameraCompositeReadyRef.current = false;
    setCameraBackgroundBusy(true);
    const backgroundImage = new Image();
    backgroundImage.src = cameraBackgroundSource;
    const refinedMask = document.createElement('canvas');
    const refinedMaskContext = refinedMask.getContext('2d', { willReadFrequently: true });
    let previousMaskAlpha = null;
    const run = async () => {
      try {
        await backgroundImage.decode();
        const { SelfieSegmentation } = await import('@mediapipe/selfie_segmentation');
        if (cancelled) return;
        const segmenter = new SelfieSegmentation({ locateFile: (file) => `/mediapipe/selfie_segmentation/${file}` });
        segmenter.setOptions({ modelSelection: 1, selfieMode: true });
        segmenter.onResults((results) => {
          if (cancelled) return;
          const output = cameraCompositeRef.current;
          const video = cameraRef.current;
          if (!output || !video?.videoWidth || !results.segmentationMask) return;
          output.width = video.videoWidth;
          output.height = video.videoHeight;
          // Work at a higher mask resolution so the cutout follows hair and
          // shoulders closely instead of producing a wide, soft halo.
          const maskWidth = Math.min(512, video.videoWidth);
          const maskHeight = Math.max(1, Math.round(maskWidth * video.videoHeight / video.videoWidth));
          if (refinedMask.width !== maskWidth || refinedMask.height !== maskHeight) {
            refinedMask.width = maskWidth;
            refinedMask.height = maskHeight;
            previousMaskAlpha = null;
          }
          refinedMaskContext.clearRect(0, 0, maskWidth, maskHeight);
          refinedMaskContext.drawImage(results.segmentationMask, 0, 0, maskWidth, maskHeight);
          const maskData = refinedMaskContext.getImageData(0, 0, maskWidth, maskHeight);
          if (!previousMaskAlpha || previousMaskAlpha.length !== maskWidth * maskHeight) previousMaskAlpha = new Uint8ClampedArray(maskWidth * maskHeight);
          for (let pixel = 0, alphaIndex = 0; pixel < maskData.data.length; pixel += 4, alphaIndex += 1) {
            const confidence = Math.max(maskData.data[pixel], maskData.data[pixel + 1], maskData.data[pixel + 2]) / 255;
            // Reject low-confidence background pixels aggressively. Bright
            // backlights otherwise get carried into the cutout as an aura.
            const normalized = clamp((confidence - .68) / .22, 0, 1);
            const softened = normalized * normalized * (3 - 2 * normalized);
            const alpha = Math.round((previousMaskAlpha[alphaIndex] * .16) + (softened * 255 * .84));
            previousMaskAlpha[alphaIndex] = alpha;
            maskData.data[pixel] = 255;
            maskData.data[pixel + 1] = 255;
            maskData.data[pixel + 2] = 255;
            maskData.data[pixel + 3] = alpha;
          }
          refinedMaskContext.putImageData(maskData, 0, 0);
          const context = output.getContext('2d');
          context.clearRect(0, 0, output.width, output.height);
          context.save();
          context.imageSmoothingEnabled = true;
          context.imageSmoothingQuality = 'high';
          context.drawImage(refinedMask, 0, 0, output.width, output.height);
          context.globalCompositeOperation = 'source-in';
          context.drawImage(results.image, 0, 0, output.width, output.height);
          context.globalCompositeOperation = 'destination-over';
          const scale = Math.max(output.width / backgroundImage.width, output.height / backgroundImage.height);
          const backgroundWidth = backgroundImage.width * scale;
          const backgroundHeight = backgroundImage.height * scale;
          context.drawImage(backgroundImage, (output.width - backgroundWidth) / 2, (output.height - backgroundHeight) / 2, backgroundWidth, backgroundHeight);
          context.restore();
          cameraCompositeReadyRef.current = true;
          setCameraBackgroundBusy(false);
        });
        cameraSegmentationRef.current = segmenter;
        const processFrame = async () => {
          if (cancelled) return;
          const video = cameraRef.current;
          if (!processing && video?.readyState >= 2) {
            processing = true;
            try { await segmenter.send({ image: video }); } catch (error) { console.error('Camera background processing failed:', error); }
            processing = false;
          }
          cameraSegmentationFrameRef.current = requestAnimationFrame(processFrame);
        };
        processFrame();
      } catch (error) {
        console.error('Virtual camera background failed:', error);
        setCameraBackgroundBusy(false);
        toast.error('Sanal kamera fonu başlatılamadı. Fonsuz kamera kullanılacak.');
      }
    };
    run();
    return () => {
      cancelled = true;
      cameraCompositeReadyRef.current = false;
      if (cameraSegmentationFrameRef.current) cancelAnimationFrame(cameraSegmentationFrameRef.current);
      cameraSegmentationFrameRef.current = null;
      cameraSegmentationRef.current?.close?.();
      cameraSegmentationRef.current = null;
    };
  }, [cameraOn, cameraBackgroundSource]);

  const render = useCallback(() => {
    void laserTick;
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
      drawQuestionImage(ctx, backgroundAsset.questionImage, rect.width, rect.height, format, page.questionScale, page.questionX, page.questionY);
    }
    const liveAction = activeRef.current?.points ? activeRef.current : null;
    const visibleActions = liveAction && !page.actions.some((action) => action.id === liveAction.id) ? [...page.actions, liveAction] : page.actions;
    drawActionsLayer(ctx, visibleActions, rect.width, rect.height, ratio);
  }, [page, format, backgroundAsset, laserTick]);

  useEffect(() => { render(); }, [render]);
  useEffect(() => {
    if (!pages.some((item) => item.actions.some((action) => action.tool === 'laser'))) return;
    const interval = window.setInterval(() => setLaserTick(Date.now()), 50);
    return () => window.clearInterval(interval);
  }, [pages]);
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
    if (drawingFrameRef.current) cancelAnimationFrame(drawingFrameRef.current);
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
    if (tool === 'move-image') {
      if (!page.background) return toast.error('Taşımak için önce bir görsel veya PDF ekleyin.');
      activeRef.current = {
        tool: 'move-image',
        startPoint: point(event),
        startX: page.questionX || 0,
        startY: page.questionY || 0
      };
      return;
    }
    activeRef.current = { id: crypto.randomUUID(), tool, color: tool === 'laser' ? '#ef4444' : color, size: activeSize, opacity: ['eraser', 'laser'].includes(tool) ? 1 : strokeOpacity / 100, pressureEnabled, penStyle, eraserDiameter: tool === 'eraser', points: [point(event)], startTime: Date.now() - startedAt.current };
  };
  const move = (event) => {
    if (cropMode && cropSelectionRef.current) {
      const selection = { ...cropSelectionRef.current, end: point(event) };
      cropSelectionRef.current = selection;
      setCropSelection(selection);
      return;
    }
    if (!activeRef.current) return;
    if (activeRef.current.tool === 'move-image') {
      const current = point(event);
      const rect = canvasRef.current.getBoundingClientRect();
      const questionX = Math.min(50, Math.max(-50, activeRef.current.startX + ((current.x - activeRef.current.startPoint.x) / (rect.width * .55)) * 100));
      const questionY = Math.min(50, Math.max(-50, activeRef.current.startY + ((current.y - activeRef.current.startPoint.y) / (rect.height * .55)) * 100));
      setPages((old) => old.map((item) => item.id === page.id ? { ...item, questionX: Math.round(questionX), questionY: Math.round(questionY) } : item));
      return;
    }
    const events = event.getCoalescedEvents?.() || [event];
    events.forEach((pointerEvent) => {
      const nextPoint = point(pointerEvent);
      const previousPoint = activeRef.current.points[activeRef.current.points.length - 1];
      const distance = Math.hypot(nextPoint.x - previousPoint.x, nextPoint.y - previousPoint.y);
      if (distance >= 0.12) activeRef.current.points.push(nextPoint);
    });
    if (!drawingFrameRef.current) {
      drawingFrameRef.current = requestAnimationFrame(() => {
        drawingFrameRef.current = null;
        render();
      });
    }
  };
  const applyCrop = (selection) => {
    const canvas = canvasRef.current;
    const image = backgroundImageRef.current;
    if (!canvas || !image?.width || !image?.height || !selection) return toast.error('PDF sayfası henüz hazırlanıyor. Birkaç saniye sonra tekrar deneyin.');
    const rect = canvas.getBoundingClientRect();
    const questionRect = getQuestionImageRect(image, rect.width, rect.height, format, page.questionScale, page.questionX, page.questionY);
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
    if (activeRef.current.tool === 'move-image') {
      activeRef.current = null;
      return;
    }
    if (drawingFrameRef.current) {
      cancelAnimationFrame(drawingFrameRef.current);
      drawingFrameRef.current = null;
    }
    const action = { ...activeRef.current, points: [...activeRef.current.points], endTime: Date.now() - startedAt.current, ...(activeRef.current.tool === 'laser' ? { expiresAt: Date.now() + 1000 } : {}) };
    setPages((old) => old.map((item) => item.id === page.id ? { ...item, actions: [...item.actions.filter((a) => a.id !== action.id), action] } : item));
    if (action.tool === 'laser') {
      window.setTimeout(() => setPages((old) => old.map((item) => ({ ...item, actions: item.actions.filter((candidate) => candidate.id !== action.id) }))), 1050);
    }
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
  const setQuestionLayout = (changes) => {
    setPages((old) => old.map((item) => item.id === page.id ? { ...item, ...changes } : item));
  };

  const save = async (status) => {
    setSaving(true);
    try {
      const persistedPages = pages.map((item) => ({ ...item, actions: item.actions.filter((action) => action.tool !== 'laser') }));
      const durationMs = Math.max(0, ...persistedPages.flatMap((item) => item.actions.map((action) => action.endTime || 0)));
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
      const cameraLayout = 'custom';
      const savedCameraBackground = CAMERA_BACKGROUNDS.some((item) => item.id === cameraBackground) ? cameraBackground : 'none';
      const response = await fetch(initial?.id ? `/api/vision/${initial.id}` : '/api/vision', { method: initial?.id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, format, durationMs, status, videoUrl: uploadedVideoUrl, data: { version: 2, pages: persistedPages, currentPageId: pageId, cameraLayout, cameraLayouts, cameraBackground: savedCameraBackground } }) });
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
      reader.onload = () => {
        setPages((old) => old.map((item) => item.id === page.id ? { ...item, background: reader.result, backgroundHistory: [], questionScale: 1.25, questionX: 0, questionY: 0 } : item));
        setTool('move-image');
      };
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
      setTool('move-image');
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

  const selectCameraBackground = (item) => {
    setCameraBackground(item.id);
    setCameraBackgroundSource(item.source);
  };
  const uploadCameraBackground = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) return toast.error('Lütfen bir görsel dosyası seçin.');
    if (file.size > 8 * 1024 * 1024) return toast.error('Kamera fonu en fazla 8 MB olabilir.');
    const reader = new FileReader();
    reader.onload = () => {
      setCameraBackground('custom');
      setCameraBackgroundSource(reader.result);
      toast.success('Özel kamera fonu hazırlandı.');
    };
    reader.readAsDataURL(file);
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
    if (questionImage?.complete) drawQuestionImage(ctx, questionImage, canvasRect.width, canvasRect.height, format, livePage?.questionScale, livePage?.questionX, livePage?.questionY);
    const recordingAction = activeRef.current?.points ? activeRef.current : null;
    const recordingActions = recordingAction ? [...(livePage?.actions || []).filter((action) => action.id !== recordingAction.id), recordingAction] : livePage?.actions;
    drawActionsLayer(ctx, recordingActions, canvasRect.width, canvasRect.height, Math.min(2, output.width / canvasRect.width));
    ctx.restore();
    if (video?.readyState >= 2) {
      const layout = cameraLayouts[format] || DEFAULT_CAMERA_LAYOUTS[format] || DEFAULT_CAMERA_LAYOUTS.fullscreen;
      const x = Math.round(output.width * layout.x / 100);
      const y = Math.round(output.height * layout.y / 100);
      const width = Math.round(output.width * layout.width / 100);
      const height = Math.round(output.height * layout.height / 100);
      const processedCamera = cameraBackgroundSource && cameraCompositeReadyRef.current ? cameraCompositeRef.current : null;
      const cameraSource = processedCamera || video;
      const sourceWidth = processedCamera?.width || video.videoWidth;
      const sourceHeight = processedCamera?.height || video.videoHeight;
      const sourceRatio = sourceWidth / sourceHeight, targetRatio = width / height;
      let sx = 0, sy = 0, sw = sourceWidth, sh = sourceHeight;
      if (sourceRatio > targetRatio) { sw = sourceHeight * targetRatio; sx = (sourceWidth - sw) / 2; }
      else { sh = sourceWidth / targetRatio; sy = (sourceHeight - sh) / 2; }
      ctx.save();
      ctx.beginPath(); ctx.roundRect(x, y, width, height, Math.max(16, output.width * .018)); ctx.clip();
      ctx.drawImage(cameraSource, sx, sy, sw, sh, x, y, width, height);
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

  const startQuestionResize = (event, corner) => {
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    const image = backgroundImageRef.current;
    const canvas = canvasRef.current;
    if (!image || !canvas) return;
    const rect = getQuestionImageRect(image, canvas.clientWidth, canvas.clientHeight, format, page.questionScale, page.questionX, page.questionY);
    questionResizeRef.current = { pointerId: event.pointerId, corner, startX: event.clientX, startY: event.clientY, startScale: page.questionScale || 1.25, width: rect.width, height: rect.height };
  };
  const resizeQuestion = (event) => {
    const resize = questionResizeRef.current;
    if (!resize || resize.pointerId !== event.pointerId) return;
    event.stopPropagation();
    const horizontal = (resize.corner.includes('right') ? 1 : -1) * (event.clientX - resize.startX) / Math.max(1, resize.width);
    const vertical = (resize.corner.includes('bottom') ? 1 : -1) * (event.clientY - resize.startY) / Math.max(1, resize.height);
    setQuestionScale(clamp(resize.startScale * (1 + (horizontal + vertical) / 2), .25, 5));
  };
  const finishQuestionResize = (event) => {
    if (questionResizeRef.current?.pointerId === event.pointerId) questionResizeRef.current = null;
  };
  const startQuestionMove = (event) => {
    if (event.target !== event.currentTarget) return;
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    questionMoveRef.current = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, questionX: page.questionX || 0, questionY: page.questionY || 0 };
  };
  const moveQuestion = (event) => {
    const movement = questionMoveRef.current;
    const canvas = canvasRef.current?.getBoundingClientRect();
    if (!movement || movement.pointerId !== event.pointerId || !canvas) return;
    event.stopPropagation();
    setQuestionLayout({
      questionX: Math.round(clamp(movement.questionX + (event.clientX - movement.startX) / (canvas.width * .55) * 100, -50, 50)),
      questionY: Math.round(clamp(movement.questionY + (event.clientY - movement.startY) / (canvas.height * .55) * 100, -50, 50))
    });
  };
  const finishQuestionMove = (event) => {
    if (questionMoveRef.current?.pointerId === event.pointerId) questionMoveRef.current = null;
  };

  const cameraLayout = cameraLayouts[format] || DEFAULT_CAMERA_LAYOUTS[format] || DEFAULT_CAMERA_LAYOUTS.fullscreen;
  const setCameraLayout = (layout) => setCameraLayouts((old) => ({ ...old, [format]: layout }));
  const startCameraTransform = (event, mode) => {
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    cameraTransformRef.current = { pointerId: event.pointerId, mode, startX: event.clientX, startY: event.clientY, layout: { ...cameraLayout } };
  };
  const transformCamera = (event) => {
    const transform = cameraTransformRef.current;
    const shell = canvasRef.current?.getBoundingClientRect();
    if (!transform || transform.pointerId !== event.pointerId || !shell) return;
    event.stopPropagation();
    const dx = (event.clientX - transform.startX) / shell.width * 100;
    const dy = (event.clientY - transform.startY) / shell.height * 100;
    const next = { ...transform.layout };
    if (transform.mode === 'move') {
      next.x = clamp(transform.layout.x + dx, 0, 100 - transform.layout.width);
      next.y = clamp(transform.layout.y + dy, 0, 100 - transform.layout.height);
    } else {
      if (transform.mode.includes('right')) next.width = clamp(transform.layout.width + dx, 14, 100 - transform.layout.x);
      if (transform.mode.includes('bottom')) next.height = clamp(transform.layout.height + dy, 12, 100 - transform.layout.y);
      if (transform.mode.includes('left')) {
        next.x = clamp(transform.layout.x + dx, 0, transform.layout.x + transform.layout.width - 14);
        next.width = transform.layout.width + transform.layout.x - next.x;
      }
      if (transform.mode.includes('top')) {
        next.y = clamp(transform.layout.y + dy, 0, transform.layout.y + transform.layout.height - 12);
        next.height = transform.layout.height + transform.layout.y - next.y;
      }
    }
    setCameraLayout(next);
  };
  const finishCameraTransform = (event) => {
    if (cameraTransformRef.current?.pointerId === event.pointerId) cameraTransformRef.current = null;
  };

  const questionRect = page.background && backgroundAsset?.questionImage && canvasRef.current
    ? getQuestionImageRect(backgroundAsset.questionImage, canvasRef.current.clientWidth, canvasRef.current.clientHeight, format, page.questionScale, page.questionX, page.questionY)
    : null;
  const cameraStyle = { left: `${cameraLayout.x}%`, top: `${cameraLayout.y}%`, width: `${cameraLayout.width}%`, height: `${cameraLayout.height}%` };

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
        <div className={styles.toolbarBrand}><div className={styles.toolbarBrandIcon}><Pen size={18} /></div><div><strong>Akıllı Kalem Paneli</strong><span>Hassas çizim araçları</span></div><span className={styles.proBadge}>PRO</span></div>
        <section className={styles.toolSection}>
          <p>Kamera Fonu</p>
          <div className={styles.cameraBackgroundGrid}>
            {CAMERA_BACKGROUNDS.map((item) => <button key={item.id} className={cameraBackground === item.id ? styles.activeCameraBackground : ''} onClick={() => selectCameraBackground(item)} title={item.label} style={item.source ? { backgroundImage: `url(${item.source})` } : undefined}><span>{item.label}</span></button>)}
          </div>
          <label className={`${styles.cameraBackgroundUpload} ${cameraBackground === 'custom' ? styles.activeCameraBackground : ''}`}><ImagePlus size={16} /><span>{cameraBackground === 'custom' ? 'Özel Fon Seçili' : 'Özel Fon Yükle'}</span><input hidden type="file" accept="image/*" onChange={uploadCameraBackground} /></label>
          {cameraBackgroundBusy && <div className={styles.cameraBackgroundStatus}><span /> Kişi fondan ayrılıyor…</div>}
        </section>
        {TOOL_GROUPS.map((group) => <section className={styles.toolSection} key={group.title}>
          <p>{group.title}</p>
          <div className={styles.toolGrid}>{group.tools.map(([name, label, Icon]) => <button key={name} title={label} className={tool === name ? styles.activeTool : ''} onClick={() => setTool(name)}><Icon size={19} /><span>{label}</span></button>)}</div>
        </section>)}
        {tool !== 'move-image' && <section className={styles.toolSection}>
          <p>Renk</p>
          <div className={styles.colorGrid}>{COLORS.map((item) => <button key={item} aria-label={item} className={`${styles.color} ${color === item ? styles.activeColor : ''}`} style={{ background: item }} onClick={() => setColor(item)} />)}</div>
        </section>}
        {tool !== 'move-image' && <section className={styles.toolSection}>
          <div className={styles.rangeLabel}><p>{tool === 'eraser' ? 'Silgi Boyutu' : tool === 'highlighter' ? 'Fosforlu Kalınlığı' : tool === 'laser' ? 'Lazer Kalınlığı' : 'Kalem Hassasiyeti'}</p><span>{activeSize}px</span></div>
          <input className={styles.sizeRange} aria-label={tool === 'eraser' ? 'Silgi boyutu' : 'Çizgi kalınlığı'} type="range" min={tool === 'eraser' ? 8 : 1} max={tool === 'eraser' ? 80 : tool === 'highlighter' ? 24 : 12} step={tool === 'pen' ? .5 : 1} value={activeSize} onChange={(e) => setActiveSize(Number(e.target.value))} />
          <div className={styles.strokePreview}><span className={tool === 'eraser' ? styles.eraserPreview : ''} style={{ width: Math.min(64, activeSize * 2), height: tool === 'eraser' ? Math.min(22, Math.max(8, activeSize / 3)) : Math.max(2, activeSize / 2), background: tool === 'eraser' ? '#fff' : color }} /></div>
          <div className={styles.presetRow}>
            {(tool === 'eraser' ? [[12, 'Küçük'], [32, 'Orta'], [64, 'Büyük']] : tool === 'highlighter' ? [[5, 'İnce'], [10, 'Orta'], [18, 'Kalın']] : tool === 'laser' ? [[3, 'İnce'], [5, 'Normal'], [9, 'Kalın']] : [[1.5, 'İnce'], [3, 'Normal'], [6, 'Kalın']]).map(([value, label]) => <button key={value} className={activeSize === value ? styles.activePreset : ''} onClick={() => setActiveSize(value)}>{label}</button>)}
          </div>
          {tool === 'pen' && <div className={styles.sensitivityNote}><span className={styles.statusDot} /> Yüksek hassasiyet açık · Basınç {pressureEnabled ? 'açık' : 'kapalı'}</div>}
          {tool === 'laser' && <div className={styles.laserNote}><span className={styles.laserDot} /> Çizgi 1 saniye içinde yumuşakça kaybolur</div>}
        </section>}
        {tool === 'pen' && <section className={styles.toolSection}>
          <p>Kalem Karakteri</p>
          <div className={styles.segmentedControl}>
            {[['technical', 'Teknik'], ['natural', 'Doğal'], ['fountain', 'Dolma']].map(([value, label]) => <button key={value} className={penStyle === value ? styles.segmentActive : ''} onClick={() => setPenStyle(value)}>{label}</button>)}
          </div>
          <label className={styles.switchRow}><span><strong>Basınç Duyarlılığı</strong><small>Tablet kalemine göre kalınlaşır</small></span><input type="checkbox" checked={pressureEnabled} onChange={(e) => setPressureEnabled(e.target.checked)} /><i /></label>
        </section>}
        {!['eraser', 'laser', 'move-image'].includes(tool) && <section className={styles.toolSection}>
          <div className={styles.rangeLabel}><p>Opaklık</p><span>%{strokeOpacity}</span></div>
          <input className={styles.sizeRange} aria-label="Çizgi opaklığı" type="range" min="20" max="100" step="5" value={strokeOpacity} onChange={(e) => setStrokeOpacity(Number(e.target.value))} />
        </section>}
        {page.background && <section className={styles.toolSection}>
          <p>Görsel Yerleşimi</p>
          <div className={styles.actionGrid}>
            <button className={tool === 'move-image' ? styles.activeTool : ''} title="Görseli tahta üzerinde sürükleyin" onClick={() => setTool('move-image')}><Move size={18} /><span>Görseli Taşı</span></button>
            <button title="Görseli ortala" onClick={() => setQuestionLayout({ questionX: 0, questionY: 0 })}><MousePointer2 size={18} /><span>Ortala</span></button>
          </div>
          <div className={styles.imageMoveNote}><Move size={14} /> Görseli kutusundan tutup taşıyın; mavi köşelerden çekip boyutlandırın.</div>
          <div className={styles.rangeLabel}><p>Soru Boyutu</p><span>{Math.round((page.questionScale || 1.25) * 100)}%</span></div>
          <input className={styles.sizeRange} aria-label="Soru görseli boyutu" type="range" min="25" max="500" step="5" value={Math.round((page.questionScale || 1.25) * 100)} onChange={(e) => setQuestionScale(Number(e.target.value) / 100)} />
          <div className={styles.actionGrid}>
            <button title="Soruyu çalışma alanına sığdır ve ortala" onClick={() => setQuestionLayout({ questionScale: 1, questionX: 0, questionY: 0 })}><ImagePlus size={18} /><span>Sığdır</span></button>
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
          <canvas className={cropMode ? styles.cropCursor : tool === 'move-image' ? styles.moveCursor : ''} ref={canvasRef} onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={end} />
          {tool === 'move-image' && questionRect && <div className={styles.questionSelection} style={{ left: questionRect.x, top: questionRect.y, width: questionRect.width, height: questionRect.height }} onPointerDown={startQuestionMove} onPointerMove={moveQuestion} onPointerUp={finishQuestionMove} onPointerCancel={finishQuestionMove}>
            {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((corner) => <button key={corner} aria-label={`Görseli ${corner} köşesinden boyutlandır`} className={`${styles.resizeHandle} ${styles[corner.replace('-', '')]}`} onPointerDown={(event) => startQuestionResize(event, corner)} onPointerMove={resizeQuestion} onPointerUp={finishQuestionResize} onPointerCancel={finishQuestionResize} />)}
          </div>}
          {cropMode && cropSelection && <div className={styles.cropSelection} style={{ left: Math.min(cropSelection.start.x, cropSelection.end.x), top: Math.min(cropSelection.start.y, cropSelection.end.y), width: Math.abs(cropSelection.end.x - cropSelection.start.x), height: Math.abs(cropSelection.end.y - cropSelection.start.y) }} />}
          <div style={cameraStyle} className={`${styles.cameraBox} ${cameraOn ? '' : styles.hidden}`} onPointerDown={(event) => startCameraTransform(event, 'move')} onPointerMove={transformCamera} onPointerUp={finishCameraTransform} onPointerCancel={finishCameraTransform}>
            <video ref={cameraRef} autoPlay muted playsInline className={styles.camera} />
            <canvas ref={cameraCompositeRef} className={`${styles.cameraComposite} ${cameraBackgroundSource && !cameraBackgroundBusy ? '' : styles.hidden}`} />
            {['top', 'right', 'bottom', 'left', 'top-left', 'top-right', 'bottom-left', 'bottom-right'].map((edge) => <button key={edge} aria-label={`Kamerayı ${edge} yönünden boyutlandır`} className={`${styles.cameraHandle} ${styles[`camera${edge.replace('-', '')}`]}`} onPointerDown={(event) => startCameraTransform(event, `resize-${edge}`)} onPointerMove={transformCamera} onPointerUp={finishCameraTransform} onPointerCancel={finishCameraTransform} />)}
          </div>
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
