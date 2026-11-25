"use client";

import * as React from "react";
import { RotateCcw, Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";

export interface FilterSelectConfig {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

export function CatalogueFilter({
  query,
  onQueryChange,
  searchPlaceholder = "Search catalogue…",
  searchLabel = "Search catalogue",
  selects = [],
  resultCount,
  totalCount,
  itemLabel = "records",
  hasActiveFilters,
  onReset,
  actions,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  searchPlaceholder?: string;
  searchLabel?: string;
  selects?: FilterSelectConfig[];
  resultCount: number;
  totalCount: number;
  itemLabel?: string;
  hasActiveFilters: boolean;
  onReset: () => void;
  actions?: React.ReactNode;
}) {
  return (
    <div className="space-y-3 rounded-lg border bg-surface p-3.5 sm:p-4">
      <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchLabel}
            className="pl-9 pr-8"
          />
          {query && (
            <button
              type="button"
              onClick={() => onQueryChange("")}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {selects.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <SlidersHorizontal className="hidden size-4 text-muted-foreground sm:block" aria-hidden />
            {selects.map((sel) => (
              <Select
                key={sel.id}
                value={sel.value}
                onChange={(e) => sel.onChange(e.target.value)}
                aria-label={sel.label}
                className="w-full sm:w-auto sm:min-w-[165px]"
              >
                {sel.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <div className="flex flex-wrap items-center gap-2">
          <span className="tabular-nums">
            Showing <strong className="text-foreground">{resultCount}</strong> of{" "}
            <strong className="text-foreground">{totalCount}</strong> {itemLabel}
          </span>
          {hasActiveFilters && (
            <Button type="button" variant="ghost" size="sm" onClick={onReset} className="h-7 px-2 text-xs">
              <RotateCcw className="size-3" />
              Reset filters
            </Button>
          )}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
