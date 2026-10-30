import React, { useState, useRef, useEffect } from 'react';
import {
  Type,
  Eraser,
  PenTool,
  Highlighter,
  Undo2,
  Download,
  ZoomIn,
  ZoomOut,
  Trash2,
  FileText,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  MousePointerClick,
  Check,
  Move,
  RotateCcw,
  Palette,
  Eye,
  Plus,
  AlertTriangle,
  Copy,
  Edit3,
  Layers,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import {
  renderAndExtractPdfPage,
  renderPdfPageToCanvas,
  extractPdfPageTextItems,
  DetectedPdfTextItem,
  readFileAsArrayBuffer,
  getPdfPageCount,
} from './pdfServices';

export interface EditableTextItem {
  id: string;
  originalText?: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  isBold: boolean;
  isItalic: boolean;
  bgColor: string; // Background cover to hide original text underneath
}

export interface EraseBox {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

export interface PathDrawing {
  points: { x: number; y: number }[];
  color: string;
  width: number;
  isHighlight?: boolean;
}

export interface ContextMenuData {
  isOpen: boolean;
  x: number;
  y: number;
  canvasX: number;
  canvasY: number;
  detectedText?: DetectedPdfTextItem;
  editedItem?: EditableTextItem;
}

interface PDFVisualEditorProps {
  initialFile?: File | null;
  onShowToast: (msg: string, icon?: string) => void;
  onBackToDashboard: () => void;
}

export const PDFVisualEditor: React.FC<PDFVisualEditorProps> = ({
  initialFile,
  onShowToast,
  onBackToDashboard,
}) => {
  const [file, setFile] = useState<File | null>(initialFile || null);

  useEffect(() => {
    if (initialFile) {
      setFile(initialFile);
    }
  }, [initialFile]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [pdfBuffer, setPdfBuffer] = useState<Uint8Array | null>(null);

  // Active Tool Mode: 'click-edit' (Default! Direct in-place edit), 'erase', 'add-text', 'draw', 'highlight'
  const [activeTool, setActiveTool] = useState<'click-edit' | 'erase' | 'add-text' | 'draw' | 'highlight'>('click-edit');

  // Detected text from PDF
  const [detectedTexts, setDetectedTexts] = useState<DetectedPdfTextItem[]>([]);
  const [isLoadingPage, setIsLoadingPage] = useState<boolean>(false);
  const [pageLoadError, setPageLoadError] = useState<string | null>(null);

  // User edited text items (replaces detected text or newly added)
  const [editedItems, setEditedItems] = useState<Record<number, EditableTextItem[]>>({});
  const [activeEditingId, setActiveEditingId] = useState<string | null>(null);

  // Context Menu State for Right-Click
  const [contextMenu, setContextMenu] = useState<ContextMenuData>({
    isOpen: false,
    x: 0,
    y: 0,
    canvasX: 0,
    canvasY: 0,
  });

  // Track currently selected detected text for single-click preview highlight
  const [selectedDetectedId, setSelectedDetectedId] = useState<string | null>(null);

  // Dragging state for moving active text item around
  const dragTextRef = useRef<{
    id: string;
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
  } | null>(null);

  // Canvas overlays
  const [eraseBoxes, setEraseBoxes] = useState<Record<number, EraseBox[]>>({});
  const [drawings, setDrawings] = useState<Record<number, PathDrawing[]>>({});

  // Formatting state for currently selected text
  const [selectedFont, setSelectedFont] = useState<string>('Noto Sans Bengali');
  const [fontSize, setFontSize] = useState<number>(16);
  const [textColor, setTextColor] = useState<string>('#000000');
  const [isBold, setIsBold] = useState<boolean>(true);
  const [isItalic, setIsItalic] = useState<boolean>(false);

  // Erase box color
  const [eraseColor, setEraseColor] = useState<string>('#ffffff');

  // Pen settings
  const [penColor, setPenColor] = useState<string>('#000000');
  const [penWidth, setPenWidth] = useState<number>(2);

  // Zoom
  const [zoom, setZoom] = useState<number>(1);

  // Canvas Refs
  const baseCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Dragging / drawing states
  const isMouseDownRef = useRef<boolean>(false);
  const startPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const currentPathRef = useRef<{ x: number; y: number }[]>([]);

  // Scale factor used for crisp 2x rendering
  const RENDER_SCALE = 2.0;

  // Load File
  useEffect(() => {
    if (!file) return;

    const loadDoc = async () => {
      setIsLoadingPage(true);
      setPageLoadError(null);
      try {
        if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
          const buf = await readFileAsArrayBuffer(file);
          setPdfBuffer(buf);
          const count = await getPdfPageCount(buf);
          setTotalPages(Math.max(1, count));
          setCurrentPage(1);
          await loadPageData(buf, 1);
        } else {
          // Image file
          setPdfBuffer(null);
          setTotalPages(1);
          setCurrentPage(1);
          setDetectedTexts([]);
          await loadImgData(file);
        }
        setEditedItems({});
        setEraseBoxes({});
        setDrawings({});
        setActiveEditingId(null);
        onShowToast('ডকুমেন্ট সফলভাবে লোড হয়েছে! যেকোনো লেখার উপর ক্লিক করে সরাসরি এডিট করুন ✍️', '✨');
      } catch (err: any) {
        console.error('File load error:', err);
        setPageLoadError(err?.message || 'ফাইল খুলতে সমস্যা হয়েছে');
        onShowToast('ফাইল খুলতে সমস্যা হয়েছে', '⚠️');
      } finally {
        setIsLoadingPage(false);
      }
    };

    loadDoc();
  }, [file]);

  // Page switch
  useEffect(() => {
    if (pdfBuffer && currentPage >= 1 && currentPage <= totalPages) {
      loadPageData(pdfBuffer, currentPage);
    }
  }, [currentPage]);

  // Load Page Canvas and Extract Text Elements in One Single Pass
  const loadPageData = async (buf: Uint8Array, pageNum: number) => {
    setIsLoadingPage(true);
    setPageLoadError(null);
    try {
      const { canvas: renderedCanvas, items } = await renderAndExtractPdfPage(buf, pageNum, RENDER_SCALE);
      const base = baseCanvasRef.current;
      const drawCanvas = drawingCanvasRef.current;
      if (!base || !drawCanvas) return;

      base.width = renderedCanvas.width;
      base.height = renderedCanvas.height;
      drawCanvas.width = renderedCanvas.width;
      drawCanvas.height = renderedCanvas.height;

      const ctx = base.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, base.width, base.height);
        ctx.drawImage(renderedCanvas, 0, 0);
      }

      setDetectedTexts(items);
      redrawDrawings(pageNum);
    } catch (err: any) {
      console.error('Page render error:', err);
      setPageLoadError(err?.message || 'PDF পৃষ্ঠা রেন্ডার করা যায়নি');
      onShowToast(err?.message || 'PDF পৃষ্ঠা লোড করতে ব্যর্থ হয়েছে', '⚠️');
    } finally {
      setIsLoadingPage(false);
    }
  };

  // Global window listeners for Text dragging, clicking outside to close Context Menu, and ESC key
  useEffect(() => {
    const handleWindowMouseMove = (e: MouseEvent) => {
      if (!dragTextRef.current) return;
      const { id, startX, startY, initialX, initialY } = dragTextRef.current;
      const base = baseCanvasRef.current;
      if (!base) return;
      const rect = base.getBoundingClientRect();
      const scaleX = base.width / rect.width;
      const scaleY = base.height / rect.height;

      const deltaX = (e.clientX - startX) * scaleX;
      const deltaY = (e.clientY - startY) * scaleY;

      setEditedItems((prev) => ({
        ...prev,
        [currentPage]: (prev[currentPage] || []).map((item) =>
          item.id === id
            ? { ...item, x: Math.max(0, Math.round(initialX + deltaX)), y: Math.max(0, Math.round(initialY + deltaY)) }
            : item
        ),
      }));
    };

    const handleWindowMouseUp = () => {
      dragTextRef.current = null;
    };

    const handleCloseMenu = () => {
      setContextMenu((prev) => (prev.isOpen ? { ...prev, isOpen: false } : prev));
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCloseMenu();
        setActiveEditingId(null);
        setSelectedDetectedId(null);
      }
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);
    window.addEventListener('click', handleCloseMenu);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
      window.removeEventListener('click', handleCloseMenu);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentPage]);

  // Start dragging an active text box
  const handleStartDragText = (e: React.MouseEvent, item: EditableTextItem) => {
    e.stopPropagation();
    dragTextRef.current = {
      id: item.id,
      startX: e.clientX,
      startY: e.clientY,
      initialX: item.x,
      initialY: item.y,
    };
  };

  // Quick formatting controls for active text
  const handleUpdateActiveFontSize = (id: string, delta: number) => {
    setEditedItems((prev) => ({
      ...prev,
      [currentPage]: (prev[currentPage] || []).map((item) =>
        item.id === id ? { ...item, fontSize: Math.max(8, Math.min(72, item.fontSize + delta)) } : item
      ),
    }));
  };

  const handleToggleActiveBold = (id: string) => {
    setEditedItems((prev) => ({
      ...prev,
      [currentPage]: (prev[currentPage] || []).map((item) =>
        item.id === id ? { ...item, isBold: !item.isBold } : item
      ),
    }));
  };

  const handleToggleActiveItalic = (id: string) => {
    setEditedItems((prev) => ({
      ...prev,
      [currentPage]: (prev[currentPage] || []).map((item) =>
        item.id === id ? { ...item, isItalic: !item.isItalic } : item
      ),
    }));
  };

  const handleToggleActiveBg = (id: string) => {
    setEditedItems((prev) => ({
      ...prev,
      [currentPage]: (prev[currentPage] || []).map((item) =>
        item.id === id
          ? { ...item, bgColor: item.bgColor === 'transparent' ? '#ffffff' : 'transparent' }
          : item
      ),
    }));
  };

  const handleUpdateActiveColor = (id: string, color: string) => {
    setTextColor(color);
    setEditedItems((prev) => ({
      ...prev,
      [currentPage]: (prev[currentPage] || []).map((item) =>
        item.id === id ? { ...item, color } : item
      ),
    }));
  };

  // Right-Click Context Menu on Canvas
  const handleCanvasContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const base = baseCanvasRef.current;
    if (!base) return;

    const rect = base.getBoundingClientRect();
    const scaleX = base.width / rect.width;
    const scaleY = base.height / rect.height;

    const canvasX = (e.clientX - rect.left) * scaleX;
    const canvasY = (e.clientY - rect.top) * scaleY;

    // Check hit on edited items first
    const pageItems = editedItems[currentPage] || [];
    const hitEdited = pageItems.find(
      (item) =>
        canvasX >= item.x - 4 &&
        canvasX <= item.x + item.width + 12 &&
        canvasY >= item.y - 4 &&
        canvasY <= item.y + item.height + 6
    );

    // Check hit on detected text items
    const hitDetected = detectedTexts.find(
      (d) =>
        canvasX >= d.x - 4 &&
        canvasX <= d.x + d.width + 6 &&
        canvasY >= d.y - 4 &&
        canvasY <= d.y + d.height + 6
    );

    // Ensure menu fits inside screen
    const menuWidth = 260;
    const menuHeight = 330;
    const posX = e.clientX + menuWidth > window.innerWidth ? Math.max(10, e.clientX - menuWidth) : e.clientX;
    const posY = e.clientY + menuHeight > window.innerHeight ? Math.max(10, e.clientY - menuHeight) : e.clientY;

    setContextMenu({
      isOpen: true,
      x: posX,
      y: posY,
      canvasX,
      canvasY,
      detectedText: hitDetected,
      editedItem: hitEdited,
    });
  };

  // Double-Click on Canvas: if clicked on detected text, start editing
  const handleCanvasDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'BUTTON') return;

    const base = baseCanvasRef.current;
    if (!base) return;

    const rect = base.getBoundingClientRect();
    const scaleX = base.width / rect.width;
    const scaleY = base.height / rect.height;

    const canvasX = (e.clientX - rect.left) * scaleX;
    const canvasY = (e.clientY - rect.top) * scaleY;

    // If double clicked on a detected text, edit it
    const hitDetected = detectedTexts.find(
      (d) =>
        canvasX >= d.x - 6 &&
        canvasX <= d.x + d.width + 8 &&
        canvasY >= d.y - 6 &&
        canvasY <= d.y + d.height + 8
    );

    if (hitDetected) {
      handleStartEditingDetectedText(hitDetected);
    }
  };

  // Context Menu Actions
  const handleMenuEdit = () => {
    if (contextMenu.detectedText) {
      handleStartEditingDetectedText(contextMenu.detectedText);
    } else if (contextMenu.editedItem) {
      setActiveEditingId(contextMenu.editedItem.id);
    }
    setContextMenu((prev) => ({ ...prev, isOpen: false }));
  };

  const handleMenuAddText = () => {
    const newItem: EditableTextItem = {
      id: `custom_${Date.now()}`,
      text: 'নতুন লেখা লিখুন',
      x: contextMenu.canvasX,
      y: contextMenu.canvasY,
      width: 150,
      height: 32,
      fontSize: fontSize,
      fontFamily: selectedFont,
      color: textColor,
      isBold: isBold,
      isItalic: isItalic,
      bgColor: '#ffffff',
    };

    setEditedItems((prev) => ({
      ...prev,
      [currentPage]: [...(prev[currentPage] || []), newItem],
    }));
    setActiveEditingId(newItem.id);
    setContextMenu((prev) => ({ ...prev, isOpen: false }));
    onShowToast('এখানে নতুন লেখা যোগ করা হয়েছে! ✍️', '✨');
  };

  const handleMenuWhiteout = () => {
    if (contextMenu.detectedText) {
      const d = contextMenu.detectedText;
      const newBox: EraseBox = {
        id: `erase_${Date.now()}`,
        x: d.x - 2,
        y: d.y - 2,
        width: d.width + 6,
        height: d.height + 4,
        color: '#ffffff',
      };
      setEraseBoxes((prev) => ({
        ...prev,
        [currentPage]: [...(prev[currentPage] || []), newBox],
      }));
      onShowToast('লেখাটি হোয়াইটআউট দিয়ে মোছা হয়েছে!', '🩹');
    } else {
      const newBox: EraseBox = {
        id: `erase_${Date.now()}`,
        x: contextMenu.canvasX - 10,
        y: contextMenu.canvasY - 10,
        width: 140,
        height: 36,
        color: '#ffffff',
      };
      setEraseBoxes((prev) => ({
        ...prev,
        [currentPage]: [...(prev[currentPage] || []), newBox],
      }));
      onShowToast('হোয়াইটআউট বক্স যোগ হয়েছে! আপনি চাইলে আরও মুছতে পারেন', '🩹');
    }
    setContextMenu((prev) => ({ ...prev, isOpen: false }));
  };

  const handleMenuHighlight = (color: string) => {
    if (contextMenu.detectedText) {
      const d = contextMenu.detectedText;
      const newBox: EraseBox = {
        id: `hl_${Date.now()}`,
        x: d.x - 2,
        y: d.y - 2,
        width: d.width + 4,
        height: d.height + 4,
        color,
      };
      setEraseBoxes((prev) => ({
        ...prev,
        [currentPage]: [...(prev[currentPage] || []), newBox],
      }));
      onShowToast('লেখাটি হাইলাইট করা হয়েছে! 🖍️', '✨');
    } else {
      const newBox: EraseBox = {
        id: `hl_${Date.now()}`,
        x: contextMenu.canvasX - 10,
        y: contextMenu.canvasY - 10,
        width: 140,
        height: 28,
        color,
      };
      setEraseBoxes((prev) => ({
        ...prev,
        [currentPage]: [...(prev[currentPage] || []), newBox],
      }));
      onShowToast('হাইলাইট বক্স যোগ করা হয়েছে! 🖍️', '✨');
    }
    setContextMenu((prev) => ({ ...prev, isOpen: false }));
  };

  const handleMenuCopy = () => {
    const textToCopy = contextMenu.detectedText?.str || contextMenu.editedItem?.text;
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      onShowToast(`লেখা কপি করা হয়েছে: "${textToCopy.slice(0, 20)}..."`, '📋');
    }
    setContextMenu((prev) => ({ ...prev, isOpen: false }));
  };

  // Load Image File to Canvas
  const loadImgData = (imgFile: File) => {
    return new Promise<void>((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const base = baseCanvasRef.current;
          const drawCanvas = drawingCanvasRef.current;
          if (!base || !drawCanvas) return;

          base.width = img.width;
          base.height = img.height;
          drawCanvas.width = img.width;
          drawCanvas.height = img.height;

          const ctx = base.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, base.width, base.height);
            ctx.drawImage(img, 0, 0);
          }
          redrawDrawings(1);
          resolve();
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(imgFile);
    });
  };

  // Redraw Pen & Highlighting Drawings
  const redrawDrawings = (pageNum: number) => {
    const canvas = drawingCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const list = drawings[pageNum] || [];

    list.forEach((draw) => {
      if (draw.points.length < 2) return;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(draw.points[0].x, draw.points[0].y);
      for (let i = 1; i < draw.points.length; i++) {
        ctx.lineTo(draw.points[i].x, draw.points[i].y);
      }
      ctx.strokeStyle = draw.color;
      ctx.lineWidth = draw.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      if (draw.isHighlight) ctx.globalAlpha = 0.35;
      ctx.stroke();
      ctx.restore();
    });
  };

  // Handle Clicking on a Detected Text to Edit It In-Place!
  const handleStartEditingDetectedText = (detected: DetectedPdfTextItem) => {
    setActiveTool('click-edit');
    const pageItems = editedItems[currentPage] || [];
    // Check if already being edited
    const existing = pageItems.find((item) => item.id === detected.id);

    if (existing) {
      setActiveEditingId(existing.id);
      setFontSize(existing.fontSize);
      setSelectedFont(existing.fontFamily);
      setTextColor(existing.color);
      setIsBold(existing.isBold);
      setIsItalic(existing.isItalic);
      return;
    }

    // Create a new in-place replacement over this exact detected text
    const newItem: EditableTextItem = {
      id: detected.id,
      originalText: detected.str,
      text: detected.str,
      x: detected.x,
      y: detected.y,
      width: Math.max(detected.width + 12, 40),
      height: Math.max(detected.height + 4, 20),
      fontSize: detected.fontSize,
      fontFamily: selectedFont,
      color: '#000000',
      isBold: true,
      isItalic: false,
      bgColor: '#ffffff', // Clean whiteout background to cover the original text underneath
    };

    setEditedItems((prev) => ({
      ...prev,
      [currentPage]: [...(prev[currentPage] || []), newItem],
    }));

    setActiveEditingId(newItem.id);
    setFontSize(newItem.fontSize);
    onShowToast(`"${detected.str.slice(0, 15)}..." এডিট মোড সক্রিয়! পরিবর্তন টাইপ করুন ✍️`, '✏️');
  };

  // Click on Page: places text only once if add-text was chosen, otherwise deselects
  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeTool === 'add-text') {
      const base = baseCanvasRef.current;
      if (!base) return;

      const rect = base.getBoundingClientRect();
      const scaleX = base.width / rect.width;
      const scaleY = base.height / rect.height;

      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;

      const newItem: EditableTextItem = {
        id: `custom_${Date.now()}`,
        text: 'নতুন লেখা লিখুন',
        x,
        y,
        width: 150,
        height: 32,
        fontSize: fontSize,
        fontFamily: selectedFont,
        color: textColor,
        isBold,
        isItalic,
        bgColor: '#ffffff',
      };

      setEditedItems((prev) => ({
        ...prev,
        [currentPage]: [...(prev[currentPage] || []), newItem],
      }));
      setActiveEditingId(newItem.id);
      setActiveTool('click-edit'); // Reset to default tool immediately so future clicks do not spawn boxes!
      onShowToast('নতুন টেক্সট বক্স যুক্ত হয়েছে!', '✍️');
      return;
    }

    // Clicking empty background deselects any active item
    setActiveEditingId(null);
    setSelectedDetectedId(null);
  };

  // Update In-Place Text
  const handleUpdateTextValue = (id: string, text: string) => {
    setEditedItems((prev) => ({
      ...prev,
      [currentPage]: (prev[currentPage] || []).map((item) =>
        item.id === id ? { ...item, text } : item
      ),
    }));
  };

  // Delete Edited Text Item
  const handleDeleteTextItem = (id: string) => {
    setEditedItems((prev) => ({
      ...prev,
      [currentPage]: (prev[currentPage] || []).filter((item) => item.id !== id),
    }));
    if (activeEditingId === id) setActiveEditingId(null);
    onShowToast('টেক্সট বক্স সরানো হয়েছে', '🗑️');
  };

  // Mouse handlers for Whiteout & Pen
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = drawingCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const coords = {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };

    isMouseDownRef.current = true;
    startPosRef.current = coords;

    if (activeTool === 'draw' || activeTool === 'highlight') {
      currentPathRef.current = [coords];
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isMouseDownRef.current) return;
    const canvas = drawingCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const coords = {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };

    if (activeTool === 'draw' || activeTool === 'highlight') {
      currentPathRef.current.push(coords);
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.save();
        ctx.beginPath();
        const pts = currentPathRef.current;
        if (pts.length >= 2) {
          ctx.moveTo(pts[pts.length - 2].x, pts[pts.length - 2].y);
          ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
          ctx.strokeStyle = activeTool === 'highlight' ? '#facc15' : penColor;
          ctx.lineWidth = activeTool === 'highlight' ? 24 : penWidth * 2;
          ctx.lineCap = 'round';
          if (activeTool === 'highlight') ctx.globalAlpha = 0.35;
          ctx.stroke();
        }
        ctx.restore();
      }
    }
  };

  const handleCanvasMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isMouseDownRef.current) return;
    isMouseDownRef.current = false;

    const canvas = drawingCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const coords = {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };

    if (activeTool === 'erase') {
      const x = Math.min(startPosRef.current.x, coords.x);
      const y = Math.min(startPosRef.current.y, coords.y);
      const w = Math.abs(coords.x - startPosRef.current.x);
      const h = Math.abs(coords.y - startPosRef.current.y);

      if (w > 8 && h > 8) {
        const newBox: EraseBox = {
          id: `erase_${Date.now()}`,
          x,
          y,
          width: w,
          height: h,
          color: eraseColor,
        };
        setEraseBoxes((prev) => ({
          ...prev,
          [currentPage]: [...(prev[currentPage] || []), newBox],
        }));
        onShowToast('হোয়াইটআউট বক্স তৈরি হয়েছে! এলাকাটি মুছে ফেলা হয়েছে।', '✨');
      }
    } else if (activeTool === 'draw' || activeTool === 'highlight') {
      if (currentPathRef.current.length > 1) {
        const newDraw: PathDrawing = {
          points: [...currentPathRef.current],
          color: activeTool === 'highlight' ? '#facc15' : penColor,
          width: activeTool === 'highlight' ? 24 : penWidth * 2,
          isHighlight: activeTool === 'highlight',
        };
        setDrawings((prev) => ({
          ...prev,
          [currentPage]: [...(prev[currentPage] || []), newDraw],
        }));
      }
      currentPathRef.current = [];
    }
  };

  // Undo Last Action
  const handleUndo = () => {
    const curItems = editedItems[currentPage] || [];
    const curErases = eraseBoxes[currentPage] || [];
    const curDraws = drawings[currentPage] || [];

    if (curItems.length > 0) {
      setEditedItems((prev) => ({
        ...prev,
        [currentPage]: curItems.slice(0, -1),
      }));
      onShowToast('শেষ এডিট আন্ডু হয়েছে', '↩️');
    } else if (curErases.length > 0) {
      setEraseBoxes((prev) => ({
        ...prev,
        [currentPage]: curErases.slice(0, -1),
      }));
      onShowToast('হোয়াইটআউট আন্ডু হয়েছে', '↩️');
    } else if (curDraws.length > 0) {
      setDrawings((prev) => ({
        ...prev,
        [currentPage]: curDraws.slice(0, -1),
      }));
      redrawDrawings(currentPage);
      onShowToast('অঙ্কন আন্ডু হয়েছে', '↩️');
    }
  };

  // Clear Page Edits
  const handleClearPage = () => {
    if (confirm('এই পৃষ্ঠার সকল পরিবর্তন মুছে মূল ফাইলে ফেরত যাবেন?')) {
      setEditedItems((prev) => ({ ...prev, [currentPage]: [] }));
      setEraseBoxes((prev) => ({ ...prev, [currentPage]: [] }));
      setDrawings((prev) => ({ ...prev, [currentPage]: [] }));
      setActiveEditingId(null);
      redrawDrawings(currentPage);
      onShowToast('পৃষ্ঠার এডিট সম্পূর্ণ পরিষ্কার করা হয়েছে', '🔄');
    }
  };

  // Export Combined Canvas
  const exportMergedCanvas = (): HTMLCanvasElement | null => {
    const base = baseCanvasRef.current;
    if (!base) return null;

    const merged = document.createElement('canvas');
    merged.width = base.width;
    merged.height = base.height;
    const ctx = merged.getContext('2d');
    if (!ctx) return null;

    // 1. Draw original rendered page
    ctx.drawImage(base, 0, 0);

    // 2. Draw user whiteout boxes
    const pageErases = eraseBoxes[currentPage] || [];
    pageErases.forEach((b) => {
      ctx.fillStyle = b.color;
      ctx.fillRect(b.x, b.y, b.width, b.height);
    });

    // 3. Draw in-place edited text elements
    const pageItems = editedItems[currentPage] || [];
    pageItems.forEach((item) => {
      // Draw background whiteout rectangle if any
      if (item.bgColor && item.bgColor !== 'transparent') {
        ctx.fillStyle = item.bgColor;
        ctx.fillRect(item.x - 2, item.y - 2, item.width + 6, item.height + 4);
      }

      // Draw replacement text
      ctx.save();
      ctx.fillStyle = item.color;
      ctx.font = `${item.isItalic ? 'italic ' : ''}${item.isBold ? 'bold ' : ''}${item.fontSize}px "${item.fontFamily}", sans-serif`;
      ctx.textBaseline = 'top';
      ctx.fillText(item.text, item.x, item.y);
      ctx.restore();
    });

    // 4. Draw pen / signatures
    const drawCanvas = drawingCanvasRef.current;
    if (drawCanvas) {
      ctx.drawImage(drawCanvas, 0, 0);
    }

    return merged;
  };

  // Download Modified PDF
  const handleDownloadPDF = () => {
    const merged = exportMergedCanvas();
    if (!merged) {
      onShowToast('ডকুমেন্ট প্রসেস করা যায়নি', '⚠️');
      return;
    }

    const imgData = merged.toDataURL('image/jpeg', 0.95);
    const orientation = merged.width > merged.height ? 'landscape' : 'portrait';
    const pdf = new jsPDF({
      orientation,
      unit: 'pt',
      format: [merged.width * 0.5, merged.height * 0.5],
    });

    pdf.addImage(imgData, 'JPEG', 0, 0, merged.width * 0.5, merged.height * 0.5);
    pdf.save(`mosafa-edited-doc-${Date.now()}.pdf`);
    onShowToast('সংশোধিত PDF সফলভাবে ডাউনলোড হয়েছে! 📄✨', '🎉');
  };

  // Download Image
  const handleDownloadImage = () => {
    const merged = exportMergedCanvas();
    if (!merged) return;

    const a = document.createElement('a');
    a.download = `mosafa-edited-image-${Date.now()}.png`;
    a.href = merged.toDataURL('image/png');
    a.click();
    onShowToast('সংশোধিত ছবি (PNG) সফলভাবে ডাউনলোড হয়েছে! 🖼️', '🎉');
  };

  // Current page items
  const currentPageItems = editedItems[currentPage] || [];
  const currentEraseBoxes = eraseBoxes[currentPage] || [];

  return (
    <div className="flex flex-col min-h-screen bg-slate-900 text-slate-100 select-none">
      {/* Top Header Bar */}
      <header className="bg-slate-950 border-b border-slate-800 px-4 py-3 flex items-center justify-between flex-wrap gap-3 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToDashboard}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>টুলবক্সে ফিরুন</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-1.5">
                <MousePointerClick className="w-4 h-4 text-emerald-400" />
                <span>PDF সরাসরি লাইভ এডিটর</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                  Direct In-Place Edit
                </span>
              </h2>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              ডকুমেন্টের যেকোনো লেখার উপর সরাসরি ক্লিক করে ইন-প্লেস এডিট ও পরিবর্তন করুন
            </p>
          </div>
        </div>

        {/* Multi-Page Navigation */}
        {totalPages > 1 && (
          <div className="flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-xl text-xs">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1 || isLoadingPage}
              className="p-1 hover:bg-slate-700 rounded disabled:opacity-40 cursor-pointer"
              title="পূর্ববর্তী পৃষ্ঠা"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-emerald-300">
              পৃষ্ঠা {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages || isLoadingPage}
              className="p-1 hover:bg-slate-700 rounded disabled:opacity-40 cursor-pointer"
              title="পরবর্তী পৃষ্ঠা"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Download Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadImage}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            title="ছবি হিসেবে ডাউনলোড"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">ছবি (PNG)</span>
          </button>
          <button
            onClick={handleDownloadPDF}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>সংশোধিত PDF ডাউনলোড</span>
          </button>
        </div>
      </header>

      {/* Editor Main Control Toolbar */}
      <div className="bg-slate-950/95 border-b border-slate-800 px-4 py-2 flex items-center justify-between gap-3 overflow-x-auto text-xs">
        {/* Tool Selector Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-2xl border border-slate-800 shrink-0">
          <button
            onClick={() => setActiveTool('click-edit')}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition cursor-pointer ${
              activeTool === 'click-edit'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
            title="ডকুমেন্টের যেকোনো লেখার উপর সরাসরি ক্লিক করে এডিট করুন"
          >
            <MousePointerClick className="w-3.5 h-3.5" />
            <span>১. লেখায় ক্লিক করে এডিট</span>
          </button>

          <button
            onClick={() => setActiveTool('add-text')}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition cursor-pointer ${
              activeTool === 'add-text'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
            title="পৃষ্ঠার যেকোনো জায়গায় ক্লিক করে নতুন লেখা যোগ করুন"
          >
            <Type className="w-3.5 h-3.5" />
            <span>২. যেকোনো স্থানে লেখা বসান</span>
          </button>

          <button
            onClick={() => setActiveTool('erase')}
            className={`px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1 transition cursor-pointer ${
              activeTool === 'erase'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-400 hover:bg-slate-800'
            }`}
            title="ড্র্যাগ করে লোগো, সিল বা এলাকা হোয়াইটআউট করুন"
          >
            <Eraser className="w-3.5 h-3.5" />
            <span>মুছুন (Whiteout)</span>
          </button>

          <button
            onClick={() => setActiveTool('draw')}
            className={`px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1 transition cursor-pointer ${
              activeTool === 'draw'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-400 hover:bg-slate-800'
            }`}
            title="ডিজিটাল স্বাক্ষর বা পেন"
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>স্বাক্ষর/পেন</span>
          </button>

          <button
            onClick={() => setActiveTool('highlight')}
            className={`px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1 transition cursor-pointer ${
              activeTool === 'highlight'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-400 hover:bg-slate-800'
            }`}
            title="হলুদ মার্কার হাইলাইটার"
          >
            <Highlighter className="w-3.5 h-3.5" />
            <span>হাইলাইট</span>
          </button>
        </div>

        {/* Dynamic Font Styling Bar */}
        <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-2xl border border-slate-800 shrink-0">
          {/* Font Family */}
          <select
            value={selectedFont}
            onChange={(e) => {
              const f = e.target.value;
              setSelectedFont(f);
              if (activeEditingId) {
                setEditedItems((prev) => ({
                  ...prev,
                  [currentPage]: (prev[currentPage] || []).map((item) =>
                    item.id === activeEditingId ? { ...item, fontFamily: f } : item
                  ),
                }));
              }
            }}
            className="bg-slate-950 text-slate-200 border border-slate-700 px-2 py-1 rounded-xl text-xs font-medium cursor-pointer"
          >
            <option value="Noto Sans Bengali">Noto Sans (আধুনিক বাংলা)</option>
            <option value="Hind Siliguri">Hind Siliguri (রাউন্ডেড বাংলা)</option>
            <option value="Arial">Arial (English Standard)</option>
            <option value="Times New Roman">Times New Roman (অফিসিয়াল)</option>
            <option value="Courier New">Courier New (টাইপরাইটার)</option>
          </select>

          {/* Font Size */}
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <span>সাইজ:</span>
            <input
              type="number"
              min={8}
              max={64}
              value={fontSize}
              onChange={(e) => {
                const s = Number(e.target.value);
                setFontSize(s);
                if (activeEditingId) {
                  setEditedItems((prev) => ({
                    ...prev,
                    [currentPage]: (prev[currentPage] || []).map((item) =>
                      item.id === activeEditingId ? { ...item, fontSize: s } : item
                    ),
                  }));
                }
              }}
              className="w-12 bg-slate-950 text-white font-bold px-1.5 py-1 rounded-lg border border-slate-700 text-center"
            />
          </div>

          {/* Font Color */}
          <input
            type="color"
            value={textColor}
            onChange={(e) => {
              const c = e.target.value;
              setTextColor(c);
              if (activeEditingId) {
                setEditedItems((prev) => ({
                  ...prev,
                  [currentPage]: (prev[currentPage] || []).map((item) =>
                    item.id === activeEditingId ? { ...item, color: c } : item
                  ),
                }));
              }
            }}
            className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
            title="টেক্সট কালার"
          />

          {/* Bold */}
          <button
            onClick={() => {
              const b = !isBold;
              setIsBold(b);
              if (activeEditingId) {
                setEditedItems((prev) => ({
                  ...prev,
                  [currentPage]: (prev[currentPage] || []).map((item) =>
                    item.id === activeEditingId ? { ...item, isBold: b } : item
                  ),
                }));
              }
            }}
            className={`px-2 py-1 rounded-lg font-black text-xs cursor-pointer ${
              isBold ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
            }`}
          >
            B
          </button>
        </div>

        {/* Global Action Tools: Undo, Clear, Zoom */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleUndo}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl cursor-pointer"
            title="আগের অবস্থায় ফিরুন (Undo)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleClearPage}
            className="p-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 rounded-xl cursor-pointer"
            title="সব এডিট পরিষ্কার করুন"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* Zoom */}
          <div className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-xl text-slate-300">
            <button onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))} className="cursor-pointer">
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-bold px-1">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom((z) => Math.min(2.0, z + 0.1))} className="cursor-pointer">
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Visual Document Canvas Area */}
      <main
        ref={containerRef}
        className="flex-1 bg-slate-950 p-6 flex items-center justify-center overflow-auto min-h-[620px] relative"
      >
        {/* Loading Spinner Overlay */}
        {isLoadingPage && (
          <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-white">
            <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin mb-4" />
            <h3 className="text-sm font-bold text-emerald-400 mb-1">PDF লোড ও বিশ্লেষণ করা হচ্ছে...</h3>
            <p className="text-xs text-slate-300">পৃষ্ঠার টেক্সট ও উপাদানসমূহ সরাসরি এডিটের জন্য প্রস্তুত হচ্ছে</p>
          </div>
        )}

        {/* Error State */}
        {pageLoadError && !isLoadingPage ? (
          <div className="max-w-md w-full p-6 rounded-3xl bg-slate-900 border border-rose-500/50 text-center shadow-2xl z-40">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">ডকুমেন্ট লোড করতে সমস্যা হয়েছে</h3>
            <p className="text-xs text-rose-300 mb-4">{pageLoadError}</p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (pdfBuffer) loadPageData(pdfBuffer, currentPage);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer"
              >
                পুনরায় চেষ্টা করুন (Retry)
              </button>
              <button
                type="button"
                onClick={onBackToDashboard}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs cursor-pointer"
              >
                ড্যাশবোর্ডে ফিরুন
              </button>
            </div>
          </div>
        ) : !file ? (
          <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center shadow-xl">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-3 border border-emerald-500/20">
              <MousePointerClick className="w-8 h-8 animate-bounce" />
            </div>
            <h3 className="text-base font-extrabold text-white mb-1">
              সরাসরি এডিট করার জন্য PDF বা ছবি নির্বাচন করুন
            </h3>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              ডকুমেন্টের যেকোনো অংশে ক্লিক করে লাইভ লেখা পরিবর্তন, পরিমার্জন বা নতুন টেক্সট বসান।
            </p>
            <label className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-lg inline-flex items-center gap-2 cursor-pointer transition active:scale-95">
              <Plus className="w-4 h-4" />
              <span>ফাইল বাছুন (PDF / JPG / PNG)</span>
              <input
                type="file"
                accept=".pdf,image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setFile(f);
                }}
              />
            </label>
          </div>
        ) : (
          <div
            onClick={handleContainerClick}
            onDoubleClick={handleCanvasDoubleClick}
            onContextMenu={handleCanvasContextMenu}
            className="relative shadow-2xl rounded-sm overflow-hidden bg-white select-none transition-transform"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'center center',
            }}
          >
            {/* 1. Base Rendered PDF Layer */}
            <canvas ref={baseCanvasRef} className="block pointer-events-none" />

            {/* 2. Detected Interactive Text Highlights & Click Targets (Overlay) */}
            {(activeTool === 'click-edit' || activeTool === 'add-text') && (
              <div className="absolute inset-0 z-20 pointer-events-auto">
                {detectedTexts.map((detected) => {
                  const isBeingEdited = currentPageItems.some((item) => item.id === detected.id);
                  if (isBeingEdited) return null; // Already replaced by active edited item

                  const isHoverSelected = selectedDetectedId === detected.id;

                  return (
                    <div
                      key={detected.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartEditingDetectedText(detected);
                      }}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        handleStartEditingDetectedText(detected);
                      }}
                      onContextMenu={(e) => {
                        e.stopPropagation();
                        handleCanvasContextMenu(e);
                      }}
                      className={`absolute transition-all cursor-text rounded-xs group ${
                        isHoverSelected
                          ? 'bg-emerald-400/30 ring-2 ring-emerald-500 shadow-sm'
                          : 'hover:bg-emerald-400/25 hover:ring-1 hover:ring-emerald-500/80'
                      }`}
                      style={{
                        left: `${detected.x - 2}px`,
                        top: `${detected.y - 2}px`,
                        width: `${detected.width + 4}px`,
                        height: `${detected.height + 4}px`,
                      }}
                      title={`ক্লিক করুন: সরাসরি এডিট | রাইট-ক্লিক: অপশন মেনু ("${detected.str}")`}
                    >
                      {/* Floating Tooltip */}
                      <span className="opacity-0 group-hover:opacity-100 absolute -top-7 left-0 bg-slate-900/95 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-0.5 rounded-md shadow-xl pointer-events-none z-30 whitespace-nowrap border border-slate-700 flex items-center gap-1.5 transition-opacity">
                        <span className="text-emerald-400 font-bold">⚡ ক্লিকে সরাসরি এডিট</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-indigo-300">রাইট-ক্লিক: মেনু</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 3. Rendered Whiteout Boxes */}
            {currentEraseBoxes.map((box) => (
              <div
                key={box.id}
                className="absolute z-15 border border-dashed border-slate-300/80"
                style={{
                  left: `${box.x}px`,
                  top: `${box.y}px`,
                  width: `${box.width}px`,
                  height: `${box.height}px`,
                  backgroundColor: box.color,
                }}
              />
            ))}

            {/* 4. Active In-Place Edited Text Items */}
            {currentPageItems.map((item) => {
              const isSelected = activeEditingId === item.id;

              return (
                <div
                  key={item.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveEditingId(item.id);
                    setFontSize(item.fontSize);
                    setSelectedFont(item.fontFamily);
                    setTextColor(item.color);
                    setIsBold(item.isBold);
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    setActiveEditingId(item.id);
                  }}
                  onContextMenu={(e) => {
                    e.stopPropagation();
                    handleCanvasContextMenu(e);
                  }}
                  className={`absolute z-20 transition-shadow ${
                    isSelected ? 'ring-2 ring-emerald-500 shadow-xl' : 'hover:ring-1 hover:ring-indigo-400'
                  }`}
                  style={{
                    left: `${item.x}px`,
                    top: `${item.y}px`,
                    backgroundColor: item.bgColor,
                  }}
                >
                  {/* Floating Action Menu for Active Text */}
                  {isSelected && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute -top-11 left-0 flex items-center gap-1.5 bg-slate-900/95 backdrop-blur-md text-white px-2 py-1 rounded-2xl shadow-2xl z-40 border border-slate-700 whitespace-nowrap"
                    >
                      {/* Drag Handle to move text anywhere */}
                      <div
                        onMouseDown={(e) => handleStartDragText(e, item)}
                        className="p-1 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg cursor-grab active:cursor-grabbing"
                        title="টেনে যেকোনো জায়গায় সরান"
                      >
                        <Move className="w-3.5 h-3.5" />
                      </div>

                      <div className="w-px h-4 bg-slate-700" />

                      {/* Font Size A- / A+ */}
                      <button
                        type="button"
                        onClick={() => handleUpdateActiveFontSize(item.id, -2)}
                        className="px-1.5 py-0.5 hover:bg-slate-800 text-[10px] font-bold rounded cursor-pointer"
                        title="ফন্ট সাইজ ছোট করুন"
                      >
                        A-
                      </button>
                      <span className="text-[10px] font-bold text-slate-300 min-w-5 text-center">
                        {item.fontSize}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleUpdateActiveFontSize(item.id, +2)}
                        className="px-1.5 py-0.5 hover:bg-slate-800 text-[10px] font-bold rounded cursor-pointer"
                        title="ফন্ট সাইজ বড় করুন"
                      >
                        A+
                      </button>

                      <div className="w-px h-4 bg-slate-700" />

                      {/* Bold / Italic */}
                      <button
                        type="button"
                        onClick={() => handleToggleActiveBold(item.id)}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-black cursor-pointer ${
                          item.isBold ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'
                        }`}
                        title="বোল্ড"
                      >
                        B
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleActiveItalic(item.id)}
                        className={`px-1.5 py-0.5 rounded text-[10px] italic font-bold cursor-pointer ${
                          item.isItalic ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'
                        }`}
                        title="ইটালিক"
                      >
                        I
                      </button>

                      <div className="w-px h-4 bg-slate-700" />

                      {/* Whiteout Background Toggle */}
                      <button
                        type="button"
                        onClick={() => handleToggleActiveBg(item.id)}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold cursor-pointer transition ${
                          item.bgColor !== 'transparent'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                        title="মূল লেখা ঢাকতে সাদা ব্যাকগ্রাউন্ড অন/অফ করুন"
                      >
                        {item.bgColor !== 'transparent' ? '🩹 হোয়াইটআউট' : '⬜ স্বচ্ছ'}
                      </button>

                      {/* Quick Color Swatches */}
                      <div className="flex items-center gap-1">
                        {['#000000', '#1e3a8a', '#dc2626', '#16a34a', '#7c3aed'].map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => handleUpdateActiveColor(item.id, c)}
                            className="w-3.5 h-3.5 rounded-full border border-slate-600 hover:scale-125 transition-transform cursor-pointer"
                            style={{ backgroundColor: c }}
                            title={`রঙ: ${c}`}
                          />
                        ))}
                      </div>

                      <div className="w-px h-4 bg-slate-700" />

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleDeleteTextItem(item.id)}
                        className="p-1 hover:bg-rose-600 rounded text-slate-400 hover:text-white cursor-pointer"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Done / Commit */}
                      <button
                        type="button"
                        onClick={() => setActiveEditingId(null)}
                        className="p-1 px-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                        title="সম্পন্ন"
                      >
                        <Check className="w-3 h-3" />
                        <span>ঠিক আছে</span>
                      </button>
                    </div>
                  )}

                  <input
                    type="text"
                    value={item.text}
                    onChange={(e) => handleUpdateTextValue(item.id, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setActiveEditingId(null);
                        onShowToast('লেখা সেভ হয়েছে!', '✅');
                      }
                    }}
                    autoFocus={isSelected}
                    ref={(el) => {
                      if (isSelected && el && document.activeElement !== el) {
                        el.focus();
                      }
                    }}
                    className="bg-transparent border-0 outline-none px-1 py-0.5 font-bold"
                    style={{
                      fontSize: `${item.fontSize}px`,
                      fontFamily: `"${item.fontFamily}", sans-serif`,
                      color: item.color,
                      fontWeight: item.isBold ? 'bold' : 'normal',
                      fontStyle: item.isItalic ? 'italic' : 'normal',
                      width: `${Math.max(item.width, item.text.length * (item.fontSize * 0.7) + 24)}px`,
                      height: `${Math.max(item.height, item.fontSize * 1.35)}px`,
                    }}
                  />
                </div>
              );
            })}

            {/* 5. Freehand Pen & Highlighter Drawing Canvas Layer */}
            <canvas
              ref={drawingCanvasRef}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              className={`absolute inset-0 z-25 ${
                activeTool === 'erase'
                  ? 'cursor-crosshair pointer-events-auto'
                  : activeTool === 'draw' || activeTool === 'highlight'
                  ? 'cursor-pencil pointer-events-auto'
                  : 'pointer-events-none'
              }`}
            />
          </div>
        )}

        {/* Floating Right-Click Context Menu */}
        {contextMenu.isOpen && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="fixed z-50 min-w-60 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 shadow-2xl p-1.5 text-xs text-slate-200 animate-in fade-in zoom-in-95 duration-150 select-none"
            style={{
              left: `${contextMenu.x}px`,
              top: `${contextMenu.y}px`,
            }}
          >
            {/* Context Header */}
            <div className="px-2.5 py-1.5 mb-1 border-b border-slate-800 text-[10px] font-bold text-slate-400 flex items-center justify-between">
              <span>{contextMenu.detectedText || contextMenu.editedItem ? 'টেক্সট অপশন' : 'ডকুমেন্ট মেনু'}</span>
              <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">রাইট-ক্লিক</span>
            </div>

            {/* If clicked on text: Edit in-place & Copy */}
            {(contextMenu.detectedText || contextMenu.editedItem) && (
              <>
                <button
                  type="button"
                  onClick={handleMenuEdit}
                  className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-emerald-600 hover:text-white flex items-center gap-2 font-bold cursor-pointer transition text-emerald-400"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>লেখাটি এডিট করুন (ডাবল-ক্লিক)</span>
                </button>

                <button
                  type="button"
                  onClick={handleMenuCopy}
                  className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-slate-800 flex items-center gap-2 font-medium cursor-pointer transition"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>লেখা কপি করুন</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleMenuHighlight('rgba(250, 204, 21, 0.45)')}
                  className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-yellow-500/20 hover:text-yellow-300 flex items-center gap-2 font-medium cursor-pointer transition text-yellow-400"
                >
                  <Highlighter className="w-3.5 h-3.5" />
                  <span>হলুদ হাইলাইট করুন</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleMenuHighlight('rgba(34, 197, 94, 0.45)')}
                  className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-emerald-500/20 hover:text-emerald-300 flex items-center gap-2 font-medium cursor-pointer transition text-emerald-400"
                >
                  <Highlighter className="w-3.5 h-3.5" />
                  <span>সবুজ হাইলাইট করুন</span>
                </button>

                <button
                  type="button"
                  onClick={handleMenuWhiteout}
                  className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-rose-500/20 hover:text-rose-300 flex items-center gap-2 font-medium cursor-pointer transition text-rose-400"
                >
                  <Eraser className="w-3.5 h-3.5" />
                  <span>হোয়াইটআউট দিয়ে মুছুন</span>
                </button>

                <div className="my-1 border-t border-slate-800" />
              </>
            )}

            {/* General Actions */}
            <button
              type="button"
              onClick={handleMenuAddText}
              className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-indigo-600 hover:text-white flex items-center gap-2 font-bold cursor-pointer transition text-indigo-400"
            >
              <Type className="w-3.5 h-3.5" />
              <span>এখানে নতুন লেখা যোগ করুন</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTool('erase');
                setContextMenu((prev) => ({ ...prev, isOpen: false }));
                onShowToast('হোয়াইটআউট টুল সক্রিয়! যেকোনো অংশ ড্র্যাগ করে মুছুন', '🩹');
              }}
              className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-slate-800 flex items-center gap-2 font-medium cursor-pointer transition"
            >
              <Eraser className="w-3.5 h-3.5 text-rose-400" />
              <span>মুছুন (Whiteout এরিয়া)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTool('draw');
                setContextMenu((prev) => ({ ...prev, isOpen: false }));
                onShowToast('পেন / স্বাক্ষর টুল সক্রিয়!', '✍️');
              }}
              className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-slate-800 flex items-center gap-2 font-medium cursor-pointer transition"
            >
              <PenTool className="w-3.5 h-3.5 text-sky-400" />
              <span>স্বাক্ষর / ডিজিটাল পেন</span>
            </button>

            <div className="my-1 border-t border-slate-800" />

            {/* Zoom shortcuts */}
            <div className="flex items-center justify-between px-2.5 py-1 text-[11px] text-slate-400">
              <span>জুম নিয়ন্ত্রণ:</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setZoom((z) => Math.max(0.5, z - 0.15));
                    setContextMenu((prev) => ({ ...prev, isOpen: false }));
                  }}
                  className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer"
                >
                  -
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setZoom(1);
                    setContextMenu((prev) => ({ ...prev, isOpen: false }));
                  }}
                  className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer"
                >
                  100%
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setZoom((z) => Math.min(2.2, z + 0.15));
                    setContextMenu((prev) => ({ ...prev, isOpen: false }));
                  }}
                  className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Hint Banner */}
      <footer className="bg-slate-950 border-t border-slate-800 px-4 py-2.5 text-center text-xs text-slate-300 flex items-center justify-center gap-3 flex-wrap shadow-inner">
        <span className="inline-flex items-center gap-1.5 bg-slate-900 px-3 py-1 rounded-full border border-slate-800 shadow-xs">
          <span className="text-emerald-400 font-black">⚡ ডাবল-ক্লিক:</span>
          <span>যেকোনো লেখার উপর সরাসরি এডিট করুন</span>
        </span>
        <span className="inline-flex items-center gap-1.5 bg-slate-900 px-3 py-1 rounded-full border border-slate-800 shadow-xs">
          <span className="text-yellow-400 font-black">🖱️ রাইট-ক্লিক:</span>
          <span>লেখা যোগ, হাইলাইট বা হোয়াইটআউট অপশন মেনু</span>
        </span>
        <span className="inline-flex items-center gap-1.5 bg-slate-900 px-3 py-1 rounded-full border border-slate-800 shadow-xs">
          <span className="text-sky-400 font-black">✋ টেনে সরান:</span>
          <span>এডিট করা লেখা যেকোনো জায়গায় নিখুঁতভাবে বসান</span>
        </span>
      </footer>
    </div>
  );
};
