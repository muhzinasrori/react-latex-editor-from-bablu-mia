import type { Editor } from "@tiptap/react";
import { useEditorForceUpdate } from "../hooks/useEditorForceUpdate";

interface TableControlsProps {
  editor: Editor | null;
  readOnly?: boolean;
}

const TableControls = ({ editor, readOnly }: TableControlsProps) => {
  useEditorForceUpdate(editor);

  if (!editor?.isActive("table")) return null;

  const run = (command: () => boolean) => {
    if (!readOnly) command();
  };

  const btnClass =
    "px-2 py-1 bg-zinc-50 hover:bg-zinc-100 active:bg-zinc-200 text-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer";

  return (
    <div
      className="table-controls flex flex-wrap items-center gap-1.5 p-1.5 bg-white border border-zinc-300 rounded-lg shadow-sm text-xs font-medium my-2"
      role="toolbar"
      aria-label="Table controls"
    >
      <div className="table-controls-group inline-flex items-center border border-zinc-200 rounded divide-x divide-zinc-200 overflow-hidden">
        <button
          onClick={() => run(() => editor.chain().focus().addColumnBefore().run())}
          title="Add column before"
          disabled={readOnly}
          className={btnClass}
          type="button"
        >
          ←+
        </button>
        <button
          onClick={() => run(() => editor.chain().focus().addColumnAfter().run())}
          title="Add column after"
          disabled={readOnly}
          className={btnClass}
          type="button"
        >
          +→
        </button>
        <button
          onClick={() => run(() => editor.chain().focus().deleteColumn().run())}
          title="Delete column"
          disabled={readOnly}
          className={btnClass}
          type="button"
        >
          − Col
        </button>
      </div>
      <div className="table-controls-group inline-flex items-center border border-zinc-200 rounded divide-x divide-zinc-200 overflow-hidden">
        <button
          onClick={() => run(() => editor.chain().focus().addRowBefore().run())}
          title="Add row before"
          disabled={readOnly}
          className={btnClass}
          type="button"
        >
          ↑+
        </button>
        <button
          onClick={() => run(() => editor.chain().focus().addRowAfter().run())}
          title="Add row after"
          disabled={readOnly}
          className={btnClass}
          type="button"
        >
          +↓
        </button>
        <button
          onClick={() => run(() => editor.chain().focus().deleteRow().run())}
          title="Delete row"
          disabled={readOnly}
          className={btnClass}
          type="button"
        >
          − Row
        </button>
      </div>
      <button
        onClick={() => run(() => editor.chain().focus().deleteTable().run())}
        title="Delete table"
        disabled={readOnly}
        className="delete-table-button px-2.5 py-1 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 active:bg-red-200 border border-red-200 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        type="button"
      >
        Delete table
      </button>
    </div>
  );
};

export default TableControls;
