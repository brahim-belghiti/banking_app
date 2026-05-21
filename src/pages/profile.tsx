import { useAuthStore } from "@/stores/auth";
import { User, Mail, Shield, Calendar } from "lucide-react";

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof User;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-4 py-4 border-b border-stone-100 last:border-0">
      <div className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center flex-shrink-0">
        <Icon size={15} className="text-gray-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
        <p className="text-sm font-medium text-gray-900 mt-0.5 truncate">{value}</p>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user } = useAuthStore();

  if (!user) return null;

  const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  const memberSince = new Date(user.createdAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">My Profile</h1>
        <p className="text-gray-400 mt-1 text-sm">Your personal account details.</p>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 mb-5">
        <div className="flex items-center gap-5 mb-6 pb-6 border-b border-stone-100">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-xl"
            style={{ background: "#0f2419" }}
          >
            {initials}
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900">
              {user.firstName} {user.lastName}
            </p>
            <span
              className={`inline-block mt-1 px-2.5 py-0.5 text-xs rounded-full font-medium ${
                user.role === "admin"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-stone-100 text-gray-600"
              }`}
            >
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </span>
          </div>
        </div>

        <InfoRow icon={User} label="Full Name" value={`${user.firstName} ${user.lastName}`} />
        <InfoRow icon={Mail} label="Email Address" value={user.email} />
        <InfoRow icon={Shield} label="Role" value={user.role.charAt(0).toUpperCase() + user.role.slice(1)} />
        <InfoRow icon={Calendar} label="Member Since" value={memberSince} />
      </div>
    </div>
  );
}
