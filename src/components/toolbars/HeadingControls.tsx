import { HEADING_LEVELS } from "../../constants/editorConstants";
import type { Editor } from "@tiptap/react";
import type { Level } from "@tiptap/extension-heading";

interface HeadingControlsProps {
  editor: Editor | null;
  readOnly?: boolean;
}

function getCurrentHeading(editor: Editor | null): string {
  if (!editor) return "paragraph";
  for (const level of HEADING_LEVELS) {
    if (editor.isActive("heading", { level })) return String(level);
  }
  return "paragraph";
}

const HeadingControls = ({ editor, readOnly }: HeadingControlsProps) => {
  const value = getCurrentHeading(editor);

  return (
    <div
      className="toolbar-group inline-flex items-stretch gap-0 p-[2px] m-0 border border-zinc-300 bg-white rounded-lg shadow-xs flex-nowrap"
      role="group"
      aria-label="Block style"
    >
      <select
        className="toolbar-select toolbar-select-heading h-8 min-h-[32px] max-h-[32px] w-28 pl-2.5 pr-7 py-0 text-[13px] font-medium text-zinc-700 bg-transparent border border-transparent rounded-[5px] cursor-pointer appearance-none outline-none transition-colors hover:bg-zinc-100 hover:border-zinc-300 focus:bg-white focus:border-teal-700 disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label="Text style"
        disabled={!editor || readOnly}
        value={value}
        onChange={(e) => {
          if (!editor) return;
          const next = e.target.value;
          if (next === "paragraph") {
            editor.chain().focus().setParagraph().run();
            return;
          }
          editor
            .chain()
            .focus()
            .toggleHeading({ level: Number(next) as Level })
            .run();
        }}
      >
        <option value="paragraph">Paragraph</option>
        {HEADING_LEVELS.map((level) => (
          <option key={level} value={level}>
            Heading {level}
          </option>
        ))}
      </select>
    </div>
  );
};

export default HeadingControls;
