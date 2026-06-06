import React from "react";
import { Input } from "@/components/ui/input.tsx";

export interface AutocompleteOption {
  label: string;
  value: string;
}

interface AutocompleteProps {
  options: AutocompleteOption[];
  placeholder?: string;
  onSelect: (value: string | null) => void;
  error?: string;
  // Controlled clearing hook triggered via parent form reset bindings
  resetToggle?: boolean;
}

export default function Autocomplete({
  options,
  placeholder = "Search...",
  onSelect,
  error,
  resetToggle,
}: AutocompleteProps) {
  const [query, setQuery] = React.useState("");
  const [isOpen, setIsOpen] = React.useState(false);
  const [_selectedValue, setSelectedValue] = React.useState("");
  const [focusedIndex, setFocusedIndex] = React.useState(-1);

  const containerRef = React.useRef<HTMLDivElement>(null);

  // Filter options based on user text query
  const filteredOptions = React.useMemo(() => {
    if (!query) return options;
    return options.filter((option) =>
      option.label.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, options]);

  // RESET HANDLER: Clears everything when the parent form completes successfully
  React.useEffect(() => {
    setQuery("");
    setSelectedValue("");
    setFocusedIndex(-1);
  }, [resetToggle]);

  // Reset keyboard focus index whenever the user searches or opens/closes dropdown
  React.useEffect(() => {
    setFocusedIndex(-1);
  }, [query, isOpen]);

  // 1. CLICK OUTSIDE TO CLOSE
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectOption = (option: AutocompleteOption) => {
    setQuery(option.label);
    setSelectedValue(option.value);
    onSelect(option.value);
    setIsOpen(false);
  };

  // 2. ARROW KEY KEYBOARD NAVIGATION
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setFocusedIndex((
          prev,
        ) => (prev < filteredOptions.length - 1 ? prev + 1 : prev));
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (event.key === "Enter") {
        event.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < filteredOptions.length) {
          handleSelectOption(filteredOptions[focusedIndex]);
        }
      } else if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, focusedIndex, filteredOptions]);

  const handleClear = () => {
    setQuery("");
    setSelectedValue("");
    onSelect(null);
  };

  return (
    <div ref={containerRef} className="relative w-full flex flex-col gap-1">
      <div className="relative">
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedValue("");
            onSelect(null);
            setIsOpen(true);
          }}
          onFocus={() =>
            setIsOpen(true)}
          placeholder={placeholder}
          className="shadow-none pr-8 text-sm h-10"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs opacity-40 hover:opacity-100 cursor-pointer"
          >
            ✕
          </button>
        )}
      </div>

      {isOpen && (
        <ul className="absolute bg-main text-main-foreground top-full left-0 z-50 w-full mt-1 max-h-60 overflow-y-auto bg-popover text-popover-foreground border border-border rounded-base shadow-md p-1">
          {filteredOptions.length === 0
            ? (
              <li className="px-2 py-1.5 text-sm opacity-50 select-none">
                No matching accounts found.
              </li>
            )
            : (
              filteredOptions.map((option, index) => (
                <li
                  key={option.value}
                  onClick={() => handleSelectOption(option)}
                  className={`w-full cursor-pointer select-none rounded-sm px-2 py-1.5 text-sm outline-none transition-colors ${
                    focusedIndex === index
                      ? "bg-secondary-background text-main font-medium"
                      : "hover:bg-accent/50"
                  }`}
                >
                  {option.label}
                </li>
              ))
            )}
        </ul>
      )}

      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
