"use client";

import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "./AuthContext";

const inputClasses =
  "w-full rounded-lg border border-slate-300 bg-white/80 px-4 py-3 text-sm font-mono text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900/80 dark:text-white dark:placeholder:text-slate-500";

const labelClasses = "mb-1.5 block text-sm font-mono font-medium text-slate-600 dark:text-slate-300";

function getErrorMessage(data: unknown, fallback: string) {
  if (data && typeof data === "object" && "error" in data) {
    const error = (data as { error: unknown }).error;
    return typeof error === "string" ? error : JSON.stringify(error);
  }
  return fallback;
}

export function LoginForm() {
  const { login } = useAuth();
  const [mode, setMode] = useState<"login" | "register" | "otp">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const resetStatus = () => {
    setError("");
    setSuccess("");
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    resetStatus();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(getErrorMessage(data, "Registration failed."));
      } else {
        setSuccess("Registered. Check the server console for the OTP, then verify below.");
        setMode("otp");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    resetStatus();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(getErrorMessage(data, "Login failed."));
      } else {
        login(data.accessToken, data.user);
        setSuccess("Logged in.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    resetStatus();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: otpCode }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(getErrorMessage(data, "Verification failed."));
      } else {
        setSuccess("Email verified. You can log in now.");
        setMode("login");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (nextMode: "login" | "register" | "otp") => {
    setMode(nextMode);
    resetStatus();
  };

  const title = mode === "login" ? "Welcome back" : mode === "register" ? "Create account" : "Verify email";
  const subtitle =
    mode === "login"
      ? "Sign in to keep your mentor workspace ready."
      : mode === "register"
        ? "Create an account, then verify with the console OTP."
        : "Enter the six-digit OTP logged by the server.";

  return (
    <div className="mesh-bg flex min-h-screen items-center justify-center px-4 py-10">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-950 font-mono text-sm font-black text-white shadow-lg shadow-slate-900/15 dark:bg-white dark:text-slate-950">
            DM
          </span>
          <div>
            <h1 className="font-mono text-lg font-bold text-slate-950 dark:text-white">DualMentor</h1>
            <p className="text-xs font-mono text-slate-500 dark:text-slate-400">Auth workspace</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white/75 p-7 shadow-2xl shadow-slate-900/10 backdrop-blur dark:border-white/10 dark:bg-slate-950/55">
          <div className="mb-6 text-center">
            <h2 className="font-mono text-2xl font-bold tracking-tight text-slate-950 dark:text-white">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{subtitle}</p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-mono text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-mono text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
              {success}
            </div>
          )}

          {mode === "otp" ? (
            <form onSubmit={handleOtp} className="space-y-4">
              <div>
                <label className={labelClasses}>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClasses} required />
              </div>
              <div>
                <label className={labelClasses}>OTP Code</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  maxLength={6}
                  className={`${inputClasses} text-center text-lg tracking-[0.45em]`}
                  required
                />
              </div>
              <button type="submit" disabled={loading} className="w-full rounded-lg bg-slate-950 py-3 text-sm font-mono font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-950">
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </form>
          ) : (
            <form onSubmit={mode === "login" ? handleLogin : handleRegister} className="space-y-4">
              {mode === "register" && (
                <div>
                  <label className={labelClasses}>Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClasses} required />
                </div>
              )}
              <div>
                <label className={labelClasses}>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClasses} required />
              </div>
              <div>
                <label className={labelClasses}>Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClasses} required minLength={6} />
              </div>
              <button type="submit" disabled={loading} className="w-full rounded-lg bg-slate-950 py-3 text-sm font-mono font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-950">
                {loading ? "Please wait..." : mode === "login" ? "Login" : "Register"}
              </button>
            </form>
          )}

          {mode !== "otp" && (
            <>
              <div className="my-5 flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
                <span className="text-xs font-mono text-slate-400">or</span>
                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
              </div>

              <a href="/api/auth/google" className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white/70 py-3 text-sm font-mono text-slate-700 transition hover:bg-white dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:bg-slate-900">
                <span className="font-bold text-blue-600">G</span>
                Continue with Google
              </a>
            </>
          )}

          <div className="mt-5 text-center text-sm font-mono text-slate-500 dark:text-slate-400">
            {mode === "login" ? (
              <>
                Don&apos;t have an account?{" "}
                <button onClick={() => switchMode("register")} className="text-indigo-600 hover:underline dark:text-indigo-400" type="button">
                  Register
                </button>
              </>
            ) : mode === "register" ? (
              <>
                Already have an account?{" "}
                <button onClick={() => switchMode("login")} className="text-indigo-600 hover:underline dark:text-indigo-400" type="button">
                  Login
                </button>
              </>
            ) : (
              <button onClick={() => switchMode("login")} className="text-indigo-600 hover:underline dark:text-indigo-400" type="button">
                Back to login
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
