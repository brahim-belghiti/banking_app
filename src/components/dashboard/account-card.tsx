import type { Account } from "@/types";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

function formatBalance(centimes: number): string {
  return (centimes / 100).toLocaleString("fr-MA", {
    style: "currency",
    currency: "MAD",
  });
}

const statusStyles: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  frozen: "bg-blue-50 text-blue-700 border-blue-200",
  closed: "bg-red-50 text-red-600 border-red-200",
};

const statusLabels: Record<string, string> = {
  active: "Active",
  frozen: "Frozen",
  closed: "Closed",
};

export default function AccountCard({ account }: { account: Account }) {
  const navigate = useNavigate();

  return (
    <div
      className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 cursor-pointer hover:shadow-md hover:border-stone-300 transition-all group"
      onClick={() => navigate(`/accounts/${account.id}`)}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">
            {account.type === "checking" ? "Checking" : "Savings"}
          </p>
          <p className="text-sm font-medium text-gray-700">{account.label}</p>
        </div>
        <span
          className={`px-2.5 py-0.5 text-xs font-medium rounded-full border ${statusStyles[account.status]}`}
        >
          {statusLabels[account.status]}
        </span>
      </div>
      <p className="text-2xl font-bold text-gray-900">
        {formatBalance(account.balance)}
      </p>
      <div className="flex items-center justify-end mt-4">
        <span className="text-xs text-emerald-600 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
          View details <ArrowRight size={13} />
        </span>
      </div>
    </div>
  );
}
