import React, { useRef, useState } from "react";
import ReactDOM from "react-dom/client";
import { Editor, EditorRef } from "./components/Editor";
import Viewer from "./components/Viewer";
import "./styles/editor.css";
import "./styles/dev.css";

const SAMPLE = `<p>Write exam questions with inline math like <span data-type="math" data-latex="E = mc^2">E = mc^2</span> right in the sentence.</p>
<p>Text before <span data-type="math" data-latex="\\int_{-\\infty}^{\\infty} e^{-x^2}\\,dx = \\sqrt{\\pi}" data-display-mode="true" class="math-node-wrapper math-node-wrapper-block">\\int_{-\\infty}^{\\infty} e^{-x^2}\\,dx = \\sqrt{\\pi}</span> and text after stays editable.</p>
<p>Use <strong>Ctrl/Cmd + M</strong> for the equation dialog, or type <code>$x^2$</code> for quick inline math.</p>`;

const DevApp: React.FC = () => {
  const editorRef = useRef<EditorRef>(null);
  const [content, setContent] = useState(SAMPLE);

  return (
    <div className="dev-app max-w-7xl mx-auto px-4 py-8">
      <header className="dev-header flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-zinc-200">
        <div className="dev-brand flex items-center gap-3">
          <span
            className="dev-mark w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br from-teal-700 to-teal-900 text-emerald-50 font-serif text-xl shadow-md shrink-0 select-none"
            aria-hidden="true"
          >
            ∑
          </span>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-zinc-900 m-0 tracking-tight">
              React LaTeX Editor
            </h1>
            <p className="text-xs md:text-sm text-zinc-500 m-0 mt-0.5">
              Professional rich text with MathLive equations, tables, images &amp; video
            </p>
          </div>
        </div>
        <div className="dev-actions flex items-center gap-2">
          <button
            type="button"
            className="dev-btn px-3.5 py-1.5 text-xs font-semibold text-zinc-700 bg-white border border-zinc-300 rounded-lg hover:bg-zinc-50 active:bg-zinc-100 transition-colors shadow-2xs cursor-pointer"
            onClick={() => editorRef.current?.clearContent()}
          >
            Clear
          </button>
          <button
            type="button"
            className="dev-btn dev-btn-primary px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 active:bg-teal-900 border border-transparent rounded-lg transition-colors shadow-2xs cursor-pointer"
            onClick={() => {
              const html = editorRef.current?.getHTML() ?? "";
              void navigator.clipboard?.writeText(html);
            }}
          >
            Copy HTML
          </button>
        </div>
      </header>

      <main className="dev-layout grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="dev-panel flex flex-col bg-white rounded-xl border border-zinc-200 shadow-xs overflow-hidden">
          <div className="dev-panel-header flex items-center justify-between px-4 py-3 bg-zinc-50 border-b border-zinc-200">
            <h2 className="text-sm font-semibold text-zinc-800 m-0">Editor</h2>
            <span className="dev-hint text-xs text-zinc-400 font-mono">Ctrl+M math · Ctrl+K link</span>
          </div>
          <Editor
            ref={editorRef}
            initialContent={content}
            onChange={setContent}
            placeholder="Start writing… insert math with Ctrl/Cmd+M"
            autoFocus
            minHeight="420px"
          />
        </section>

        <section className="dev-panel dev-preview flex flex-col bg-white rounded-xl border border-zinc-200 shadow-xs overflow-hidden">
          <div className="dev-panel-header flex items-center justify-between px-4 py-3 bg-zinc-50 border-b border-zinc-200">
            <h2 className="text-sm font-semibold text-zinc-800 m-0">Live preview</h2>
            <span className="dev-hint text-xs text-zinc-400 font-mono">MathJax render</span>
          </div>
          <div className="dev-preview-body p-4 flex-1 overflow-auto bg-zinc-50/30">
            <Viewer content={content} />
          </div>
        </section>
      </main>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <DevApp />
  </React.StrictMode>,
);
