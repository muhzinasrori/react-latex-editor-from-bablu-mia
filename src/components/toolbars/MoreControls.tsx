import { useState, useRef, useEffect, useCallback, type KeyboardEvent } from "react";
import ToolbarButton from "./ToolbarButton";
import HeadingControls from "./HeadingControls";
import FontControls from "./FontControls";
import ColorControls from "./ColorControls";
import TextFormattingControls from "./TextFormattingControls";
import BlockControls from "./BlockControls";
import ListControls from "./ListControls";
import ModalPortal from "../ModalPortal";
import { insertSvg, insertTable } from "../../utils/editorUtils";
import { isLikelySvgMarkup } from "../../utils/media";
import type { Editor } from "@tiptap/react";

export interface MoreControlsProps {
  editor: Editor | null;
  readOnly?: boolean;
  onImagePicker?: () => void;
}

function isYouTubeUrl(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return (
      hostname === "youtu.be" ||
      hostname === "youtube.com" ||
      hostname === "www.youtube.com" ||
      hostname === "m.youtube.com" ||
      hostname === "www.youtube-nocookie.com"
    );
  } catch {
    return false;
  }
}

const MoreControls = ({ editor, readOnly, onImagePicker }: MoreControlsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSvgDialog, setShowSvgDialog] = useState(false);
  const [svgMarkup, setSvgMarkup] = useState("");
  const [svgError, setSvgError] = useState<string | null>(null);
  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    width: number;
    maxHeight: number;
  }>({ top: 0, left: 0, width: 340, maxHeight: 400 });

  const buttonRef = useRef<HTMLButtonElement>(null);

  const updateCoords = useCallback(() => {
    const el = buttonRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // If button is scrolled out of viewport, close dropdown
    if (rect.bottom < 0 || rect.top > viewportHeight) {
      setIsOpen(false);
      return;
    }

    const padding = 8;
    const menuWidth = Math.min(340, viewportWidth - padding * 2);

    // Align right edge of menu with right edge of button, clamped within viewport
    let left = rect.right - menuWidth;
    if (left < padding) left = padding;
    if (left + menuWidth > viewportWidth - padding) {
      left = viewportWidth - padding - menuWidth;
    }

    const spaceBelow = viewportHeight - rect.bottom - padding;
    const spaceAbove = rect.top - padding;

    let top = rect.bottom + 6;
    let maxHeight = Math.max(160, Math.min(480, spaceBelow));

    // If space below is limited (< 200px) and there's more room above, flip above the button
    if (spaceBelow < 200 && spaceAbove > spaceBelow) {
      const height = Math.min(480, spaceAbove);
      top = Math.max(padding, rect.top - 6 - height);
      maxHeight = height;
    }

    setCoords({ top, left, width: menuWidth, maxHeight });
  }, []);

  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => {
      if (!prev) {
        updateCoords();
        return true;
      }
      return false;
    });
  }, [updateCoords]);

  useEffect(() => {
    if (!isOpen) return;

    updateCoords();

    const handleResize = () => updateCoords();
    const handleScroll = () => updateCoords();

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [isOpen, updateCoords]);

  useEffect(() => {
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const closeSvgDialog = useCallback(() => {
    setShowSvgDialog(false);
    setSvgMarkup("");
    setSvgError(null);
  }, []);

  const handleSvgInsert = useCallback(async () => {
    if (!editor) return;

    const markup = svgMarkup.trim();
    if (!markup || !isLikelySvgMarkup(markup)) {
      setSvgError("Paste valid SVG markup (must include an <svg> element)");
      return;
    }

    try {
      await insertSvg(editor, markup);
      closeSvgDialog();
    } catch (err) {
      setSvgError(err instanceof Error ? err.message : "Failed to insert SVG");
    }
  }, [editor, svgMarkup, closeSvgDialog]);

  const handleSvgKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        event.preventDefault();
        event.stopPropagation();
        void handleSvgInsert();
      }
    },
    [handleSvgInsert],
  );

  return (
    <div className="inline-flex items-center shrink-0">
      <ToolbarButton
        ref={buttonRef}
        onClick={toggleOpen}
        isActive={isOpen}
        title="More options (Menu titik tiga)"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-4 h-4"
        >
          <circle cx="12" cy="5" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="12" cy="19" r="2" />
        </svg>
      </ToolbarButton>

      {isOpen && (
        <ModalPortal>
          {/* Subtle backdrop to handle click-outside */}
          <div
            className="fixed inset-0 z-[2147482990] bg-slate-900/10 transition-opacity duration-150 animate-in fade-in"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Floating popover dropdown anchored directly below the MoreControls button */}
          <div
            style={{
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              width: `${coords.width}px`,
              maxHeight: `${coords.maxHeight}px`,
            }}
            className="fixed z-[2147483000] bg-white border border-slate-200 rounded-xl shadow-2xl p-3 flex flex-col gap-2.5 overflow-y-auto no-scrollbar animate-in fade-in zoom-in-95 duration-150 text-slate-800"
            role="dialog"
            aria-modal="true"
            aria-label="Menu Opsi Tambahan"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with Title & Close button */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 shrink-0">
              <span className="text-xs font-bold text-slate-800 tracking-wide uppercase flex items-center gap-1.5">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-slate-500">
                  <circle cx="12" cy="5" r="2" />
                  <circle cx="12" cy="12" r="2" />
                  <circle cx="12" cy="19" r="2" />
                </svg>
                Opsi &amp; Alat Lainnya
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer text-base leading-none"
                aria-label="Tutup menu"
              >
                ×
              </button>
            </div>

            {/* Section 1: Typography */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1">
                Typography
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                <HeadingControls editor={editor} readOnly={readOnly} />
                <FontControls editor={editor} readOnly={readOnly} />
              </div>
            </div>

            <div className="h-px bg-slate-100" />

            {/* Section 2: Colors & Formatting */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1">
                Colors &amp; Formatting
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                <ColorControls editor={editor} readOnly={readOnly} />
                <TextFormattingControls editor={editor} readOnly={readOnly} variant="more" />
              </div>
            </div>

            <div className="h-px bg-slate-100" />

            {/* Section 3: Lists & Blocks */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1">
                Lists &amp; Blocks
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                <BlockControls editor={editor} readOnly={readOnly} />
                <ListControls editor={editor} readOnly={readOnly} variant="more" />
              </div>
            </div>

            <div className="h-px bg-slate-100" />

            {/* Section 4: Insert Objects */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1">
                Insert
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                <div
                  className="toolbar-group inline-flex items-stretch gap-0 p-[2px] m-0 border border-slate-200 bg-white rounded-lg shadow-xs flex-nowrap divide-x divide-slate-100"
                  role="group"
                  aria-label="Insert items"
                >
                  <ToolbarButton
                    onClick={() => {
                      onImagePicker?.();
                      setIsOpen(false);
                    }}
                    title="Insert image"
                    disabled={!editor || readOnly}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="M21 15l-5-5L5 21" />
                    </svg>
                  </ToolbarButton>
                  <ToolbarButton
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      setShowSvgDialog(true);
                      setIsOpen(false);
                    }}
                    title="Paste SVG code"
                    disabled={!editor || readOnly}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 18l6-6-6-6" />
                      <path d="M8 6l-6 6 6 6" />
                    </svg>
                  </ToolbarButton>
                  <ToolbarButton
                    onClick={() => {
                      insertTable(editor);
                      setIsOpen(false);
                    }}
                    title="Insert table"
                    disabled={!editor || readOnly}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="1" />
                      <path d="M3 9h18" />
                      <path d="M3 15h18" />
                      <path d="M9 3v18" />
                    </svg>
                  </ToolbarButton>
                  <ToolbarButton
                    onClick={() => {
                      if (!editor) return;
                      const url = window.prompt("Enter YouTube video URL:");
                      if (!url) return;
                      if (!isYouTubeUrl(url.trim())) {
                        window.alert("Please enter a valid YouTube URL");
                        return;
                      }
                      editor.chain().focus().setYoutubeVideo({ src: url.trim() }).run();
                      setIsOpen(false);
                    }}
                    title="Insert YouTube video"
                    disabled={!editor || readOnly}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="5" width="20" height="14" rx="3" />
                      <path d="M10 9l5 3-5 3V9z" fill="currentColor" stroke="none" />
                    </svg>
                  </ToolbarButton>
                </div>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {showSvgDialog && (
        <ModalPortal>
          <div
            className="image-dialog-overlay fixed inset-0 z-[2147483000] flex items-center justify-center p-4 bg-slate-900/55 backdrop-blur-xs overflow-auto"
            onClick={closeSvgDialog}
            role="presentation"
          >
            <div
              className="image-dialog relative flex flex-col w-full max-w-[520px] max-h-[90vh] bg-white rounded-xl shadow-2xl p-5 border border-slate-200 overflow-y-auto text-slate-800"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="more-svg-paste-dialog-title"
            >
              <h3 id="more-svg-paste-dialog-title" className="text-base font-semibold text-slate-900 mb-3">
                Paste SVG code
              </h3>
              {svgError && (
                <p className="image-dialog-error p-2.5 mb-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg" role="alert">
                  {svgError}
                </p>
              )}
              <div>
                <label htmlFor="more-svg-markup-input" className="sr-only">
                  SVG markup
                </label>
                <textarea
                  id="more-svg-markup-input"
                  className="image-dialog-svg-input w-full min-h-[160px] p-3 text-xs font-mono text-slate-800 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none resize-y"
                  placeholder={'<svg xmlns="http://www.w3.org/2000/svg" ...>...</svg>'}
                  value={svgMarkup}
                  onChange={(e) => {
                    setSvgMarkup(e.target.value);
                    setSvgError(null);
                  }}
                  onKeyDown={handleSvgKeyDown}
                  rows={10}
                  autoFocus
                />
                <div className="image-dialog-buttons flex items-center justify-end gap-2 mt-4">
                  <button
                    type="button"
                    className="px-4 py-2 text-xs font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 active:bg-teal-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    disabled={!svgMarkup.trim()}
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      void handleSvgInsert();
                    }}
                  >
                    Insert SVG
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 border border-slate-200 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
                    onClick={closeSvgDialog}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
};

export default MoreControls;
