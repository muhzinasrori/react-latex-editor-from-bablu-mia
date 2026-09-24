import { setBackgroundColor } from "../../utils";
import type { Editor } from "@tiptap/react";

interface ColorControlsProps {
  editor: Editor | null;
  readOnly?: boolean;
}

const ColorControls = ({ editor, readOnly }: ColorControlsProps) => {
  const textColor = editor?.getAttributes("textStyle")?.color || "#000000";
  const bgColor =
    editor?.getAttributes("backgroundColor")?.backgroundColor || "#ffffff";

  return (
    <div
      className="toolbar-group inline-flex items-stretch gap-0 p-[2px] m-0 border border-zinc-300 bg-white rounded-lg shadow-xs flex-nowrap divide-x divide-zinc-200"
      role="group"
      aria-label="Colors"
    >
      <label
        className="toolbar-color relative inline-flex items-center justify-center w-8 h-8 border border-transparent rounded-[5px] cursor-pointer overflow-hidden shrink-0 hover:bg-zinc-100 hover:border-zinc-300 transition-colors"
        title="Text color"
      >
        <span
          className="toolbar-color-icon flex flex-col items-center justify-center gap-0.5 text-xs font-bold leading-none text-zinc-700 pointer-events-none font-serif"
          aria-hidden="true"
        >
          A
          <i
            className="block w-3.5 h-[3px] rounded-xs"
            style={{ background: textColor }}
          />
        </span>
        <input
          type="color"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer border-none p-0"
          aria-label="Text color"
          disabled={!editor || readOnly}
          value={/^#[0-9A-Fa-f]{6}$/.test(textColor) ? textColor : "#000000"}
          onChange={(e) =>
            editor?.chain().focus().setColor(e.target.value).run()
          }
        />
      </label>
      <label
        className="toolbar-color relative inline-flex items-center justify-center w-8 h-8 border border-transparent rounded-[5px] cursor-pointer overflow-hidden shrink-0 hover:bg-zinc-100 hover:border-zinc-300 transition-colors"
        title="Highlight color"
      >
        <span
          className="toolbar-color-icon toolbar-color-icon-bg w-4 h-4 rounded-xs border border-zinc-300 bg-white overflow-hidden inline-flex"
          aria-hidden="true"
        >
          <i
            className="w-full h-full"
            style={{ background: bgColor }}
          />
        </span>
        <input
          type="color"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer border-none p-0"
          aria-label="Background color"
          disabled={!editor || readOnly}
          value={/^#[0-9A-Fa-f]{6}$/.test(bgColor) ? bgColor : "#ffffff"}
          onChange={(e) => setBackgroundColor(editor, e.target.value)}
        />
      </label>
    </div>
  );
};

export default ColorControls;
