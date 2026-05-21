import AccountCard from "@/components/dashboard/account-card";
import { useAccounts } from "@/hooks/use-accounts";

export default function AccountsPage() {
  const accounts = useAccounts().data;

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Your Accounts</h1>
        <p className="text-gray-400 mt-1 text-sm">
          Manage your linked bank accounts and cards.
        </p>
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
    </div>
  );
}
