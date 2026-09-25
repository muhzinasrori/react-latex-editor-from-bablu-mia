import AlignmentControls from "./toolbars/AlignmentControls";
import HistoryControls from "./toolbars/HistoryControls";
import ListControls from "./toolbars/ListControls";
import TextFormattingControls from "./toolbars/TextFormattingControls";
import EquationControl from "./toolbars/EquationControl";
import MoreControls from "./toolbars/MoreControls";
import ImageAlignmentControls from "./toolbars/ImageAlignmentControls";
import ImageGroupAlignmentControls from "./toolbars/ImageGroupAlignmentControls";
import YouTubeControls from "./toolbars/YouTubeControls";
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
      className="toolbar sticky top-0 z-10 block p-1.5 sm:p-2 bg-slate-50/95 backdrop-blur-xs border-b border-slate-200 rounded-t-xl"
      role="toolbar"
      aria-label="Editor toolbar"
    >
      <div className="toolbar-row flex items-center flex-nowrap overflow-x-auto no-scrollbar w-full py-0.5 gap-1.5">
        {/* Unified seamless toolbar strip: all icons sit in one continuous row */}
        <div className="inline-flex items-center p-0.5 bg-white border border-slate-200/90 rounded-lg shadow-xs shrink-0 gap-0.5">
          {/* 1. History: Undo, Redo */}
          <HistoryControls editor={editor} readOnly={readOnly} />

          {/* 2. Primary Text Formatting: Bold, Italic, Strike, Underline, Clear formatting */}
          <TextFormattingControls editor={editor} readOnly={readOnly} variant="primary" />

          {/* 3. Paragraph Alignment: Left -> Center -> Right -> Justify (Single cycling icon) */}
          <AlignmentControls editor={editor} readOnly={readOnly} />

          {/* 4. Lists: Bullet list (dot), Numbered list (angka 123) */}
          <ListControls editor={editor} readOnly={readOnly} variant="primary" />

          {/* 5. Equation */}
          <EquationControl
            editor={editor}
            readOnly={readOnly}
            onMathDialogOpen={onMathDialogOpen}
          />

          {/* 6. Three-dots menu (Menu titik tiga) */}
          <MoreControls
            editor={editor}
            readOnly={readOnly}
            onImagePicker={onImagePicker}
          />
        </div>

        {/* Contextual controls for selected media */}
        <ImageAlignmentControls editor={editor} readOnly={readOnly} />
        <ImageGroupAlignmentControls editor={editor} readOnly={readOnly} />
        <YouTubeControls editor={editor} readOnly={readOnly} />
      </div>
    </div>
  );
};

export default EditorToolbar;
