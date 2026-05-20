import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError(null);
      await login(data.email, data.password);
      navigate("/");
    } catch {
      setError("Email ou mot de passe incorrect");
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            {...register("email")}
            type="email"
            placeholder="you@example.com"
            className={`w-full rounded-xl border bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none transition-all duration-200 focus:ring-2 text-sm ${
              errors.email
                ? "border-red-400 focus:ring-red-300"
                : "border-stone-300 focus:border-emerald-500 focus:ring-emerald-200"
            }`}
          />
          {errors.email && (
            <p className="mt-1.5 text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            {...register("password")}
            type="password"
            placeholder="••••••••"
            className={`w-full rounded-xl border bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none transition-all duration-200 focus:ring-2 text-sm ${
              errors.password
                ? "border-red-400 focus:ring-red-300"
                : "border-stone-300 focus:border-emerald-500 focus:ring-emerald-200"
            }`}
          />
          {errors.password && (
            <p className="mt-1.5 text-xs text-red-500">
              {errors.password.message}
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl py-3 font-semibold text-white text-sm transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-70"
          style={{ background: "#0f2419" }}
        >
          {isSubmitting ? "Signing in..." : "Sign in →"}
        </button>
      </form>
      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
}
