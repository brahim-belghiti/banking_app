import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import type { Transaction, TransactionCategory, TransactionType } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { X } from "lucide-react";

function formatAmount(centimes: number): string {
  return (centimes / 100).toLocaleString("fr-MA", {
    style: "currency",
    currency: "MAD",
  });
}

const categoryLabels: Record<string, string> = {
  food: "Alimentation",
  transport: "Transport",
  shopping: "Achats",
  housing: "Logement",
  salary: "Salaire",
  health: "Santé",
  entertainment: "Loisirs",
  utilities: "Factures",
  savings: "Épargne",
  other: "Autre",
};

const typeLabels: Record<string, string> = {
  deposit: "Dépôt",
  withdrawal: "Retrait",
  transfer: "Virement",
  payment: "Paiement",
};

const statusLabels: Record<string, string> = {
  pending: "En attente",
  completed: "Complété",
  failed: "Échoué",
  cancelled: "Annulé",
};

const statusStyle: Record<string, string> = {
  pending: "text-amber-700 bg-amber-50 border-amber-200",
  completed: "text-emerald-700 bg-emerald-50 border-emerald-200",
  failed: "text-red-600 bg-red-50 border-red-200",
  cancelled: "text-gray-600 bg-gray-50 border-gray-200",
};

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

function getColumns(accountId: string): ColumnDef<Transaction>[] {
  return [
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ getValue }) =>
        new Date(getValue<string>()).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
    },
    {
      accessorKey: "label",
      header: "Description",
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ getValue }) => typeLabels[getValue<string>()],
      filterFn: "equals",
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ getValue }) =>
        categoryLabels[getValue<string>()] || getValue<string>(),
      filterFn: "equals",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ getValue }) => {
        const status = getValue<string>();
        return (
          <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full border ${statusStyle[status]}`}>
            {statusLabels[status]}
          </span>
        );
      },
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => {
        const isCredit = row.original.toAccountId === accountId;
        return (
          <span className={`font-semibold tabular-nums ${isCredit ? "text-emerald-600" : "text-gray-800"}`}>
            {isCredit ? "+" : "-"}{formatAmount(row.original.amount)}
          </span>
        );
      },
    },
  ];
}

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

  const columns = getColumns(accountId);

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

  const activeCategory = columnFilters.find((f) => f.id === "category")?.value as string | undefined;
  const activeType = columnFilters.find((f) => f.id === "type")?.value as string | undefined;
  const hasFilters = columnFilters.length > 0;

  function setFilter(id: string, value: string) {
    setColumnFilters((prev) =>
      value
        ? [...prev.filter((f) => f.id !== id), { id, value }]
        : prev.filter((f) => f.id !== id)
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters row */}
      <div className="flex items-center gap-3 flex-wrap">
        <select
          value={activeType ?? ""}
          onChange={(e) => setFilter("type", e.target.value)}
          className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-colors"
        >
          <option value="">All types</option>
          {typeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <select
          value={activeCategory ?? ""}
          onChange={(e) => setFilter("category", e.target.value)}
          className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-colors"
        >
          <option value="">All categories</option>
          {categoryOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
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
            {table.getRowModel().rows.length} of {transactions.length} transactions
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
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    <span className="text-gray-300">
                      {{ asc: "↑", desc: "↓" }[header.column.getIsSorted() as string] ?? ""}
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
              <TableRow key={row.id} className="border-stone-100 hover:bg-stone-50">
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="py-3.5 text-sm text-gray-700">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="py-12 text-center text-sm text-gray-400">
                No transactions match the current filters
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
