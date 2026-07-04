"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { US_STATES, type UsState } from "@/lib/us-states";

interface Props {
  /** Currently selected state abbreviation, e.g. "CA". Empty string = no selection. */
  value: string;
  /** Called when the user picks a state (abbr) or clears the field (""). */
  onChange: (abbr: string) => void;
  /** Which slugs have a "detailed" guide. Others render as "general info only". */
  detailedSlugs?: ReadonlyArray<string>;
  /** Placeholder when empty. */
  placeholder?: string;
  /** id attribute for the input (paired with a <label htmlFor>). */
  id?: string;
}

/**
 * StateCombobox — typeable dropdown that filters US states as you type.
 * Type by name ("Texas"), abbreviation ("TX"), or partial ("ten" matches Tennessee).
 * Keyboard: up/down to navigate, enter to select, escape to clear.
 */
export function StateCombobox({
  value,
  onChange,
  detailedSlugs,
  placeholder = "Type your state or use the dropdown",
  id,
}: Props) {
  const selected = useMemo(
    () => US_STATES.find((s) => s.abbr === value) ?? null,
    [value],
  );
  const [query, setQuery] = useState<string>(selected?.name ?? "");
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listboxId = useId();
  const optionId = (i: number) => `${listboxId}-option-${i}`;

  // Keep the typed query in sync with the `value` prop when it changes
  // externally (not from the user typing). Adjusted during render rather
  // than in an effect, per https://react.dev/learn/you-might-not-need-an-effect.
  const prevSelectedRef = useRef(selected);
  if (prevSelectedRef.current !== selected) {
    prevSelectedRef.current = selected;
    setQuery(selected?.name ?? "");
  }

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery(selected?.name ?? "");
      }
    }
    window.addEventListener("mousedown", onClickOutside);
    return () => window.removeEventListener("mousedown", onClickOutside);
  }, [selected]);

  const filtered = useMemo<UsState[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return US_STATES;
    return US_STATES.filter(
      (s) =>
        s.name.toLowerCase().startsWith(q) ||
        s.abbr.toLowerCase() === q ||
        s.name.toLowerCase().includes(q),
    );
  }, [query]);

  function pick(state: UsState) {
    onChange(state.abbr);
    setQuery(state.name);
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setHighlight((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const choice = filtered[highlight];
      if (choice) pick(choice);
    } else if (e.key === "Escape") {
      setOpen(false);
      if (selected) setQuery(selected.name);
      else {
        setQuery("");
        onChange("");
      }
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setHighlight(0);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-activedescendant={
            open && filtered.length ? optionId(highlight) : undefined
          }
          className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 pr-10 text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
        />
        <button
          type="button"
          onClick={() => {
            setOpen((v) => !v);
            inputRef.current?.focus();
          }}
          aria-label={open ? "Close state list" : "Open state list"}
          className="absolute inset-y-0 right-0 px-3 flex items-center text-ink-muted hover:text-ink-soft"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden
          >
            <path
              d="M2 4l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {open && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-20 left-0 right-0 mt-1 max-h-72 overflow-auto rounded-xl border border-border bg-surface shadow-lg"
        >
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-sm text-ink-muted">
              No states match &ldquo;{query}&rdquo;.
            </li>
          ) : (
            filtered.map((s, i) => {
              const isHighlight = i === highlight;
              const isDetailed = detailedSlugs?.includes(s.slug) ?? false;
              return (
                <li
                  key={s.abbr}
                  id={optionId(i)}
                  role="option"
                  aria-selected={selected?.abbr === s.abbr}
                  onMouseEnter={() => setHighlight(i)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    pick(s);
                  }}
                  className={`px-3 py-2 flex items-center justify-between gap-3 cursor-pointer ${
                    isHighlight ? "bg-primary-soft" : ""
                  }`}
                >
                  <span className="text-ink">
                    {s.name}
                    <span className="text-ink-muted ml-2 text-sm">
                      {s.abbr}
                    </span>
                  </span>
                  {detailedSlugs &&
                    (isDetailed ? (
                      <span className="text-[10px] uppercase tracking-wider text-good bg-good-soft px-2 py-0.5 rounded-full">
                        Detailed guide
                      </span>
                    ) : (
                      <span className="text-[10px] uppercase tracking-wider text-ink-muted">
                        General info
                      </span>
                    ))}
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}
