import AlignmentControls from "./toolbars/AlignmentControls";
import BlockControls from "./toolbars/BlockControls";
import ColorControls from "./toolbars/ColorControls";
import FontControls from "./toolbars/FontControls";
import HeadingControls from "./toolbars/HeadingControls";
import HistoryControls from "./toolbars/HistoryControls";
import ImageAlignmentControls from "./toolbars/ImageAlignmentControls";
import ImageGroupAlignmentControls from "./toolbars/ImageGroupAlignmentControls";
import ListControls from "./toolbars/ListControls";
import SpecialFeaturesControls from "./toolbars/SpecialFeaturesControls";
import TextFormattingControls from "./toolbars/TextFormattingControls";
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
        <HistoryControls editor={editor} readOnly={readOnly} />
        <ToolbarDivider />
        <TextFormattingControls editor={editor} readOnly={readOnly} />
        <ToolbarDivider />
        <ColorControls editor={editor} readOnly={readOnly} />
        <ToolbarDivider />
        <FontControls editor={editor} readOnly={readOnly} />
        <HeadingControls editor={editor} readOnly={readOnly} />
        <ToolbarDivider />
        <AlignmentControls editor={editor} readOnly={readOnly} />
        <ListControls editor={editor} readOnly={readOnly} />
        <ToolbarDivider />
        <BlockControls editor={editor} readOnly={readOnly} />
        <ToolbarDivider />
        <SpecialFeaturesControls
          editor={editor}
          readOnly={readOnly}
          onMathDialogOpen={onMathDialogOpen ?? (() => {})}
          onImagePicker={onImagePicker ?? (() => {})}
        />
        <ImageAlignmentControls editor={editor} readOnly={readOnly} />
        <ImageGroupAlignmentControls editor={editor} readOnly={readOnly} />
        <YouTubeControls editor={editor} readOnly={readOnly} />
      </div>
    </div>
  );
};

export default EditorToolbar;
