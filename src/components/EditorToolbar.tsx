import AlignmentControls from "./toolbars/AlignmentControls";
import HistoryControls from "./toolbars/HistoryControls";
import ListControls from "./toolbars/ListControls";
import TextFormattingControls from "./toolbars/TextFormattingControls";
import EquationControl from "./toolbars/EquationControl";
import MoreControls from "./toolbars/MoreControls";
import ImageAlignmentControls from "./toolbars/ImageAlignmentControls";
import ImageGroupAlignmentControls from "./toolbars/ImageGroupAlignmentControls";
import YouTubeControls from "./toolbars/YouTubeControls";
import ToolbarDivider from "./toolbars/ToolbarDivider";
import { useEditorForceUpdate } from "../hooks/useEditorForceUpdate";
import type { Editor } from "@tiptap/react";

export interface EditorToolbarProps {
  editor: Editor | null;
  readOnly?: boolean;
  onMathDialogOpen?: () => void;
  onImagePicker?: () => void;
}

const EditorToolbar = (props: EditorToolbarProps) => {
  const { editor, readOnly, onMathDialogOpen, onImagePicker } = props;

  useEditorForceUpdate(editor);

  return (
    <div
      className="toolbar sticky top-0 z-10 block p-2 bg-zinc-100/90 backdrop-blur-xs border-b border-zinc-200 rounded-t-xl"
      role="toolbar"
      aria-label="Editor toolbar"
    >
      <div className="toolbar-row flex flex-wrap items-center gap-1.5 w-full min-h-[32px]">
        {/* 1. History: Undo, Redo */}
        <HistoryControls editor={editor} readOnly={readOnly} />

        <ToolbarDivider />

        {/* 2. Primary Text Formatting: Bold, Italic, Strike, Underline, Clear formatting */}
        <TextFormattingControls editor={editor} readOnly={readOnly} variant="primary" />

        <ToolbarDivider />

        {/* 3. Paragraph Alignment: Left, Center, Right, Justify */}
        <AlignmentControls editor={editor} readOnly={readOnly} />

        <ToolbarDivider />

        {/* 4. Lists: Bullet list (dot), Numbered list (angka 123) */}
        <ListControls editor={editor} readOnly={readOnly} variant="primary" />

        <ToolbarDivider />

        {/* 5. Equation */}
        <EquationControl
          editor={editor}
          readOnly={readOnly}
          onMathDialogOpen={onMathDialogOpen}
        />

        <ToolbarDivider />

        {/* 6. Three-dots menu (Menu titik tiga) for all remaining tools */}
        <MoreControls
          editor={editor}
          readOnly={readOnly}
          onImagePicker={onImagePicker}
        />

        {/* Contextual controls for selected media */}
        <ImageAlignmentControls editor={editor} readOnly={readOnly} />
        <ImageGroupAlignmentControls editor={editor} readOnly={readOnly} />
        <YouTubeControls editor={editor} readOnly={readOnly} />
      </div>
    </div>
  );
};

export default EditorToolbar;
