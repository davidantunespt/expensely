import { useState, useRef, useEffect } from "react";
import { X, ZoomIn, ZoomOut, Maximize2, Minimize2 } from "lucide-react";
import Image from "next/image";

interface DocumentViewerProps {
  isOpen: boolean;
  onClose: () => void;
  documentUrl: string;
}

export function DocumentViewer({
  isOpen,
  onClose,
  documentUrl,
}: DocumentViewerProps) {
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef<{ x: number; y: number } | null>(null);
  const mouseStart = useRef<{ x: number; y: number } | null>(null);
  const viewerRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Zoom with cmd/ctrl + mouse wheel
  useEffect(() => {
    if (!isOpen) return;
    const handleWheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault();
        setZoom((prev) => {
          let next = prev - event.deltaY * 0.01;
          if (next < 0.5) next = 0.5;
          if (next > 3) next = 3;
          return Math.round(next * 100) / 100;
        });
      }
    };
    const node = viewerRef.current;
    if (node) node.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      if (node) node.removeEventListener("wheel", handleWheel);
    };
  }, [isOpen]);

  // Reset pan when zoom changes or viewer opens
  useEffect(() => {
    setPan({ x: 0, y: 0 });
  }, [zoom, isOpen]);

  if (!isOpen) return null;

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => setZoom(1);

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (viewerRef.current) {
        if (viewerRef.current.requestFullscreen) {
          viewerRef.current.requestFullscreen();
        } else if ((viewerRef.current as Element & { webkitRequestFullscreen?: () => void }).webkitRequestFullscreen) {
          (viewerRef.current as Element & { webkitRequestFullscreen?: () => void }).webkitRequestFullscreen!();
        }
        setIsFullscreen(true);
      }
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else if ((document as Document & { webkitExitFullscreen?: () => void }).webkitExitFullscreen) {
        (document as Document & { webkitExitFullscreen?: () => void }).webkitExitFullscreen!();
      }
      setIsFullscreen(false);
    }
  };

  // Listen for fullscreen change to update state
  if (typeof window !== 'undefined') {
    document.onfullscreenchange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
  }

  // Mouse event handlers for panning
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsPanning(true);
    panStart.current = { ...pan };
    mouseStart.current = { x: e.clientX, y: e.clientY };
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning || !panStart.current || !mouseStart.current) return;
    const dx = e.clientX - mouseStart.current.x;
    const dy = e.clientY - mouseStart.current.y;
    setPan({ x: panStart.current.x + dx, y: panStart.current.y + dy });
  };
  const handleMouseUp = () => {
    setIsPanning(false);
    panStart.current = null;
    mouseStart.current = null;
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-start justify-start transition-all duration-300 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      style={{ background: "none" }}
    >
      <div
        ref={viewerRef}
        className={`relative bg-white transition-all duration-300 w-[90vw] h-[100vh] ${
          isFullscreen ? "w-screen h-screen" : ""
        }`}
        style={{ borderRadius: 0, boxShadow: "none" }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 bg-white w-full" style={{ border: "none", boxShadow: "none" }}>
          <div className="text-base font-semibold text-black select-none">Document Viewer</div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleZoomOut}
              className="p-2 text-black hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <button
              onClick={handleResetZoom}
              className="px-3 py-1 text-sm bg-gray-100 text-black hover:bg-gray-200 rounded transition-colors cursor-pointer"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              onClick={handleZoomIn}
              className="p-2 text-black hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-2 text-black hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {isFullscreen ? (
                <Minimize2 className="w-5 h-5" />
              ) : (
                <Maximize2 className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-black hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        {/* Document Container */}
        <div className="w-full h-[calc(100vh-48px)] overflow-auto bg-white flex items-center justify-center">
          <div className="relative w-full h-full min-h-[500px] flex items-center justify-center">
            <div
              style={{ width: '100%', height: '100%', cursor: isPanning ? 'grabbing' : 'grab' }}
              onMouseDown={handleMouseDown}
            >
              <Image
                src={documentUrl}
                alt="Document"
                fill
                className="object-contain transition-transform duration-200"
                style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
                unoptimized
                draggable={false}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
