import React, {
  forwardRef,
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { MathfieldElement, ensureMathLiveLoaded } from "../types/mathlive";
import ModalPortal from "./ModalPortal";
import "../styles/mathEquationDialog.css";

// Ensure MathLive is loaded (especially important for Next.js)
ensureMathLiveLoaded();

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "math-field": React.DetailedHTMLProps<
        React.HTMLAttributes<MathfieldElement>,
        MathfieldElement
      > & {
        ref?: React.Ref<MathfieldElement>;
        value?: string;
        onInput?: (event: any) => void;
        "virtual-keyboard-mode"?: string;
        "math-mode"?: string;
        "smart-mode"?: string;
        "smart-fence"?: string;
        "smart-superscript"?: string;
        "smart-subscript"?: string;
        "smart-operator"?: string;
        "smart-fraction"?: string;
        "smart-sqrt"?: string;
        "smart-bracket"?: string;
        "smart-paren"?: string;
        "smart-quote"?: string;
        "smart-space"?: string;
        "smart-command"?: string;
        "menu-items"?: string;
        "menu-toggle"?: string;
        "menu-toggle-visible"?: string;
        [key: string]: any;
      };
    }
  }
}

// The MathfieldElement is automatically registered when importing 'mathlive'
// No need to manually register it

interface MathEquationDialogProps {
  onClose: () => void;
  onInsert: (latex: string, displayMode?: boolean) => void;
  initialValue?: string;
}

interface SymbolItem {
  symbol: string;
  title: string;
  display: string;
}

type TabSections = {
  [K in
    | "basic"
    | "fractions"
    | "powers"
    | "trig"
    | "logs"
    | "greek"
    | "calculus"
    | "symbols"
    | "geometry"
    | "brackets"
    | "matrix"]: SymbolItem[];
};

const MathEquationDialog = forwardRef<HTMLDivElement, MathEquationDialogProps>(
  ({ onClose, onInsert, initialValue = "" }, _ref) => {
    const [latex, setLatex] = useState(initialValue);
    const [activeTab, setActiveTab] = useState<keyof TabSections>("basic");
    const [isInserting, setIsInserting] = useState(false);
    const [displayMode, setDisplayMode] = useState(false);
    const mathFieldRef = useRef<MathfieldElement | null>(null);
    const textInputRef = useRef<HTMLInputElement | null>(null);
    const dialogRef = useRef<HTMLDivElement>(null);
    const latexRef = useRef(latex);
    latexRef.current = latex;

    const handleInput = useCallback((e: any) => {
      setLatex(e.target.value);
    }, []);

    const handleTextChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setLatex(val);
        if (mathFieldRef.current) {
          mathFieldRef.current.value = val;
        }
      },
      [],
    );

    const handleClose = useCallback(() => {
      if (typeof window !== "undefined") {
        try {
          (window as any).mathVirtualKeyboard?.hide();
        } catch (_) {}
      }
      onClose();
    }, [onClose]);

    const showVirtualKeyboard = useCallback(() => {
      if (typeof window !== "undefined") {
        const mvk = (window as any).mathVirtualKeyboard;
        if (mvk) {
          try {
            mvk.show();
          } catch (_) {}
        }
      }
    }, []);

    const toggleVirtualKeyboard = useCallback(() => {
      if (typeof window !== "undefined") {
        const mvk = (window as any).mathVirtualKeyboard;
        if (mvk) {
          try {
            if (mvk.visible) {
              mvk.hide();
            } else {
              mvk.show();
              mathFieldRef.current?.focus();
            }
          } catch (_) {}
        }
      }
    }, []);

    const handleSave = useCallback(() => {
      const value = latexRef.current.trim();
      if (!value) return;

      setIsInserting(true);
      try {
        if (typeof window !== "undefined") {
          try {
            (window as any).mathVirtualKeyboard?.hide();
          } catch (_) {}
        }
        onInsert(value, displayMode);
        onClose();
      } finally {
        setIsInserting(false);
      }
    }, [onInsert, onClose, displayMode]);

    const insertSymbol = useCallback((symbol: string) => {
      if (mathFieldRef.current) {
        mathFieldRef.current.insert(symbol);
        mathFieldRef.current.focus();
        setLatex(mathFieldRef.current.value);
      }
    }, []);

    // Focus math field once on mount, setup mobile virtual keyboard, translate menu & fix mobile touch bug
    useEffect(() => {
      if (typeof document !== "undefined") {
        document.documentElement.style.setProperty(
          "--keyboard-zindex",
          "2147483005",
        );
      }

      const id = requestAnimationFrame(() => {
        if (mathFieldRef.current) {
          if (initialValue) {
            mathFieldRef.current.value = initialValue;
          }
          try {
            mathFieldRef.current.mathVirtualKeyboardPolicy = "auto";
          } catch (_) {}

          // Terjemahkan isi menu garis tiga (context menu) ke Bahasa Indonesia
          const translateMenuItems = (items: readonly any[]): any[] => {
            if (!items || !Array.isArray(items)) return [];
            return items.map((item) => {
              let label = item.label;
              if (typeof label === "string") {
                const lower = label.toLowerCase();
                if (lower === "insert matrix" || lower.includes("insert matrix")) {
                  label = label.replace(/insert matrix/i, "Sisipkan Matriks");
                } else if (lower === "matrix") {
                  label = "Matriks";
                } else if (lower === "cut") {
                  label = "Potong (Cut)";
                } else if (lower === "copy") {
                  label = "Salin (Copy)";
                } else if (lower === "paste") {
                  label = "Tempel (Paste)";
                } else if (lower === "select all") {
                  label = "Pilih Semua";
                } else if (lower === "undo") {
                  label = "Urungkan (Undo)";
                } else if (lower === "redo") {
                  label = "Ulangi (Redo)";
                }
              }
              const newItem = { ...item, label };
              if (item.submenu && Array.isArray(item.submenu)) {
                newItem.submenu = translateMenuItems(item.submenu);
              }
              return newItem;
            });
          };

          try {
            if (mathFieldRef.current.menuItems) {
              mathFieldRef.current.menuItems = translateMenuItems(
                mathFieldRef.current.menuItems,
              );
            }
          } catch (_) {}

          mathFieldRef.current.focus();
        }
      });

      // Fix MathLive's hamburger menu toggle bug on mobile / touch devices:
      // Di HP, MathLive membuka menu pada pointerdown dan langsung menutupnya pada pointerup (saat jari diangkat).
      // Kita cegah trigger prematur di pointerdown dan trigger toggleContextMenu saat sentuhan dilepas (touchend/pointerup).
      const mf = mathFieldRef.current;
      let cleanupTouchListeners: (() => void) | undefined;

      if (mf) {
        const isMenuToggle = (el: any): boolean => {
          if (!el) return false;
          if (typeof el.getAttribute === "function") {
            const part = el.getAttribute("part") || "";
            if (part.includes("menu-toggle")) return true;
          }
          if (
            el.classList &&
            (el.classList.contains("ML__menu-toggle") ||
              el.classList.contains("ui-menu-toggle"))
          ) {
            return true;
          }
          if (
            el.closest &&
            el.closest('[part*="menu-toggle"], .ML__menu-toggle')
          ) {
            return true;
          }
          return false;
        };

        const isToggleEvent = (e: Event): boolean => {
          const path = e.composedPath ? e.composedPath() : [];
          return path.some((target) => isMenuToggle(target));
        };

        let lastToggleTime = 0;
        const triggerToggle = (e: Event) => {
          const now = Date.now();
          if (now - lastToggleTime < 350) return;
          lastToggleTime = now;

          e.preventDefault();
          e.stopPropagation();

          try {
            mf.executeCommand?.("toggleContextMenu");
          } catch (_) {}
        };

        const handlePointerDown = (e: PointerEvent) => {
          if (e.pointerType === "touch" && isToggleEvent(e)) {
            e.stopPropagation();
          }
        };

        const handleTouchStart = (e: TouchEvent) => {
          if (isToggleEvent(e)) {
            e.stopPropagation();
          }
        };

        const handlePointerUp = (e: PointerEvent) => {
          if (e.pointerType === "touch" && isToggleEvent(e)) {
            triggerToggle(e);
          }
        };

        const handleTouchEnd = (e: TouchEvent) => {
          if (isToggleEvent(e)) {
            triggerToggle(e);
          }
        };

        mf.addEventListener("pointerdown", handlePointerDown, { capture: true });
        mf.addEventListener("touchstart", handleTouchStart, { capture: true });
        mf.addEventListener("pointerup", handlePointerUp, { capture: true });
        mf.addEventListener("touchend", handleTouchEnd, { capture: true });

        // Pasang juga langsung ke elemen toggle di shadowRoot
        const attachShadow = () => {
          const shadow = mf.shadowRoot;
          if (!shadow) return;
          const toggleBtn = shadow.querySelector(
            '[part*="menu-toggle"], .ML__menu-toggle'
          ) as HTMLElement | null;
          if (toggleBtn) {
            const onShadowDown = (e: Event) => {
              if (
                (e as PointerEvent).pointerType === "touch" ||
                e.type === "touchstart"
              ) {
                e.stopPropagation();
              }
            };
            toggleBtn.addEventListener("pointerdown", onShadowDown, { capture: true });
            toggleBtn.addEventListener("touchstart", onShadowDown, { capture: true });
            toggleBtn.addEventListener("pointerup", triggerToggle, { capture: true });
            toggleBtn.addEventListener("touchend", triggerToggle, { capture: true });
          }
        };

        attachShadow();
        const shadowTimer = setTimeout(attachShadow, 150);

        cleanupTouchListeners = () => {
          clearTimeout(shadowTimer);
          mf.removeEventListener("pointerdown", handlePointerDown, { capture: true });
          mf.removeEventListener("touchstart", handleTouchStart, { capture: true });
          mf.removeEventListener("pointerup", handlePointerUp, { capture: true });
          mf.removeEventListener("touchend", handleTouchEnd, { capture: true });
        };
      }

      return () => {
        cancelAnimationFrame(id);
        cleanupTouchListeners?.();
        if (typeof window !== "undefined") {
          try {
            (window as any).mathVirtualKeyboard?.hide();
          } catch (_) {}
        }
      };
    }, [initialValue]);

    // Escape to close; Ctrl/Cmd+Enter to insert (Enter alone stays in math field)
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          e.preventDefault();
          handleClose();
          return;
        }
        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          handleSave();
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }, [handleClose, handleSave]);

    // Trap focus / lock body scroll while open
    useEffect(() => {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }, []);
    const toolbarSections: TabSections = useMemo(
      () => ({
        basic: [
          { symbol: "+", title: "Plus", display: "+" },
          { symbol: "-", title: "Minus", display: "−" },
          { symbol: "\\times", title: "Multiply", display: "×" },
          { symbol: "\\div", title: "Divide", display: "÷" },
          { symbol: "\\pm", title: "Plus Minus", display: "±" },
          { symbol: "\\mp", title: "Minus Plus", display: "∓" },
          { symbol: "=", title: "Equals", display: "=" },
          { symbol: "\\neq", title: "Not Equal", display: "≠" },
          { symbol: "\\approx", title: "Approximately", display: "≈" },
          { symbol: "\\equiv", title: "Equivalent", display: "≡" },
          { symbol: "<", title: "Less Than", display: "<" },
          { symbol: ">", title: "Greater Than", display: ">" },
          { symbol: "\\leq", title: "Less or Equal", display: "≤" },
          { symbol: "\\geq", title: "Greater or Equal", display: "≥" },
          { symbol: "\\ll", title: "Much Less", display: "≪" },
          { symbol: "\\gg", title: "Much Greater", display: "≫" },
          { symbol: "\\frac{a}{b}", title: "Fraction", display: "a/b" },
          { symbol: "#@^2", title: "Square", display: "x²" },
          { symbol: "#@^{n}", title: "Power", display: "xⁿ" },
          { symbol: "\\sqrt{x}", title: "Square Root", display: "√x" },
          { symbol: "\\sqrt[3]{x}", title: "Cube Root", display: "∛x" },
        ],
        fractions: [
          { symbol: "\\frac{a}{b}", title: "Fraction", display: "a/b" },
          { symbol: "\\frac{1}{2}", title: "One Half", display: "½" },
          { symbol: "\\frac{1}{3}", title: "One Third", display: "⅓" },
          { symbol: "\\frac{1}{4}", title: "One Quarter", display: "¼" },
          { symbol: "\\frac{3}{4}", title: "Three Quarters", display: "¾" },
          { symbol: "\\frac{2}{3}", title: "Two Thirds", display: "⅔" },
          { symbol: "\\frac{d}{dx}", title: "Derivative", display: "d/dx" },
          {
            symbol: "\\frac{\\partial}{\\partial x}",
            title: "Partial Derivative",
            display: "∂/∂x",
          },
        ],
        powers: [
          { symbol: "#@^2", title: "Square", display: "x²" },
          { symbol: "#@^3", title: "Cube", display: "x³" },
          { symbol: "#@^{n}", title: "Power", display: "xⁿ" },
          { symbol: "#@_{1}", title: "Subscript", display: "x₁" },
          { symbol: "#@_{x}^{n}", title: "Sub-Superscript", display: "xₙᵐ" },
          { symbol: "\\sqrt{x}", title: "Square Root", display: "√x" },
          { symbol: "\\sqrt[3]{x}", title: "Cube Root", display: "∛x" },
          { symbol: "\\sqrt[n]{x}", title: "Nth Root", display: "ⁿ√x" },
          { symbol: "e^{x}", title: "Exponential", display: "eˣ" },
          { symbol: "10^{x}", title: "Power of 10", display: "10ˣ" },
          { symbol: "#@^{-1}", title: "Reciprocal", display: "x⁻¹" },
        ],
        trig: [
          { symbol: "\\sin", title: "Sine", display: "sin" },
          { symbol: "\\cos", title: "Cosine", display: "cos" },
          { symbol: "\\tan", title: "Tangent", display: "tan" },
          { symbol: "\\cot", title: "Cotangent", display: "cot" },
          { symbol: "\\sec", title: "Secant", display: "sec" },
          { symbol: "\\csc", title: "Cosecant", display: "csc" },
          { symbol: "\\arcsin", title: "Arcsine", display: "sin⁻¹" },
          { symbol: "\\arccos", title: "Arccosine", display: "cos⁻¹" },
          { symbol: "\\arctan", title: "Arctangent", display: "tan⁻¹" },
          { symbol: "\\sinh", title: "Hyperbolic Sine", display: "sinh" },
          { symbol: "\\cosh", title: "Hyperbolic Cosine", display: "cosh" },
          { symbol: "\\tanh", title: "Hyperbolic Tangent", display: "tanh" },
        ],
        logs: [
          { symbol: "\\log", title: "Logarithm", display: "log" },
          { symbol: "\\log_{x}", title: "Log Base", display: "log₍ₓ₎" },
          { symbol: "\\log_{10}", title: "Log Base 10", display: "log₁₀" },
          { symbol: "\\log_2", title: "Log Base 2", display: "log₂" },
          { symbol: "\\ln", title: "Natural Log", display: "ln" },
          { symbol: "\\lg", title: "Common Log", display: "lg" },
          { symbol: "e", title: "Euler's Number", display: "e" },
          { symbol: "\\exp", title: "Exponential Function", display: "exp" },
        ],
        greek: [
          { symbol: "\\alpha", title: "Alpha", display: "α" },
          { symbol: "\\beta", title: "Beta", display: "β" },
          { symbol: "\\gamma", title: "Gamma", display: "γ" },
          { symbol: "\\delta", title: "Delta", display: "δ" },
          { symbol: "\\epsilon", title: "Epsilon", display: "ε" },
          { symbol: "\\zeta", title: "Zeta", display: "ζ" },
          { symbol: "\\eta", title: "Eta", display: "η" },
          { symbol: "\\theta", title: "Theta", display: "θ" },
          { symbol: "\\lambda", title: "Lambda", display: "λ" },
          { symbol: "\\mu", title: "Mu", display: "μ" },
          { symbol: "\\nu", title: "Nu", display: "ν" },
          { symbol: "\\pi", title: "Pi", display: "π" },
          { symbol: "\\rho", title: "Rho", display: "ρ" },
          { symbol: "\\sigma", title: "Sigma", display: "σ" },
          { symbol: "\\tau", title: "Tau", display: "τ" },
          { symbol: "\\phi", title: "Phi", display: "φ" },
          { symbol: "\\chi", title: "Chi", display: "χ" },
          { symbol: "\\psi", title: "Psi", display: "ψ" },
          { symbol: "\\omega", title: "Omega", display: "ω" },
          { symbol: "\\Gamma", title: "Capital Gamma", display: "Γ" },
          { symbol: "\\Delta", title: "Capital Delta", display: "Δ" },
          { symbol: "\\Theta", title: "Capital Theta", display: "Θ" },
          { symbol: "\\Lambda", title: "Capital Lambda", display: "Λ" },
          { symbol: "\\Pi", title: "Capital Pi", display: "Π" },
          { symbol: "\\Sigma", title: "Capital Sigma", display: "Σ" },
          { symbol: "\\Phi", title: "Capital Phi", display: "Φ" },
          { symbol: "\\Psi", title: "Capital Psi", display: "Ψ" },
          { symbol: "\\Omega", title: "Capital Omega", display: "Ω" },
        ],
        calculus: [
          { symbol: "\\sum", title: "Sum", display: "∑" },
          {
            symbol: "\\sum_{i=1}^{n}",
            title: "Sum with Limits",
            display: "∑ᵢ₌₁ⁿ",
          },
          { symbol: "\\prod", title: "Product", display: "∏" },
          {
            symbol: "\\prod_{i=1}^{n}",
            title: "Product with Limits",
            display: "∏ᵢ₌₁ⁿ",
          },
          { symbol: "\\int", title: "Integral", display: "∫" },
          {
            symbol: "\\int_{a}^{b}",
            title: "Definite Integral",
            display: "∫ₐᵇ",
          },
          { symbol: "\\iint", title: "Double Integral", display: "∬" },
          { symbol: "\\iiint", title: "Triple Integral", display: "∭" },
          { symbol: "\\oint", title: "Contour Integral", display: "∮" },
          { symbol: "\\lim", title: "Limit", display: "lim" },
          {
            symbol: "\\lim_{x \\to \\infty}",
            title: "Limit to Infinity",
            display: "lim_{x→∞}",
          },
          {
            symbol: "\\lim_{x \\to 0}",
            title: "Limit to Zero",
            display: "lim_{x→0}",
          },
          { symbol: "\\nabla", title: "Nabla/Gradient", display: "∇" },
          { symbol: "\\partial", title: "Partial", display: "∂" },
        ],
        symbols: [
          { symbol: "\\infty", title: "Infinity", display: "∞" },
          { symbol: "\\emptyset", title: "Empty Set", display: "∅" },
          { symbol: "\\in", title: "Element Of", display: "∈" },
          { symbol: "\\notin", title: "Not Element Of", display: "∉" },
          { symbol: "\\subset", title: "Subset", display: "⊂" },
          { symbol: "\\supset", title: "Superset", display: "⊃" },
          { symbol: "\\subseteq", title: "Subset or Equal", display: "⊆" },
          { symbol: "\\supseteq", title: "Superset or Equal", display: "⊇" },
          { symbol: "\\cup", title: "Union", display: "∪" },
          { symbol: "\\cap", title: "Intersection", display: "∩" },
          { symbol: "\\forall", title: "For All", display: "∀" },
          { symbol: "\\exists", title: "Exists", display: "∃" },
          { symbol: "\\nexists", title: "Does Not Exist", display: "∄" },
          { symbol: "\\therefore", title: "Therefore", display: "∴" },
          { symbol: "\\because", title: "Because", display: "∵" },
          { symbol: "\\propto", title: "Proportional", display: "∝" },
          { symbol: "\\cdot", title: "Center Dot", display: "·" },
          { symbol: "\\bullet", title: "Bullet", display: "•" },
        ],
        geometry: [
          { symbol: "#@^\\circ", title: "Degree Symbol", display: "°" },
          { symbol: "100^\\circ", title: "100 Degrees", display: "100°" },
          { symbol: "90^\\circ", title: "90 Degrees", display: "90°" },
          { symbol: "180^\\circ", title: "180 Degrees", display: "180°" },
          { symbol: "360^\\circ", title: "360 Degrees", display: "360°" },
          { symbol: "\\angle", title: "Angle", display: "∠" },
          { symbol: "\\angle ABC", title: "Angle ABC", display: "∠ABC" },
          { symbol: "\\measuredangle", title: "Measured Angle", display: "∡" },
          {
            symbol: "\\sphericalangle",
            title: "Spherical Angle",
            display: "∢",
          },
          { symbol: "\\triangle", title: "Triangle", display: "△" },
          { symbol: "\\triangle ABC", title: "Triangle ABC", display: "△ABC" },
          { symbol: "\\square", title: "Square", display: "□" },
          { symbol: "\\blacksquare", title: "Black Square", display: "■" },
          { symbol: "\\diamond", title: "Diamond", display: "◊" },
          { symbol: "\\blacklozenge", title: "Black Diamond", display: "⧫" },
          { symbol: "\\bigcirc", title: "Circle", display: "○" },
          { symbol: "\\circ", title: "Small Circle", display: "∘" },
          { symbol: "\\odot", title: "Circle Dot", display: "⊙" },
          { symbol: "\\parallel", title: "Parallel", display: "∥" },
          { symbol: "\\nparallel", title: "Not Parallel", display: "∦" },
          { symbol: "\\perp", title: "Perpendicular", display: "⊥" },
          { symbol: "\\cong", title: "Congruent", display: "≅" },
          { symbol: "\\ncong", title: "Not Congruent", display: "≇" },
          { symbol: "\\sim", title: "Similar", display: "∼" },
          { symbol: "\\nsim", title: "Not Similar", display: "≁" },
          { symbol: "\\simeq", title: "Similar or Equal", display: "≃" },
          { symbol: "\\overline{AB}", title: "Line Segment", display: "AB̄" },
          { symbol: "\\overrightarrow{AB}", title: "Ray", display: "AB⃗" },
          { symbol: "\\overleftrightarrow{AB}", title: "Line", display: "AB↔" },
        ],
        brackets: [
          { symbol: "()", title: "Parentheses", display: "( )" },
          { symbol: "[]", title: "Square Brackets", display: "[ ]" },
          { symbol: "\\{\\}", title: "Curly Braces", display: "{ }" },
          {
            symbol: "\\langle\\rangle",
            title: "Angle Brackets",
            display: "⟨ ⟩",
          },
          {
            symbol: "\\left(\\right)",
            title: "Auto-sized Parentheses",
            display: "( )",
          },
          {
            symbol: "\\left[\\right]",
            title: "Auto-sized Brackets",
            display: "[ ]",
          },
          {
            symbol: "\\left\\{\\right\\}",
            title: "Auto-sized Braces",
            display: "{ }",
          },
          {
            symbol: "\\left|\\right|",
            title: "Absolute Value",
            display: "| |",
          },
          { symbol: "\\left\\|\\right\\|", title: "Norm", display: "‖ ‖" },
          {
            symbol: "\\left\\langle\\right\\rangle",
            title: "Auto-sized Angle",
            display: "⟨ ⟩",
          },
          {
            symbol: "\\left\\lceil\\right\\rceil",
            title: "Ceiling",
            display: "⌈ ⌉",
          },
          {
            symbol: "\\left\\lfloor\\right\\rfloor",
            title: "Floor",
            display: "⌊ ⌋",
          },
        ],
        matrix: [
          {
            symbol: "\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}",
            title: "Matriks Kurung Biasa 2×2 (pmatrix)",
            display: "(2×2)",
          },
          {
            symbol: "\\begin{pmatrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{pmatrix}",
            title: "Matriks Kurung Biasa 3×3 (pmatrix)",
            display: "(3×3)",
          },
          {
            symbol: "\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}",
            title: "Matriks Kurung Siku 2×2 (bmatrix)",
            display: "[2×2]",
          },
          {
            symbol: "\\begin{bmatrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{bmatrix}",
            title: "Matriks Kurung Siku 3×3 (bmatrix)",
            display: "[3×3]",
          },
          {
            symbol: "\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix}",
            title: "Determinan 2×2 (vmatrix)",
            display: "|2×2|",
          },
          {
            symbol: "\\begin{vmatrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{vmatrix}",
            title: "Determinan 3×3 (vmatrix)",
            display: "|3×3|",
          },
          {
            symbol: "\\begin{Bmatrix} a & b \\\\ c & d \\end{Bmatrix}",
            title: "Matriks Kurung Kurawal 2×2 (Bmatrix)",
            display: "{2×2}",
          },
          {
            symbol: "\\begin{matrix} a & b \\\\ c & d \\end{matrix}",
            title: "Matriks Polos Tanpa Kurung",
            display: "2×2",
          },
          {
            symbol: "\\begin{pmatrix} x \\\\ y \\end{pmatrix}",
            title: "Vektor / Matriks Kolom 2×1",
            display: "2×1",
          },
          {
            symbol: "\\begin{pmatrix} x \\\\ y \\\\ z \\end{pmatrix}",
            title: "Vektor / Matriks Kolom 3×1",
            display: "3×1",
          },
          {
            symbol: "\\begin{pmatrix} x & y & z \\end{pmatrix}",
            title: "Matriks Baris 1×3",
            display: "1×3",
          },
          {
            symbol: " & ",
            title: "Tambah Kolom (&)",
            display: "+Col",
          },
          {
            symbol: " \\\\ ",
            title: "Tambah Baris (\\\\)",
            display: "+Row",
          },
        ],
      }),
      [],
    );

    const renderToolbar = useCallback(
      (symbols: SymbolItem[]) => (
        <div className="math-toolbar-grid grid grid-cols-[repeat(auto-fill,minmax(36px,1fr))] gap-2 p-0.5">
          {symbols.map((item: SymbolItem, index: number) => (
            <button
              key={index}
              onClick={() => insertSymbol(item.symbol)}
              title={item.title}
              className="math-symbol-button aspect-square min-w-[36px] flex items-center justify-center text-sm font-medium text-slate-800 bg-white border border-slate-200 rounded-md hover:bg-slate-100 hover:border-slate-300 active:bg-slate-200 transition-colors cursor-pointer"
              type="button"
            >
              {item.display}
            </button>
          ))}
        </div>
      ),
      [insertSymbol],
    );

    return (
      <ModalPortal>
        <div
          className="math-dialog-overlay fixed inset-0 z-[2147483000] flex items-center justify-center p-2 sm:p-4 bg-slate-900/55 backdrop-blur-xs overflow-hidden"
          onClick={handleClose}
          role="presentation"
        >
          <div
            className="math-dialog relative flex flex-col w-full max-w-[700px] h-[92vh] sm:h-auto sm:max-h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200 font-sans text-slate-900"
            ref={dialogRef}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="math-dialog-title"
          >
            <div className="math-dialog-header flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200 shrink-0">
              <h3 id="math-dialog-title" className="text-base font-semibold text-slate-900 m-0">
                Insert Math Equation
              </h3>
              <div className="flex items-center gap-2">
                <button
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100 active:bg-slate-200 transition-colors cursor-pointer shadow-2xs"
                  onClick={() => {
                    try {
                      mathFieldRef.current?.executeCommand?.("toggleContextMenu");
                    } catch (_) {}
                  }}
                  type="button"
                  title="Buka menu opsi / matriks"
                  aria-label="Toggle menu"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="4" y1="6" x2="20" y2="6" />
                    <line x1="4" y1="12" x2="20" y2="12" />
                    <line x1="4" y1="18" x2="20" y2="18" />
                  </svg>
                  <span>Menu</span>
                </button>
                <button
                  className="close-button flex items-center justify-center w-7 h-7 text-xl leading-none text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-md transition-colors cursor-pointer"
                  onClick={handleClose}
                  type="button"
                  aria-label="Close dialog"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Area Konten Scrollable: Hanya bagian ini yang terkena scroll */}
            <div className="math-dialog-body flex-1 overflow-y-auto min-h-0 flex flex-col">
              <div className="math-editor p-3.5 border-b border-slate-200 shrink-0">
              <div className="flex items-center justify-between mb-1.5">
                <button
                  type="button"
                  onClick={() => textInputRef.current?.focus()}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium sm:hidden cursor-pointer"
                >
                  Ketik via Keyboard HP ↓
                </button>
              </div>
              {React.createElement("math-field", {
                ref: mathFieldRef,
                value: latex,
                onInput: handleInput,
                onClick: showVirtualKeyboard,
                onFocus: showVirtualKeyboard,
                "math-virtual-keyboard-policy": "auto",
                mathVirtualKeyboardPolicy: "auto",
                "virtual-keyboard-mode": "auto",
                className: "math-dialog-math-field block w-full min-h-[52px] p-2.5 text-base bg-white border-2 border-slate-200 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all cursor-text",
                "math-mode": "latex",
                "smart-mode": "on",
                "smart-fence": "on",
                "smart-superscript": "on",
                "smart-subscript": "on",
                "smart-operator": "on",
                "smart-fraction": "on",
                "smart-sqrt": "on",
                "smart-bracket": "on",
                "smart-paren": "on",
                "smart-quote": "on",
                "smart-space": "on",
                "smart-command": "on",
              })}
            </div>

            {/* Input Teks Langsung (100% Munculkan Keyboard Bawaan di HP) */}
            <div className="p-3 bg-blue-50/50 border-b border-slate-200 shrink-0">
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="hp-latex-input" className="text-xs font-semibold text-blue-800 flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-blue-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <line x1="6" y1="8" x2="6" y2="8" />
                    <line x1="10" y1="8" x2="10" y2="8" />
                    <line x1="14" y1="8" x2="14" y2="8" />
                    <line x1="18" y1="8" x2="18" y2="8" />
                    <line x1="6" y1="12" x2="6" y2="12" />
                    <line x1="10" y1="12" x2="10" y2="12" />
                    <line x1="14" y1="12" x2="14" y2="12" />
                    <line x1="18" y1="12" x2="18" y2="12" />
                    <line x1="7" y1="16" x2="17" y2="16" />
                  </svg>
                  <span>Input Teks Rumus (Keyboard HP)</span>
                </label>
                <span className="text-[11px] text-blue-600 font-medium">Ketuk untuk buka keyboard HP</span>
              </div>
              <input
                ref={textInputRef}
                id="hp-latex-input"
                type="text"
                value={latex}
                onChange={handleTextChange}
                placeholder="Ketuk di sini untuk mengetik dengan keyboard HP (contoh: x^2 + 5)"
                className="w-full px-3 py-2 text-sm font-mono text-slate-800 bg-white border border-blue-200 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all shadow-2xs"
                autoCapitalize="none"
                autoCorrect="off"
                autoComplete="off"
                spellCheck="false"
              />
            </div>

            <div className="math-toolbar-tabs sticky top-0 z-10 flex flex-wrap gap-1 px-3 py-2 bg-slate-50/95 backdrop-blur-xs border-b border-slate-200 shrink-0">
              {(Object.keys(toolbarSections) as Array<keyof TabSections>).map(
                (tab) => (
                  <button
                    key={tab}
                    className={`tab-button px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                      activeTab === tab
                        ? "active bg-blue-600 text-white hover:bg-blue-700"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/70"
                    }`}
                    onClick={() => setActiveTab(tab)}
                    type="button"
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ),
              )}
            </div>

            <div className="math-toolbar-container p-2.5 border-b border-slate-200 max-h-[140px] shrink-0">
              {renderToolbar(toolbarSections[activeTab])}
            </div>

            <div className="math-examples overflow-y-auto border-b border-slate-200 max-h-[140px] overflow-y-auto shrink-0">
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 m-0 mb-2">
                General
              </h4>
              <div className="equation-buttons flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() =>
                  insertSymbol("\\space")
                  }
                  className="px-2.5 py-1 text-xs text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                  type="button"
                >
                  Spasi
                </button>
                <button
                  onClick={toggleVirtualKeyboard}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors cursor-pointer"
                  type="button"
                  title="Tampilkan / Sembunyikan Keyboard di HP"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <line x1="6" y1="8" x2="6" y2="8" />
                    <line x1="10" y1="8" x2="10" y2="8" />
                    <line x1="14" y1="8" x2="14" y2="8" />
                    <line x1="18" y1="8" x2="18" y2="8" />
                    <line x1="6" y1="12" x2="6" y2="12" />
                    <line x1="10" y1="12" x2="10" y2="12" />
                    <line x1="14" y1="12" x2="14" y2="12" />
                    <line x1="18" y1="12" x2="18" y2="12" />
                    <line x1="7" y1="16" x2="17" y2="16" />
                  </svg>
                  Keyboard HP
                </button>
                <button
                  onClick={() => insertSymbol("x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}")}
                  className="px-2.5 py-1 text-xs text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                  type="button"
                >
                  Quadratic Formula
                </button>
                <button
                  onClick={() => insertSymbol("a^2 + b^2 = c^2")}
                  className="px-2.5 py-1 text-xs text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                  type="button"
                >
                  Pythagorean Theorem
                </button>
                <button
                  onClick={() => insertSymbol("A = \\pi r^2")}
                  className="px-2.5 py-1 text-xs text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                  type="button"
                >
                  Area of Circle
                </button>
                <button
                  onClick={() => insertSymbol("C = 2 \\pi r")}
                  className="px-2.5 py-1 text-xs text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                  type="button"
                >
                  Circumference
                </button>
              </div>
            </div>

            <div className="math-examples border-b border-slate-200 max-h-[140px] overflow-y-auto shrink-0">
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 m-0 mb-2">
              Higher Math
              </h4>
              <div className="equation-buttons flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => insertSymbol("\\frac{dy}{dx}")}
                  className="px-2.5 py-1 text-xs text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                  type="button"
                >
                  Derivative
                </button>
                <button
                  onClick={() => insertSymbol("e^{i\\pi} + 1 = 0")}
                  className="px-2.5 py-1 text-xs text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                  type="button"
                >
                  Euler's Identity
                </button>
                <button
                  onClick={() =>
                  insertSymbol(
                    "f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}",
                  )
                  }
                  className="px-2.5 py-1 text-xs text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                  type="button"
                >
                  Limit Definition of Derivative
                </button>
                <button
                  onClick={() =>
                  insertSymbol(
                    "\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}",
                  )
                  }
                  className="px-2.5 py-1 text-xs text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                  type="button"
                >
                  Gaussian Integral
                </button>
              </div>
            </div>

            <div className="math-examples border-b border-slate-200 max-h-[140px] overflow-y-auto shrink-0">
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 m-0 mb-2">
              Physics
              </h4>
              <div className="equation-buttons flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => insertSymbol("F = ma")}
                  className="px-2.5 py-1 text-xs text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                  type="button"
                >
                  Newton's 2nd Law
                </button>
                <button
                  onClick={() => insertSymbol("E = mc^2")}
                  className="px-2.5 py-1 text-xs text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                  type="button"
                >
                  E=mc²
                </button>
                <button
                  onClick={() => insertSymbol("KE = \\frac{1}{2} mv^2")}
                  className="px-2.5 py-1 text-xs text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                  type="button"
                >
                  Kinetic Energy
                </button>
                <button
                  onClick={() => insertSymbol("V = IR")}
                  className="px-2.5 py-1 text-xs text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                  type="button"
                >
                  Ohm's Law
                </button>
                <button
                  onClick={() =>
                  insertSymbol("\\Delta x \\Delta p \\geq \\frac{\\hbar}{2}")
                  }
                  className="px-2.5 py-1 text-xs text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                  type="button"
                >
                  Uncertainty Principle
                </button>
                <button
                  onClick={() =>
                  insertSymbol(
                    "\\nabla \\cdot \\vec{E} = \\frac{\\rho}{\\epsilon_0}",
                  )
                  }
                  className="px-2.5 py-1 text-xs text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                  type="button"
                >
                  Gauss's Law
                </button>
              </div>
            </div>

            <div className="math-examples border-b border-slate-200 max-h-[140px] overflow-y-auto shrink-0">
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 m-0 mb-2">
              Chemistry
              </h4>
              <div className="equation-buttons flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => insertSymbol("H_2O")}
                  className="px-2.5 py-1 text-xs text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                  type="button"
                >
                  Water Formula
                </button>
                <button
                  onClick={() => insertSymbol("n = \\frac{m}{M}")}
                  className="px-2.5 py-1 text-xs text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                  type="button"
                >
                  Molar Mass
                </button>
                <button
                  onClick={() => insertSymbol("PV = nRT")}
                  className="px-2.5 py-1 text-xs text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                  type="button"
                >
                  Ideal Gas Law
                </button>
                <button
                  onClick={() => insertSymbol("2H_2 + O_2 \\to 2H_2O")}
                  className="px-2.5 py-1 text-xs text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                  type="button"
                >
                  Chemical Reaction
                </button>
                <button
                  onClick={() => insertSymbol("K_a = \\frac{[H^+][A^-]}{[HA]}")}
                  className="px-2.5 py-1 text-xs text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                  type="button"
                >
                  Acid Constant
                </button>
              </div>
            </div>

            <div className="math-examples border-b border-slate-200 max-h-[140px] overflow-y-auto shrink-0">
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 m-0 mb-2">
              Geometry
              </h4>
              <div className="equation-buttons flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => insertSymbol("\\angle ABC = 90^\\circ")}
                  className="px-2.5 py-1 text-xs text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                  type="button"
                >
                  Right Angle
                </button>
                <button
                  onClick={() => insertSymbol("\\angle ABC = 180^\\circ")}
                  className="px-2.5 py-1 text-xs text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                  type="button"
                >
                  Straight Angle
                </button>
                <button
                  onClick={() => insertSymbol("A = \\frac{1}{2}bh")}
                  className="px-2.5 py-1 text-xs text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                  type="button"
                >
                  Triangle Area
                </button>
                <button
                  onClick={() => insertSymbol("A = s^2")}
                  className="px-2.5 py-1 text-xs text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                  type="button"
                >
                  Square Area
                </button>
                <button
                  onClick={() => insertSymbol("A = lw")}
                  className="px-2.5 py-1 text-xs text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                  type="button"
                >
                  Rectangle Area
                </button>
                <button
                  onClick={() => insertSymbol("V = \\frac{4}{3}\\pi r^3")}
                  className="px-2.5 py-1 text-xs text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                  type="button"
                >
                  Sphere Volume
                </button>
                <button
                  onClick={() =>
                  insertSymbol("\\triangle ABC \\cong \\triangle DEF")
                  }
                  className="px-2.5 py-1 text-xs text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                  type="button"
                >
                  Congruent Triangles
                </button>
                <button
                  onClick={() => insertSymbol("AB \\parallel CD")}
                  className="px-2.5 py-1 text-xs text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                  type="button"
                >
                  Parallel Lines
                </button>
                <button
                  onClick={() => insertSymbol("AB \\perp CD")}
                  className="px-2.5 py-1 text-xs text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                  type="button"
                >
                  Perpendicular Lines
                </button>
              </div>
            </div>

              <div className="math-display-mode-toggle flex items-center justify-between gap-3 px-4 py-2.5 text-xs text-slate-600 shrink-0">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={displayMode}
                    onChange={(e) => setDisplayMode(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  Display as centered block (still allows text before/after)
                </label>
                <span className="math-dialog-hint text-[11px] text-slate-400">Tip: Ctrl/Cmd + Enter to insert</span>
              </div>

              {/* Footer: Tetap Fixed di Bawah Dialog */}
              <div className="math-dialog-footer fixed sticky bottom-0 z-10 flex items-center justify-end gap-2 px-4 py-3 bg-slate-50 border-t border-slate-200 rounded-b-xl shrink-0 shadow-xs">
                  <button className="cancel-button px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 active:bg-slate-100 transition-colors cursor-pointer" onClick={handleClose} type="button">
                    Cancel
                  </button>
                  <button                   
                    className="save-button px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-xs"
                    onClick={handleSave}
                    type="button"
                    disabled={isInserting || !latex.trim()}
                    aria-busy={isInserting}
                  >
                    {isInserting ? "Inserting..." : "Insert Equation"}
                  </button>
              </div>
            </div>
          </div>
        </div>
      </ModalPortal>
    );
  },
);

MathEquationDialog.displayName = "MathEquationDialog";

export default MathEquationDialog;
