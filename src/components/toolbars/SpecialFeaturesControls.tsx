import { useCallback, useState, type KeyboardEvent } from "react";
import ModalPortal from "../ModalPortal";
import ToolbarButton from "./ToolbarButton";
import { insertSvg, insertTable } from "../../utils/editorUtils";
import { isLikelySvgMarkup } from "../../utils/media";
import type { Editor } from "@tiptap/react";

interface SpecialFeaturesControlsProps {
  editor: Editor | null;
  readOnly?: boolean;
  onMathDialogOpen: () => void;
  onImagePicker: () => void;
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

const SpecialFeaturesControls = ({
  editor,
  readOnly,
  onMathDialogOpen,
  onImagePicker,
}: SpecialFeaturesControlsProps) => {
  const [showSvgDialog, setShowSvgDialog] = useState(false);
  const [svgMarkup, setSvgMarkup] = useState("");
  const [svgError, setSvgError] = useState<string | null>(null);

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
    <>
      <div
        className="toolbar-group inline-flex items-stretch gap-0 p-[2px] m-0 border border-zinc-300 bg-white rounded-lg shadow-xs flex-nowrap divide-x divide-zinc-200"
        role="group"
        aria-label="Insert"
      >
        <ToolbarButton
          onClick={onMathDialogOpen}
          title="Insert equation"
          shortcut="Ctrl+M"
          disabled={!editor || readOnly}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 5H9l-4 14H3" />
            <path d="M13 13l6 6" />
            <path d="M13 19l6-6" />
          </svg>
        </ToolbarButton>
        <ToolbarButton
          onClick={onImagePicker}
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
          onClick={() => insertTable(editor)}
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
              aria-labelledby="svg-paste-dialog-title"
            >
              <h3 id="svg-paste-dialog-title" className="text-base font-semibold text-slate-900 mb-3">
                Paste SVG code
              </h3>
              {svgError && (
                <p className="image-dialog-error p-2.5 mb-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg" role="alert">
                  {svgError}
                </p>
              )}
              <div>
                <label htmlFor="toolbar-svg-markup-input" className="sr-only">
                  SVG markup
                </label>
                <textarea
                  id="toolbar-svg-markup-input"
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
    </>
  );
};

export default SpecialFeaturesControls;
