import LoginForm from "@/components/forms/login";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left: Brand panel */}
      <div
        className="hidden lg:flex w-5/12 flex-col justify-between p-12"
        style={{ background: "#0f2419" }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-full bg-emerald-400 flex items-center justify-center flex-shrink-0"
          >
            <span className="font-bold text-xs" style={{ color: "#0f2419" }}>
              FD
            </span>
          </div>
          <span className="text-white font-semibold text-lg">FinDash</span>
        </div>

        <div>
          <h2 className="text-white text-3xl font-semibold leading-snug">
            Manage your finances
            <br />
            with confidence.
          </h2>
          <p className="text-white/50 mt-3 text-sm leading-relaxed">
            Track accounts, monitor transactions, and stay in control of your
            money — all in one place.
          </p>
        </div>

        <p className="text-white/25 text-xs">© 2026 FinDash. All rights reserved.</p>
      </div>

      {/* Right: Form */}
      <div className="flex-1 flex items-center justify-center bg-stone-50 px-6">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-900">Sign in</h1>
            <p className="text-gray-400 text-sm mt-1">
              Enter your credentials to access your account
            </p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
