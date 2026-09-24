import { setFontFamily, setFontSize } from "../../utils";
import { FONT_FAMILIES, FONT_SIZES } from "../../constants/editorConstants";
import type { Editor } from "@tiptap/react";

export interface FontControlsProps {
  editor: Editor | null;
  readOnly?: boolean;
}

const FontControls = ({ editor, readOnly }: FontControlsProps) => {
  const currentFontSize =
    editor?.getAttributes("customTextStyle")?.fontSize || "";
  const currentFontFamily =
    editor?.getAttributes("customTextStyle")?.fontFamily || "";

  return (
    <div
      className="toolbar-group toolbar-font-controls inline-flex items-stretch gap-0 p-[2px] m-0 border border-zinc-300 bg-white rounded-lg shadow-xs flex-nowrap divide-x divide-zinc-200"
      role="group"
      aria-label="Font"
    >
      <select
        className="toolbar-select toolbar-select-font h-8 min-h-[32px] max-h-[32px] w-[118px] pl-2.5 pr-7 py-0 text-[13px] font-medium text-zinc-700 bg-transparent border border-transparent rounded-l-[5px] cursor-pointer appearance-none outline-none transition-colors hover:bg-zinc-100 hover:border-zinc-300 focus:bg-white focus:border-teal-700 disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label="Font family"
        disabled={!editor || readOnly}
        value={currentFontFamily}
        onChange={(e) => setFontFamily(editor, e.target.value)}
      >
        {FONT_FAMILIES.map((font) => (
          <option key={font.name} value={font.value}>
            {font.name}
          </option>
        ))}
      </select>

      <select
        className="toolbar-select toolbar-select-size h-8 min-h-[32px] max-h-[32px] w-[68px] pl-2 pr-6 py-0 text-[13px] font-medium text-zinc-700 bg-transparent border border-transparent rounded-r-[5px] cursor-pointer appearance-none outline-none transition-colors hover:bg-zinc-100 hover:border-zinc-300 focus:bg-white focus:border-teal-700 disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label="Font size"
        disabled={!editor || readOnly}
        value={currentFontSize}
        onChange={(e) => {
          if (e.target.value) setFontSize(editor, e.target.value);
          else editor?.chain().focus().unsetMark("customTextStyle").run();
        }}
      >
        <option value="">Size</option>
        {FONT_SIZES.map((size) => (
          <option key={size} value={size}>
            {size.replace("px", "")}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FontControls;
