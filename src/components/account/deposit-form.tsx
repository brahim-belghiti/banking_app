import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createDeposit } from "@/api/transaction";
import { validateDeposit } from "@/lib/transaction-rules";
import type { Account } from "@/types";

const depositSchema = z.object({
  amount: z.coerce.number().positive("Le montant doit être supérieur à 0"),
  label: z.string().min(1, "Libellé requis"),
  category: z.string().min(1, "Catégorie requise"),
});

type DepositFormData = z.infer<typeof depositSchema>;

const categoryOptions = [
  { value: "salary", label: "Salaire" },
  { value: "savings", label: "Épargne" },
  { value: "other", label: "Autre" },
];

export default function DepositForm({
  toAccount,
  onClose,
}: {
  toAccount: Account;
  onClose: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DepositFormData>({
    resolver: zodResolver(depositSchema),
  });

  const mutation = useMutation({
    mutationFn: createDeposit,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["transactions", toAccount.id],
      });
      queryClient.invalidateQueries({ queryKey: ["account", toAccount.id] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      onClose();
    },
    onError: () => setError("Erreur lors du dépôt"),
  });

  const onSubmit = (data: DepositFormData) => {
    setError(null);
    const amountInCentimes = Math.round(data.amount * 100);

    const check = validateDeposit(toAccount, {
      toAccountId: toAccount.id,
      amount: amountInCentimes,
      label: data.label,
      category: data.category as any,
    });

    if (!check.valid) {
      setError(check.message);
      return;
    }

    mutation.mutate({
      toAccountId: toAccount.id,
      amount: amountInCentimes,
      label: data.label,
      category: data.category as any,
    });
  };

  const inputStyle =
    "w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500";
  const labelStyle = "block text-sm font-medium text-gray-700 mb-1.5";
  const errorStyle = "text-xs text-red-500 mt-1";

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className={labelStyle}>Montant (MAD)</label>
          <input
            {...register("amount")}
            type="number"
            step="0.01"
            placeholder="0.00"
            className={inputStyle}
          />
          {errors.amount && (
            <p className={errorStyle}>{errors.amount.message}</p>
          )}
        </div>

        <div>
          <label className={labelStyle}>Libellé</label>
          <input
            {...register("label")}
            type="text"
            placeholder="Ex: Salaire Mai 2026"
            className={inputStyle}
          />
          {errors.label && <p className={errorStyle}>{errors.label.message}</p>}
        </div>

        <div>
          <label className={labelStyle}>Catégorie</label>
          <select {...register("category")} className={inputStyle}>
            <option value="">Sélectionner</option>
            {categoryOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className={errorStyle}>{errors.category.message}</p>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            {isSubmitting ? "Envoi..." : "Confirmer le dépôt"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-stone-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-stone-50"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
