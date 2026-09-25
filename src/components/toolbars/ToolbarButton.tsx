import { memo, forwardRef, ReactNode, MouseEventHandler } from "react";

interface ToolbarButtonProps {
  onClick?: MouseEventHandler<HTMLButtonElement>;
  isActive?: boolean;
  title: string;
  children: ReactNode;
  shortcut?: string;
  disabled?: boolean;
  className?: string;
  "aria-expanded"?: boolean;
  "aria-haspopup"?: boolean | "dialog" | "menu" | "listbox" | "tree" | "grid";
}

const ToolbarButton = memo(
  forwardRef<HTMLButtonElement, ToolbarButtonProps>(
    (
      {
        onClick,
        isActive,
        title,
        children,
        shortcut,
        disabled,
        className = "",
        "aria-expanded": ariaExpanded,
        "aria-haspopup": ariaHasPopup,
      },
      ref,
    ) => {
      const label = shortcut ? `${title} (${shortcut})` : title;

      const baseClasses =
        "inline-flex items-center justify-center w-8 h-8 min-w-[2rem] p-0 m-0 rounded-md transition-colors duration-150 shrink-0 relative cursor-pointer focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-1 disabled:opacity-30 disabled:cursor-not-allowed disabled:pointer-events-none [&>svg]:w-4 [&>svg]:h-4 [&>svg]:block [&>svg]:pointer-events-none";

      const stateClasses = isActive
        ? "bg-blue-100 text-blue-700 font-medium shadow-2xs"
        : "text-slate-600 hover:text-slate-900 bg-transparent hover:bg-slate-100 active:bg-slate-200";

      return (
        <button
          ref={ref}
          onClick={onClick}
          className={`toolbar-button ${baseClasses} ${stateClasses} ${
            isActive ? "is-active" : ""
          } ${disabled ? "is-disabled" : ""} ${className}`.trim()}
          aria-label={label}
          aria-pressed={isActive}
          aria-expanded={ariaExpanded}
          aria-haspopup={ariaHasPopup}
          disabled={disabled}
          type="button"
          title={label}
        >
          {children}
        </button>
      );
    },
  ),
);

ToolbarButton.displayName = "ToolbarButton";

export default ToolbarButton;
