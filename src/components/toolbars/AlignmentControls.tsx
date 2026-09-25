import ToolbarButton from "./ToolbarButton";
import type { Editor } from "@tiptap/react";

export interface AlignmentControlsProps {
  editor: Editor | null;
  readOnly?: boolean;
}

type Alignment = "left" | "center" | "right" | "justify";

const nextAlignmentMap: Record<Alignment, Alignment> = {
  left: "center",
  center: "right",
  right: "justify",
  justify: "left",
};

function getCurrentAlignment(editor: Editor | null): Alignment {
  if (editor?.isActive({ textAlign: "center" })) return "center";
  if (editor?.isActive({ textAlign: "right" })) return "right";
  if (editor?.isActive({ textAlign: "justify" })) return "justify";
  return "left";
}

const AlignmentControls = ({ editor, readOnly }: AlignmentControlsProps) => {
  const current = getCurrentAlignment(editor);

  const handleCycle = () => {
    if (!editor || readOnly) return;
    const next = nextAlignmentMap[current];
    editor.chain().focus().setTextAlign(next).run();
  };

  const getTitle = () => {
    switch (current) {
      case "center":
        return "Align: Center (klik untuk Align Right)";
      case "right":
        return "Align: Right (klik untuk Justify)";
      case "justify":
        return "Align: Justify (klik untuk Align Left)";
      default:
        return "Align: Left (klik untuk Align Center)";
    }
  };

  return (
    <div
      className="inline-flex items-center shrink-0"
      role="group"
      aria-label="Text alignment"
    >
      <ToolbarButton
        onClick={handleCycle}
        isActive={current !== "left"}
        title={getTitle()}
        disabled={!editor || readOnly}
      >
        {current === "center" && (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="6" y1="12" x2="18" y2="12" />
            <line x1="8" y1="18" x2="16" y2="18" />
          </svg>
        )}
        {current === "right" && (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="10" y1="12" x2="20" y2="12" />
            <line x1="6" y1="18" x2="20" y2="18" />
          </svg>
        )}
        {current === "justify" && (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="18" x2="20" y2="18" />
          </svg>
        )}
        {current === "left" && (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="12" x2="14" y2="12" />
            <line x1="4" y1="18" x2="18" y2="18" />
          </svg>
        )}
      </ToolbarButton>
    </div>
  );
};

export default AlignmentControls;
