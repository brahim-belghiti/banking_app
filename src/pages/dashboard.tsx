import { useAccounts } from "@/hooks/use-accounts";
import { useTransactions } from "@/hooks/use-transactions";
import AccountCard from "@/components/dashboard/account-card";
import { useAuthStore } from "@/stores/auth";
import { ArrowDownLeft, ArrowUpRight, RefreshCw } from "lucide-react";
import type { Transaction } from "@/types";
import { useAnalytics } from "@/hooks/use-analytics";
import SpendingChart from "@/components/dashboard/spending-chart";

function formatAmount(centimes: number): string {
  return (centimes / 100).toLocaleString("fr-MA", {
    style: "currency",
    currency: "MAD",
  });
}

const txMeta: Record<string, { icon: typeof ArrowDownLeft; color: string }> = {
  deposit: { icon: ArrowDownLeft, color: "text-emerald-600 bg-emerald-50" },
  payment: { icon: ArrowUpRight, color: "text-red-500 bg-red-50" },
  transfer: { icon: RefreshCw, color: "text-blue-500 bg-blue-50" },
  withdrawal: { icon: ArrowUpRight, color: "text-orange-500 bg-orange-50" },
};

const statusStyle: Record<string, string> = {
  completed: "text-emerald-700 bg-emerald-50 border-emerald-200",
  pending: "text-amber-700 bg-amber-50 border-amber-200",
  failed: "text-red-700 bg-red-50 border-red-200",
  cancelled: "text-gray-600 bg-gray-50 border-gray-200",
};

function TransactionRow({ tx }: { tx: Transaction }) {
  const meta = txMeta[tx.type] ?? txMeta.payment;
  const Icon = meta.icon;
  const isIncoming = tx.type === "deposit";

  return (
    <div className="flex items-center gap-4 py-4 border-b border-stone-100 last:border-0">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${meta.color}`}
      >
        <Icon size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{tx.label}</p>
        <p className="text-xs text-gray-400 mt-0.5">
          {new Date(tx.createdAt).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        <p
          className={`text-sm font-semibold ${isIncoming ? "text-emerald-600" : "text-gray-800"}`}
        >
          {isIncoming ? "+" : "-"}
          {formatAmount(tx.amount)}
        </p>
        <span
          className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full border ${statusStyle[tx.status]}`}
        >
          {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
        </span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { data: accounts, isLoading: loadingAccounts } = useAccounts();

  const firstAccountId = accounts?.[0]?.id;
  const { data: transactions, isLoading: loadingTx } =
    useTransactions(firstAccountId);
  const { data: analytics } = useAnalytics(firstAccountId);

  if (loadingAccounts) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const totalBalance = accounts?.reduce((sum, a) => sum + a.balance, 0) ?? 0;
  const savingsBalance =
    accounts
      ?.filter((a) => a.type === "savings")
      .reduce((sum, a) => sum + a.balance, 0) ?? 0;

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          Hello, {user?.firstName}
        </h1>
        <p className="text-gray-400 mt-1 text-sm">
          Here's an overview of your finances.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <span className="text-emerald-700 font-semibold text-xs">
                MAD
              </span>
            </div>
            <div>
              <p className="text-xl font-bold text-emerald-700">
                {formatAmount(totalBalance)}
              </p>
              <p className="text-xs text-gray-400 uppercase tracking-wide mt-0.5">
                Total Balance
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600 font-semibold text-xs">SAV</span>
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">
                {formatAmount(savingsBalance)}
              </p>
              <p className="text-xs text-gray-400 uppercase tracking-wide mt-0.5">
                Savings
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-base font-semibold text-gray-900 mb-4">
          My Accounts
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {accounts?.map((account) => (
            <AccountCard key={account.id} account={account} />
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-4">
          Recent Activity
        </h2>
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm px-5">
          {loadingTx ? (
            <div className="py-8 text-center text-gray-400 text-sm">
              Loading transactions...
            </div>
          ) : transactions?.length ? (
            transactions
              .slice(0, 5)
              .map((tx) => <TransactionRow key={tx.id} tx={tx} />)
          ) : (
            <div className="py-8 text-center text-gray-400 text-sm">
              No recent transactions
            </div>
          )}
        </div>
      </div>
      {analytics && (
        <div className="mt-8">
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            Spending Breakdown
          </h2>
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5">
            <SpendingChart data={analytics} />
          </div>
        </div>
      )}
    </div>
  );
}
