import type { AnalyticsResponse } from "@/types";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

const COLORS = [
  "#f97316",
  "#3b82f6",
  "#10b981",
  "#eab308",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#f43f5e",
];

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

function formatAmount(centimes: number): string {
  return (centimes / 100).toLocaleString("fr-MA", {
    style: "currency",
    currency: "MAD",
  });
}

export default function SpendingChart({ data }: { data: AnalyticsResponse }) {
  const chartData = data.breakdown.map((item) => ({
    name: categoryLabels[item.category] || item.category,
    value: item.total,
    percentage: item.percentage,
  }));

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="rounded-xl border border-stone-200 bg-red-50 px-4 py-3">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Spent</p>
          <p className="text-base font-bold text-red-600 mt-0.5">
            {formatAmount(data.totalSpent)}
          </p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-emerald-50 px-4 py-3">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Income</p>
          <p className="text-base font-bold text-emerald-600 mt-0.5">
            {formatAmount(data.totalIncome)}
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={4}
            dataKey="value"
          >
            {chartData.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => formatAmount(value)}
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e7e5e4",
              borderRadius: "10px",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)",
            }}
            itemStyle={{ color: "#374151" }}
          />
          <Legend
            formatter={(value) => (
              <span style={{ fontSize: "12px", color: "#6b7280" }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
