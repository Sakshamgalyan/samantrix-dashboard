"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { EmptyState, Input, ListItem, Modal, Typography } from "@galyan/ui";
import { CornerDownLeft, Search, SearchX } from "lucide-react";

export interface SearchItem {
  id: string;
  label: string;
  description?: string;
  /** Heading the item is listed under (e.g. "Pages", "Actions"). */
  group: string;
  icon?: React.ReactNode;
  /** Extra words that should match this item. */
  keywords?: string[];
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: SearchItem[];
  onSelect: (item: SearchItem) => void;
  placeholder?: string;
}

function matches(item: SearchItem, query: string): boolean {
  const haystack = [
    item.label,
    item.description,
    item.group,
    ...(item.keywords ?? []),
  ]
    .join(" ")
    .toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => haystack.includes(term));
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded-md border border-[var(--gy-border)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--gy-text-subtle)]">
      {children}
    </kbd>
  );
}

/**
 * Command-palette search on Galyan's glass Modal: type to filter,
 * ↑/↓ to move, Enter to open, Esc to close.
 */
export function SearchModal({
  isOpen,
  onClose,
  items,
  onSelect,
  placeholder = "Search pages and actions…",
}: SearchModalProps) {
  const listId = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const results = useMemo(
    () => items.filter((item) => matches(item, query)),
    [items, query],
  );

  // Grouped for display, while keyboard navigation walks the flat `results` order
  const groups = useMemo(() => {
    const map = new Map<string, { item: SearchItem; index: number }[]>();
    results.forEach((item, index) => {
      const entries = map.get(item.group) ?? [];
      entries.push({ item, index });
      map.set(item.group, entries);
    });
    return [...map.entries()];
  }, [results]);

  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const close = () => {
    setQuery("");
    setActiveIndex(0);
    onClose();
  };

  const choose = (item: SearchItem | undefined) => {
    if (!item) return;
    close();
    onSelect(item);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (results.length ? (i + 1) % results.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) =>
        results.length ? (i - 1 + results.length) % results.length : 0,
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      choose(results[activeIndex]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    }
  };

  const activeId = results[activeIndex]
    ? `${listId}-${results[activeIndex].id}`
    : undefined;

  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      variant="glass"
      position="top"
      size="lg"
      showCloseButton={false}
      customHeader={
        <div className="w-full p-3">
          <Input
            autoFocus
            fullWidth
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            leftIcon={<Search className="size-4" />}
            rightIcon={<Kbd>Esc</Kbd>}
            onRightIconClick={close}
            role="combobox"
            aria-label="Search"
            aria-expanded="true"
            aria-controls={listId}
            aria-activedescendant={activeId}
            aria-autocomplete="list"
          />
        </div>
      }
      footer={
        <div className="flex items-center gap-4 text-[11px] text-[var(--gy-text-subtle)]">
          <span className="flex items-center gap-1">
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd> to navigate
          </span>
          <span className="flex items-center gap-1">
            <Kbd>Enter</Kbd> to open
          </span>
        </div>
      }
    >
      <div
        ref={listRef}
        id={listId}
        role="listbox"
        aria-label="Results"
        className="max-h-[52vh] overflow-y-auto"
      >
        {results.length === 0 ? (
          <EmptyState
            size="sm"
            variant="subtle"
            icon={<SearchX className="size-5" />}
            title={`No results for “${query}”`}
            description="Try a page name like “users” or an action like “sign out”."
          />
        ) : (
          groups.map(([group, entries]) => (
            <div key={group} role="group" aria-label={group} className="pb-2">
              <Typography
                variant="span"
                className="block px-2 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--gy-text-subtle)]"
              >
                {group}
              </Typography>
              <div className="space-y-0.5">
                {entries.map(({ item, index }) => (
                  <ListItem
                    key={item.id}
                    id={`${listId}-${item.id}`}
                    data-index={index}
                    role="option"
                    aria-selected={index === activeIndex}
                    value={item.id}
                    label={item.label}
                    description={item.description}
                    icon={item.icon}
                    selected={index === activeIndex}
                    selectedVariant="pill"
                    size="md"
                    suffix={
                      index === activeIndex ? (
                        <CornerDownLeft className="size-3.5 text-[var(--gy-text-subtle)]" />
                      ) : undefined
                    }
                    onMouseMove={() => setActiveIndex(index)}
                    onClick={() => choose(item)}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </Modal>
  );
}
