import { useEffect, useRef, useState } from "react";

export default function ModelDropdown({ models, value, onChange, disabled }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const optionRefs = useRef([]);

  const selectedModel =
    models.includes(value) ? value : models[0] || value || "gpt-5";
  const isOpen = open && !disabled;

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const focusOption = (index) => {
    const nextIndex = (index + models.length) % models.length;
    optionRefs.current[nextIndex]?.focus();
  };

  const handleKeyDown = (event) => {
    if (disabled || !models.length) return;

    const selectedIndex = Math.max(models.indexOf(selectedModel), 0);
    const activeIndex = optionRefs.current.indexOf(document.activeElement);

    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!isOpen) {
        setOpen(true);
        requestAnimationFrame(() => focusOption(selectedIndex));
        return;
      }
      focusOption(activeIndex === -1 ? selectedIndex : activeIndex + 1);
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!isOpen) {
        setOpen(true);
        requestAnimationFrame(() => focusOption(selectedIndex));
        return;
      }
      focusOption(activeIndex === -1 ? selectedIndex : activeIndex - 1);
    }
  };

  const selectModel = (model) => {
    onChange(model);
    setOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <div
      className={`model-dropdown ${isOpen ? "open" : ""} ${
        disabled ? "disabled" : ""
      }`}
      ref={rootRef}
      onKeyDown={handleKeyDown}
    >
      <button
        className="model-dropdown-trigger"
        type="button"
        ref={triggerRef}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="model-dropdown-value">
          {disabled ? "Loading..." : selectedModel}
        </span>
        <span className="model-dropdown-chevron" aria-hidden="true" />
      </button>

      <div className="model-dropdown-menu" role="listbox" aria-label="Models">
        {models.map((model, index) => (
          <button
            className={`model-dropdown-option ${
              model === selectedModel ? "selected" : ""
            }`}
            key={model}
            type="button"
            role="option"
            aria-selected={model === selectedModel}
            tabIndex={isOpen ? 0 : -1}
            ref={(node) => {
              optionRefs.current[index] = node;
            }}
            onClick={() => selectModel(model)}
          >
            <span>{model}</span>
            <span className="model-dropdown-check" aria-hidden="true" />
          </button>
        ))}
      </div>
    </div>
  );
}
