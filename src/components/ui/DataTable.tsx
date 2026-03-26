import { useState, useMemo } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { downloadCSV } from "@/lib/utils";
import type { SortConfig } from "@/types";

export interface ColumnDef<T> {
  key: string;
  header: string;
  accessor: (row: T) => string | number | null | undefined;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  pinned?: boolean;
  className?: string;
}

interface DataTableProps<T extends Record<string, unknown>> {
  data: T[];
  columns: ColumnDef<T>[];
  pageSize?: number;
  searchValue?: string;
  searchFields?: (keyof T)[];
  exportFilename?: string;
  rowActions?: (row: T) => React.ReactNode;
  emptyMessage?: string;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50];

export default function DataTable<T extends Record<string, unknown>>({
  data, columns, pageSize: defaultPageSize = 10,
  searchValue = "", searchFields = [],
  exportFilename, rowActions, emptyMessage = "No data found.",
}: DataTableProps<T>) {
  const [sort, setSort] = useState<SortConfig>({ key: "", direction: "asc" });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const filtered = useMemo(() => {
    if (!searchValue.trim() || searchFields.length === 0) return data;
    const q = searchValue.toLowerCase();
    return data.filter((row) =>
      searchFields.some((field) => String(row[field] ?? "").toLowerCase().includes(q))
    );
  }, [data, searchValue, searchFields]);

  const sorted = useMemo(() => {
    if (!sort.key) return filtered;
    const col = columns.find((c) => c.key === sort.key);
    if (!col) return filtered;
    return [...filtered].sort((a, b) => {
      const av = col.accessor(a) ?? ""; const bv = col.accessor(b) ?? "";
      const cmp = typeof av === "number" && typeof bv === "number"
        ? av - bv : String(av).localeCompare(String(bv));
      return sort.direction === "asc" ? cmp : -cmp;
    });
  }, [filtered, sort, columns]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paged = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);

  function handleSort(key: string) {
    setSort((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" }
    );
    setPage(1);
  }

  function handleExport() {
    if (!exportFilename) return;
    const rows = sorted.map((row) => {
      const obj: Record<string, unknown> = {};
      columns.forEach((col) => { obj[col.header] = col.accessor(row) ?? ""; });
      return obj;
    });
    downloadCSV(rows, exportFilename);
  }

  // Pinned cell background
  const pinnedBg = "bg-white dark:bg-navy-950";

  return (
    <div className="card overflow-hidden flex flex-col">
      {/* Controls */}
      <div className={cn(
        "flex items-center justify-between px-4 py-3 gap-3 flex-wrap",
        "border-b border-slate-200 dark:border-white/10"
      )}>
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {filtered.length.toLocaleString()} record{filtered.length !== 1 ? "s" : ""}
          {searchValue && ` matching "${searchValue}"`}
        </span>
        <div className="flex items-center gap-3 ml-auto">
          <label className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            Rows:
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
              className="select py-1 text-sm"
              aria-label="Rows per page"
            >
              {PAGE_SIZE_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>
          {exportFilename && (
            <button onClick={handleExport} className="btn-ghost py-1.5 text-xs" aria-label={`Export ${exportFilename} as CSV`}>
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              Export CSV
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full" role="table">
          <thead>
            <tr className="border-b border-slate-200 dark:border-white/10">
              {columns.map((col) => (
                <th
                  key={col.key} scope="col"
                  className={cn("th", col.pinned && `sticky left-0 z-10 ${pinnedBg}`, col.className)}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                  aria-sort={sort.key === col.key ? (sort.direction === "asc" ? "ascending" : "descending") : undefined}
                >
                  <span className="inline-flex items-center gap-1.5">
                    {col.header}
                    {col.sortable !== false && (
                      <span className="text-slate-300 dark:text-slate-600" aria-hidden="true">
                        {sort.key === col.key
                          ? sort.direction === "asc"
                            ? <ChevronUp className="h-3 w-3" />
                            : <ChevronDown className="h-3 w-3" />
                          : <ChevronsUpDown className="h-3 w-3 opacity-40" />}
                      </span>
                    )}
                  </span>
                </th>
              ))}
              {rowActions && <th scope="col" className="th text-right">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (rowActions ? 1 : 0)} className="td text-center text-slate-400 dark:text-slate-500 py-12">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paged.map((row, idx) => (
                <tr key={idx} className="tr">
                  {columns.map((col) => (
                    <td key={col.key} className={cn("td", col.pinned && `sticky left-0 z-10 ${pinnedBg}`, col.className)}>
                      {col.render ? col.render(row) : (col.accessor(row) ?? "—")}
                    </td>
                  ))}
                  {rowActions && <td className="td text-right">{rowActions(row)}</td>}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className={cn(
        "flex items-center justify-between px-4 py-3 gap-3 flex-wrap",
        "border-t border-slate-200 dark:border-white/10"
      )} role="navigation" aria-label="Table pagination">
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Page {safePage} of {totalPages} · {sorted.length} total
        </p>
        <div className="flex items-center gap-1">
          {[
            { label: "«", action: () => setPage(1), disabled: safePage === 1 },
          ].map(({ label, action, disabled }) => (
            <button key={label} onClick={action} disabled={disabled} className="btn-ghost py-1.5 px-2 text-xs disabled:opacity-30" aria-label={label === "«" ? "First page" : "Last page"}>{label}</button>
          ))}
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage === 1} className="btn-ghost py-1.5 px-2 text-xs disabled:opacity-30" aria-label="Previous page">
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const start = Math.max(1, Math.min(safePage - 2, totalPages - 4));
            const p = start + i;
            return (
              <button key={p} onClick={() => setPage(p)}
                className={cn(
                  "py-1.5 px-3 text-xs rounded-lg transition-colors",
                  p === safePage
                    ? "bg-brand text-white"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
                )}
                aria-label={`Page ${p}`} aria-current={p === safePage ? "page" : undefined}
              >
                {p}
              </button>
            );
          })}

          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} className="btn-ghost py-1.5 px-2 text-xs disabled:opacity-30" aria-label="Next page">
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
          <button onClick={() => setPage(totalPages)} disabled={safePage === totalPages} className="btn-ghost py-1.5 px-2 text-xs disabled:opacity-30" aria-label="Last page">»</button>
        </div>
      </div>
    </div>
  );
}
