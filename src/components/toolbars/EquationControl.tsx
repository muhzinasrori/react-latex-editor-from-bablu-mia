import ToolbarButton from "./ToolbarButton";
import type { Editor } from "@tiptap/react";

export interface EquationControlProps {
  editor: Editor | null;
  readOnly?: boolean;
  onMathDialogOpen?: () => void;
}

const EquationControl = ({
  editor,
  readOnly,
  onMathDialogOpen,
}: EquationControlProps) => {
  return (
    <div
      className="inline-flex items-center shrink-0"
      role="group"
      aria-label="Equation"
    >
      <ToolbarButton
        onClick={onMathDialogOpen}
        title="Insert equation (Rumus matematika)"
        shortcut="Ctrl+M"
        disabled={!editor || readOnly}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 5H9l-4 14H3" />
          <path d="M13 13l6 6" />
          <path d="M13 19l6-6" />
        </svg>
      </ToolbarButton>
    </div>
  );
};

export default EquationControl;
