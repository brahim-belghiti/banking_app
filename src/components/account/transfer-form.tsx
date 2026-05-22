import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTransfer } from "@/api/transaction";
import { validateTransfer } from "@/lib/transaction-rules";
import { useAccounts } from "@/hooks/use-accounts";
import type { Account } from "@/types";

const transferSchema = z.object({
  toAccountId: z.string().min(1, "Sélectionnez un compte destinataire"),
  amount: z.coerce.number().positive("Le montant doit être supérieur à 0"),
  label: z.string().min(1, "Libellé requis"),
  category: z.string().min(1, "Catégorie requise"),
});

type TransferFormData = z.infer<typeof transferSchema>;

const categoryOptions = [
  { value: "savings", label: "Épargne" },
  { value: "housing", label: "Logement" },
  { value: "food", label: "Alimentation" },
  { value: "transport", label: "Transport" },
  { value: "utilities", label: "Factures" },
  { value: "other", label: "Autre" },
];

export default function TransferForm({
  fromAccount,
  onClose,
}: {
  fromAccount: Account;
  onClose: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const { data: accounts } = useAccounts();
  const queryClient = useQueryClient();

  const otherAccounts = accounts?.filter((a) => a.id !== fromAccount.id) ?? [];

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TransferFormData>({
    resolver: zodResolver(transferSchema),
  });

  const mutation = useMutation({
    mutationFn: createTransfer,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["transactions", fromAccount.id],
      });
      queryClient.invalidateQueries({ queryKey: ["account", fromAccount.id] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      onClose();
    },
    onError: () => setError("Erreur lors du virement"),
  });

  const onSubmit = (data: TransferFormData) => {
    setError(null);
    const toAccount = accounts?.find((a) => a.id === data.toAccountId);
    if (!toAccount) {
      setError("Compte destinataire introuvable");
      return;
    }

    const amountInCentimes = Math.round(data.amount * 100);

    const check = validateTransfer(fromAccount, toAccount, {
      fromAccountId: fromAccount.id,
      toAccountId: data.toAccountId,
      amount: amountInCentimes,
      label: data.label,
      category: data.category as any,
    });

    if (!check.valid) {
      setError(check.message);
      return;
    }

    mutation.mutate({
      fromAccountId: fromAccount.id,
      toAccountId: data.toAccountId,
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
          <label className={labelStyle}>Compte destinataire</label>
          <select {...register("toAccountId")} className={inputStyle}>
            <option value="">Sélectionner un compte</option>
            {otherAccounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.label}
              </option>
            ))}
          </select>
          {errors.toAccountId && (
            <p className={errorStyle}>{errors.toAccountId.message}</p>
          )}
        </div>

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
            placeholder="Ex: Virement vers épargne"
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
            {isSubmitting ? "Envoi..." : "Confirmer le virement"}
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
