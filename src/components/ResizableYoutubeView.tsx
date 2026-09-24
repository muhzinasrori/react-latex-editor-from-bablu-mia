import "./ResizableYoutubeView.css";
import React, { useCallback, useRef } from "react";
import { NodeViewWrapper } from "@tiptap/react";
import { Node } from "@tiptap/pm/model";

interface YoutubeNodeAttrs {
  src: string;
  width: string;
  height: string;
  align: string;
}

interface ResizableYoutubeViewProps {
  node: Node & {
    attrs: YoutubeNodeAttrs;
  };
  updateAttributes: (attrs: Partial<YoutubeNodeAttrs>) => void;
  selected?: boolean;
}

const MIN_WIDTH = 200;
const MIN_HEIGHT = 150;

const ResizableYoutubeView: React.FC<ResizableYoutubeViewProps> = ({
  node,
  updateAttributes,
  selected,
}) => {
  const resizeRef = useRef<{
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
    direction: string;
  } | null>(null);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, direction: string) => {
      e.preventDefault();
      e.stopPropagation();

      resizeRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        startWidth: parseInt(String(node.attrs.width), 10) || 640,
        startHeight: parseInt(String(node.attrs.height), 10) || 360,
        direction,
      };

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const state = resizeRef.current;
        if (!state) return;

        const deltaX = moveEvent.clientX - state.startX;
        const deltaY = moveEvent.clientY - state.startY;

        let newWidth = state.startWidth;
        let newHeight = state.startHeight;

        if (state.direction.includes("right")) {
          newWidth = Math.max(MIN_WIDTH, state.startWidth + deltaX);
        }
        if (state.direction.includes("left")) {
          newWidth = Math.max(MIN_WIDTH, state.startWidth - deltaX);
        }
        if (state.direction.includes("bottom")) {
          newHeight = Math.max(MIN_HEIGHT, state.startHeight + deltaY);
        }
        if (state.direction.includes("top")) {
          newHeight = Math.max(MIN_HEIGHT, state.startHeight - deltaY);
        }

        updateAttributes({
          width: `${Math.round(newWidth)}px`,
          height: `${Math.round(newHeight)}px`,
        });
      };

      const handleMouseUp = () => {
        resizeRef.current = null;
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [node.attrs.width, node.attrs.height, updateAttributes],
  );

  const handleAlignChange = (align: string) => {
    updateAttributes({ align });
  };

  const align = node.attrs.align || "center";

  return (
    <NodeViewWrapper
      className={`resizable-youtube-wrapper ${
        selected ? "ProseMirror-selectednode" : ""
      }`}
      style={{
        textAlign: align as "left" | "center" | "right",
        position: "relative",
        display: "block",
        width: "100%",
      }}
      data-align={align}
    >
      <div
        className="resizable-youtube-container"
        style={{
          position: "relative",
          display: "inline-block",
          width: node.attrs.width,
          height: node.attrs.height,
          maxWidth: "100%",
        }}
      >
        <iframe
          src={node.attrs.src}
          width={node.attrs.width}
          height={node.attrs.height}
          title="YouTube video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{
            display: "block",
            width: "100%",
            height: "100%",
            border: 0,
          }}
        />

        {selected && (
          <>
            <div
              className="resize-handle resize-handle-bottom-right absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-blue-600 border border-white rounded-xs shadow-xs cursor-nwse-resize z-10"
              onMouseDown={(e) => handleMouseDown(e, "bottom-right")}
              aria-hidden="true"
            />
            <div
              className="resize-handle resize-handle-bottom-left absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-blue-600 border border-white rounded-xs shadow-xs cursor-nesw-resize z-10"
              onMouseDown={(e) => handleMouseDown(e, "bottom-left")}
              aria-hidden="true"
            />
            <div
              className="resize-handle resize-handle-top-right absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-600 border border-white rounded-xs shadow-xs cursor-nesw-resize z-10"
              onMouseDown={(e) => handleMouseDown(e, "top-right")}
              aria-hidden="true"
            />
            <div
              className="resize-handle resize-handle-top-left absolute -top-1 -left-1 w-2.5 h-2.5 bg-blue-600 border border-white rounded-xs shadow-xs cursor-nwse-resize z-10"
              onMouseDown={(e) => handleMouseDown(e, "top-left")}
              aria-hidden="true"
            />

            <div
              className="alignment-controls absolute -top-8.5 left-0 z-20 flex gap-1 p-1 bg-white border border-zinc-200 rounded-md shadow-md"
              role="group"
              aria-label="Video alignment"
            >
              <button
                onClick={() => handleAlignChange("left")}
                className={`px-2 py-0.5 text-xs font-semibold rounded transition-colors cursor-pointer ${
                  align === "left"
                    ? "bg-blue-600 text-white is-active"
                    : "text-blue-600 hover:bg-blue-50"
                }`}
                type="button"
                aria-label="Align left"
                aria-pressed={align === "left"}
              >
                ←
              </button>
              <button
                onClick={() => handleAlignChange("center")}
                className={`px-2 py-0.5 text-xs font-semibold rounded transition-colors cursor-pointer ${
                  align === "center"
                    ? "bg-blue-600 text-white is-active"
                    : "text-blue-600 hover:bg-blue-50"
                }`}
                type="button"
                aria-label="Align center"
                aria-pressed={align === "center"}
              >
                ⟷
              </button>
              <button
                onClick={() => handleAlignChange("right")}
                className={`px-2 py-0.5 text-xs font-semibold rounded transition-colors cursor-pointer ${
                  align === "right"
                    ? "bg-blue-600 text-white is-active"
                    : "text-blue-600 hover:bg-blue-50"
                }`}
                type="button"
                aria-label="Align right"
                aria-pressed={align === "right"}
              >
                →
              </button>
            </div>
          </>
        )}
      </div>
    </NodeViewWrapper>
  );
};

export default ResizableYoutubeView;
