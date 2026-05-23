import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import type {
  Transaction,
  TransactionCategory,
  TransactionType,
} from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cancelTransaction } from "@/api/transaction";
import { getColumns } from "./columns";

const categoryOptions: { value: TransactionCategory; label: string }[] = [
  { value: "food", label: "Food" },
  { value: "transport", label: "Transport" },
  { value: "shopping", label: "Shopping" },
  { value: "housing", label: "Housing" },
  { value: "salary", label: "Salary" },
  { value: "health", label: "Health" },
  { value: "entertainment", label: "Entertainment" },
  { value: "utilities", label: "Utilities" },
  { value: "other", label: "Other" },
];

const typeOptions: { value: TransactionType; label: string }[] = [
  { value: "deposit", label: "Deposit" },
  { value: "withdrawal", label: "Withdrawal" },
  { value: "transfer", label: "Transfer" },
  { value: "payment", label: "Payment" },
];

export default function TransactionsTable({
  transactions,
  accountId,
}: {
  transactions: Transaction[];
  accountId: string;
}) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const queryClient = useQueryClient();

  const cancelMutation = useMutation({
    mutationFn: cancelTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions", accountId] });
    },
  });

  const handleCancel = (tx: Transaction) => {
    cancelMutation.mutate(tx.id);
  };

  const columns = getColumns(accountId, handleCancel);

  const table = useReactTable({
    data: transactions,
    columns,
    state: { sorting, columnFilters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const activeCategory = columnFilters.find((f) => f.id === "category")
    ?.value as string | undefined;
  const activeType = columnFilters.find((f) => f.id === "type")?.value as
    | string
    | undefined;
  const hasFilters = columnFilters.length > 0;

  function setFilter(id: string, value: string) {
    setColumnFilters((prev) =>
      value
        ? [...prev.filter((f) => f.id !== id), { id, value }]
        : prev.filter((f) => f.id !== id),
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <select
          value={activeType ?? ""}
          onChange={(e) => setFilter("type", e.target.value)}
          className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-colors"
        >
          <option value="">All types</option>
          {typeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          value={activeCategory ?? ""}
          onChange={(e) => setFilter("category", e.target.value)}
          className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-colors"
        >
          <option value="">All categories</option>
          {categoryOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {hasFilters && (
          <button
            onClick={() => setColumnFilters([])}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-gray-800 hover:bg-stone-100 transition-colors"
          >
            <X size={13} />
            Clear filters
          </button>
        )}

        {hasFilters && (
          <span className="text-xs text-gray-400">
            {table.getRowModel().rows.length} of {transactions.length}{" "}
            transactions
          </span>
        )}
      </div>

      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="border-stone-100">
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="cursor-pointer select-none text-xs text-gray-400 uppercase tracking-wide font-medium py-3 hover:text-gray-700 transition-colors"
                  onClick={header.column.getToggleSortingHandler()}
                >
                  <span className="flex items-center gap-1">
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                    <span className="text-gray-300">
                      {{ asc: "↑", desc: "↓" }[
                        header.column.getIsSorted() as string
                      ] ?? ""}
                    </span>
                  </span>
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className="border-stone-100 hover:bg-stone-50"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className="py-3.5 text-sm text-gray-700"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="py-12 text-center text-sm text-gray-400"
              >
                No transactions match the current filters
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
