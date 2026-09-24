import type { Editor } from "@tiptap/react";
import { useEditorForceUpdate } from "../hooks/useEditorForceUpdate";
import { EDITOR_LIMITS } from "../constants/config";
import { getEditorContentStats } from "../utils/contentStats";

const CharacterCount = ({ editor }: { editor: Editor | null }) => {
  useEditorForceUpdate(editor);

  if (!editor) return null;

  const { characters, words, equations, images, videos } =
    getEditorContentStats(editor);
  const limit = EDITOR_LIMITS.maxCharacters;
  const nearLimit = characters >= limit * 0.9;
  const overLimit = characters >= limit;

  const extras: string[] = [];
  if (equations) extras.push(`${equations} eq`);
  if (images) extras.push(`${images} img`);
  if (videos) extras.push(`${videos} video`);

  return (
    <div
      className={`character-count flex flex-wrap items-center justify-between gap-3 px-3 py-1.5 text-xs border-t border-zinc-200 bg-zinc-50/70 rounded-b-xl ${
        overLimit
          ? "text-red-600 font-semibold bg-red-50/60 is-over-limit"
          : nearLimit
          ? "text-amber-600 font-medium bg-amber-50/50 is-near-limit"
          : "text-zinc-500"
      }`}
      aria-live="polite"
    >
      <span className="character-count-primary flex items-center gap-1.5">
        <span>
          {characters.toLocaleString()}
          {limit ? ` / ${limit.toLocaleString()}` : ""} chars
        </span>
        <span aria-hidden="true"> · </span>
        <span>{words.toLocaleString()} words</span>
      </span>
      {extras.length > 0 && (
        <span className="character-count-extras text-zinc-400 font-mono text-[11px]">
          {extras.join(" · ")}
        </span>
      )}
    </div>
  );
};

export default CharacterCount;
