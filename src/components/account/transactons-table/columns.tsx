import type { ColumnDef } from "@tanstack/react-table";
import type { Transaction } from "@/types";
import { X } from "lucide-react";
import { canCancelTransaction } from "@/lib/transaction-rules";

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

function getColumns(
  accountId: string,
  onCancel: (tx: Transaction) => void,
): ColumnDef<Transaction>[] {
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
          <span
            className={`px-2.5 py-0.5 text-xs font-medium rounded-full border ${statusStyle[status]}`}
          >
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
          <span
            className={`font-semibold tabular-nums ${isCredit ? "text-emerald-600" : "text-gray-800"}`}
          >
            {isCredit ? "+" : "-"}
            {formatAmount(row.original.amount)}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const tx = row.original;
        const check = canCancelTransaction(tx);
        if (!check.valid) return null;

        return (
          <button
            onClick={() => onCancel(tx)}
            className="flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-100"
          >
            <X size={12} />
            Annuler
          </button>
        );
      },
    },
  ];
}

export { getColumns };
