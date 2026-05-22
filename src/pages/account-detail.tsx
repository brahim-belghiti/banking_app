import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTransactions } from "@/hooks/use-transactions";
import { getAccountById } from "@/api/accounts";
import { ArrowLeft } from "lucide-react";
import TransactionsTable from "@/components/account/transactions-table";
import { useState } from "react";
import TransferForm from "@/components/account/transfer-form";
import DepositForm from "@/components/account/deposit-form";
import { ArrowRightLeft, PlusCircle } from "lucide-react";

function formatBalance(centimes: number): string {
  return (centimes / 100).toLocaleString("fr-MA", {
    style: "currency",
    currency: "MAD",
  });
}

const statusLabels: Record<string, string> = {
  active: "Actif",
  frozen: "Gelé",
  closed: "Clôturé",
};

export default function AccountDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeForm, setActiveForm] = useState<"transfer" | "deposit" | null>(
    null,
  );

  const { data: account, isLoading: loadingAccount } = useQuery({
    queryKey: ["account", id],
    queryFn: () => getAccountById(id!),
    enabled: !!id,
  });

  const { data: transactions, isLoading: loadingTx } = useTransactions(id);

  if (loadingAccount) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!account)
    return <p className="p-8 text-red-500 text-sm">Account not found.</p>;

  const statusStyles: Record<string, string> = {
    active: "bg-emerald-50 text-emerald-700 border-emerald-200",
    frozen: "bg-blue-50 text-blue-700 border-blue-200",
    closed: "bg-red-50 text-red-600 border-red-200",
  };

  return (
    <div className="p-8 max-w-5xl space-y-6">
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
      >
        <ArrowLeft size={15} />
        Back to Dashboard
      </button>

      {/* Account header card */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">
              {account.type === "checking"
                ? "Checking Account"
                : "Savings Account"}
            </p>
            <h1 className="text-xl font-semibold text-gray-900">
              {account.label}
            </h1>
          </div>
          <span
            className={`px-3 py-1 text-xs font-medium rounded-full border ${statusStyles[account.status]}`}
          >
            {statusLabels[account.status]}
          </span>
        </div>
        <p className="text-3xl font-bold text-emerald-700 mt-5">
          {formatBalance(account.balance)}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Opened{" "}
          {new Date(account.createdAt).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      {/* Action buttons */}
      {account.status === "active" && (
        <div className="flex gap-3">
          <button
            onClick={() =>
              setActiveForm(activeForm === "transfer" ? null : "transfer")
            }
            className="flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-stone-50"
          >
            <ArrowRightLeft size={15} />
            Nouveau virement
          </button>
          <button
            onClick={() =>
              setActiveForm(activeForm === "deposit" ? null : "deposit")
            }
            className="flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-stone-50"
          >
            <PlusCircle size={15} />
            Nouveau dépôt
          </button>
        </div>
      )}

      {/* Inline forms */}
      {activeForm === "transfer" && (
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            Nouveau virement
          </h2>
          <TransferForm
            fromAccount={account}
            onClose={() => setActiveForm(null)}
          />
        </div>
      )}

      {activeForm === "deposit" && (
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            Nouveau dépôt
          </h2>
          <DepositForm
            toAccount={account}
            onClose={() => setActiveForm(null)}
          />
        </div>
      )}

      {/* Transactions */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-gray-900 mb-5">
          Transaction History
        </h2>
        {loadingTx ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : transactions?.length ? (
          <TransactionsTable transactions={transactions} accountId={id!} />
        ) : (
          <p className="text-gray-400 text-sm py-8 text-center">
            No transactions yet
          </p>
        )}
      </div>
    </div>
  );
}
