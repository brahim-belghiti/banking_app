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
    <div className="flex w-full h-full items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
      <div className="w-full w-full rounded-2xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <label className="mb-2 block text-sm font-medium text-slate-200">
            Email
          </label>
          <input
            {...register("email")}
            type="email"
            placeholder="Enter your email"
            className={`w-full rounded-xl border bg-white/5 px-4 py-3 text-white placeholder:text-slate-400 outline-none transition-all duration-200 focus:ring-2 ${
              errors.email
                ? "border-red-500 focus:ring-red-500"
                : "border-white/10 focus:border-blue-500 focus:ring-blue-500"
            }`}
          />
          {errors.email && (
            <p className="mt-2 text-sm text-red-400">{errors.email.message}</p>
          )}
          {/* Password */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Password
            </label>

            <input
              {...register("password")}
              type="password"
              placeholder="Enter your password"
              className={`w-full rounded-xl border bg-white/5 px-4 py-3 text-white placeholder:text-slate-400 outline-none transition-all duration-200 focus:ring-2 ${
                errors.password
                  ? "border-red-500 focus:ring-red-500"
                  : "border-white/10 focus:border-blue-500 focus:ring-blue-500"
              }`}
            />

            {errors.password && (
              <p className="mt-2 text-sm text-red-400">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white shadow-lg shadow-blue-600/30 transition-all duration-200 hover:bg-blue-500 hover:shadow-blue-500/40 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>
        {error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
