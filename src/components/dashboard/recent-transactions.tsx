import type { Transaction } from "@/types";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function formatAmount(centimes: number): string {
  return (centimes / 100).toLocaleString("fr-MA", {
    style: "currency",
    currency: "MAD",
  });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-MA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

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

const statusVariant: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pending: "outline",
  completed: "default",
  failed: "destructive",
  cancelled: "secondary",
};

export default function RecentTransactions({
  transactions,
  accountId,
}: {
  transactions: Transaction[];
  accountId: string;
}) {
  const isCredit = (tx: Transaction) => tx.toAccountId === accountId;
  const sorted = [...transactions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-white/10">
          <TableHead>Date</TableHead>
          <TableHead>Libellé</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead className="text-right">Montant</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((tx) => (
          <TableRow key={tx.id} className="border-white/10">
            <TableCell className="text-slate-400">
              {formatDate(tx.createdAt)}
            </TableCell>
            <TableCell>{tx.label}</TableCell>
            <TableCell className="text-slate-400">
              {typeLabels[tx.type]}
            </TableCell>
            <TableCell>
              <Badge variant={statusVariant[tx.status]}>
                {statusLabels[tx.status]}
              </Badge>
            </TableCell>
            <TableCell
              className={`text-right font-medium ${isCredit(tx) ? "text-emerald-400" : "text-red-400"}`}
            >
              {isCredit(tx) ? "+" : "-"}
              {formatAmount(tx.amount)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
