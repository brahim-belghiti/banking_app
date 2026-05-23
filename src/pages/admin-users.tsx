import { useQuery } from "@tanstack/react-query";
import { getUsers } from "@/api/users";
import { getAccounts } from "@/api/accounts";
import { useNavigate } from "react-router-dom";

export default function AdminUsersPage() {
  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  const { data: accounts } = useQuery({
    queryKey: ["accounts"],
    queryFn: getAccounts,
  });

  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Gestion des clients
        </h1>
        <p className="text-sm text-gray-400 mt-1">{users?.length} client(s)</p>
      </div>

      <div className="space-y-4">
        {users?.map((user) => {
          const userAccounts =
            accounts?.filter((a) => a.userId === user.id) ?? [];

          return (
            <div
              key={user.id}
              className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">
                    {user.firstName} {user.lastName}
                  </h2>
                  <p className="text-sm text-gray-400">{user.email}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Inscrit le{" "}
                    {new Date(user.createdAt).toLocaleDateString("fr-MA", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-medium text-emerald-700">
                  {userAccounts.length} compte(s)
                </span>
              </div>

              {userAccounts.length > 0 && (
                <div className="mt-4 space-y-2">
                  {userAccounts.map((acc) => {
                    const statusStyles: Record<string, string> = {
                      active:
                        "bg-emerald-50 text-emerald-700 border-emerald-200",
                      frozen: "bg-blue-50 text-blue-700 border-blue-200",
                      closed: "bg-red-50 text-red-600 border-red-200",
                    };

                    return (
                      <div
                        key={acc.id}
                        className="flex items-center justify-between rounded-lg border border-stone-100 bg-stone-50 px-4 py-3 cursor-pointer hover:bg-stone-100 transition-colors"
                        onClick={() => navigate(`/accounts/${acc.id}`)}
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {acc.label}
                          </p>
                          <p className="text-xs text-gray-400">
                            {acc.type === "checking" ? "Courant" : "Épargne"}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="text-sm font-semibold text-gray-900">
                            {(acc.balance / 100).toLocaleString("fr-MA", {
                              style: "currency",
                              currency: "MAD",
                            })}
                          </p>
                          <span
                            className={`px-2 py-0.5 text-xs font-medium rounded-full border ${statusStyles[acc.status]}`}
                          >
                            {acc.status === "active"
                              ? "Actif"
                              : acc.status === "frozen"
                                ? "Gelé"
                                : "Clôturé"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
