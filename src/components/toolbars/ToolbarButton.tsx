import { memo, forwardRef, ReactNode, MouseEventHandler } from "react";

interface ToolbarButtonProps {
  onClick?: MouseEventHandler<HTMLButtonElement>;
  isActive?: boolean;
  title: string;
  children: ReactNode;
  shortcut?: string;
  disabled?: boolean;
}

const ToolbarButton = memo(
  forwardRef<HTMLButtonElement, ToolbarButtonProps>(
    ({ onClick, isActive, title, children, shortcut, disabled }, ref) => {
      const label = shortcut ? `${title} (${shortcut})` : title;

      const baseClasses =
        "inline-flex items-center justify-center w-8 h-8 min-w-[2rem] p-0 m-0 border rounded-[5px] transition-colors duration-150 shrink-0 relative cursor-pointer focus-visible:outline-2 focus-visible:outline-teal-700 focus-visible:outline-offset-1 disabled:opacity-35 disabled:cursor-not-allowed disabled:pointer-events-none [&>svg]:w-4 [&>svg]:h-4 [&>svg]:block [&>svg]:pointer-events-none";

      const stateClasses = isActive
        ? "bg-teal-100/80 text-teal-800 border-teal-300 shadow-xs"
        : "text-zinc-700 hover:text-zinc-900 bg-transparent border-transparent hover:bg-zinc-200/70 hover:border-zinc-300";

      return (
        <button
          ref={ref}
          onClick={onClick}
          className={`toolbar-button ${baseClasses} ${stateClasses} ${
            isActive ? "is-active" : ""
          } ${disabled ? "is-disabled" : ""}`}
          aria-label={label}
          aria-pressed={isActive}
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
