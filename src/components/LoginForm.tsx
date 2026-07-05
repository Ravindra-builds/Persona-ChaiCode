"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "./AuthContext";

const inputClasses =
  "glass-input w-full rounded-md px-4 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:ring-2 focus:ring-[#d6b36a]/45 dark:text-stone-100 dark:placeholder:text-stone-600";

const labelClasses = "mb-1.5 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-stone-500";

function getErrorMessage(data: unknown, fallback: string) {
  if (data && typeof data === "object" && "error" in data) {
    const error = (data as { error: unknown }).error;
    return typeof error === "string" ? error : JSON.stringify(error);
  }
  return fallback;
}

export function LoginForm() {
  const { login, user } = useAuth();
  const [mode, setMode] = useState<"login" | "register" | "otp">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const timeout = window.setTimeout(() => setResendTimer((value) => value - 1), 1000);
    return () => window.clearTimeout(timeout);
  }, [resendTimer]);

  useEffect(() => {
    if (user) {
      window.location.assign("/");
    }
  }, [user]);

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
        setSuccess(data?.message ?? "Verification code sent to your email.");
        setResendTimer(30);
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
        setSuccess("Logged in. Redirecting home...");
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
        login(data.accessToken, data.user);
        setSuccess("Email verified. Redirecting to home...");
        setOtpCode("");
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

  const resendLabel = useMemo(() => {
    if (resendTimer > 0) return `Resend in 00:${String(resendTimer).padStart(2, "0")}`;
    return "Resend OTP";
  }, [resendTimer]);

  const title = mode === "login" ? "Sign in" : mode === "register" ? "Create account" : "Verify";
  const cta = loading ? "Please wait..." : mode === "login" ? "Login" : mode === "register" ? "Register" : "Verify OTP";

  return (
    <div className="mesh-bg flex min-h-screen items-center justify-center px-4 py-10 text-slate-950 dark:text-stone-50">
      <div className="absolute right-4 top-4 z-20">
        <ThemeToggle />
      </div>

      <div className="grid w-full max-w-5xl overflow-hidden rounded-lg border border-slate-950/10 bg-white/35 shadow-2xl shadow-slate-900/10 backdrop-blur-xl dark:border-white/10 dark:bg-white/5 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="hidden min-h-[620px] flex-col justify-between bg-slate-950 p-8 text-white dark:bg-stone-50 dark:text-slate-950 lg:flex">
          <div>
            <Link href="/" className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-white text-xs font-black text-slate-950 dark:bg-slate-950 dark:text-white">
              DM
            </Link>
            <div className="mt-16 h-px w-24 bg-white/35 dark:bg-slate-950/25" />
            <h1 className="mt-8 text-5xl font-semibold leading-none tracking-tight">
              Mentor
              <br />
              access.
            </h1>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold uppercase tracking-[0.18em] text-white/55 dark:text-slate-950/55">
            <span>Secure</span>
            <span>Fast</span>
            <span>Focused</span>
          </div>
        </section>

        <section className="glass-panel-strong p-6 sm:p-8 lg:p-10">
          <div className="mb-8 flex items-center justify-between">
            <Link href="/" className="rounded-md border border-slate-950/10 bg-white/45 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-stone-300 dark:hover:bg-white/10">
              Home
            </Link>
            <div className="text-xs font-bold uppercase tracking-[0.28em] text-slate-400 dark:text-stone-500">DualMentor</div>
          </div>

          <div className="mb-8">
            <h2 className="text-4xl font-semibold tracking-tight text-slate-950 dark:text-stone-50">{title}</h2>
            <p className="mt-3 text-sm text-slate-500 dark:text-stone-400">
              {mode === "otp" ? "Enter your code." : "Continue to your workspace."}
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-md border border-rose-500/20 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 rounded-md border border-emerald-500/20 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
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
                <label className={labelClasses}>Code</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  maxLength={6}
                  className={`${inputClasses} text-center text-lg tracking-[0.45em]`}
                  required
                />
              </div>
              <button type="submit" disabled={loading} className="w-full rounded-md bg-slate-950 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-stone-50 dark:text-slate-950">
                {cta}
              </button>
              <div className="flex items-center justify-between text-sm text-slate-500 dark:text-stone-400">
                <span>No code?</span>
                <button
                  type="button"
                  onClick={() => {
                    if (resendTimer > 0) return;
                    setResendTimer(30);
                    setSuccess("A fresh verification code is being prepared.");
                  }}
                  disabled={loading || resendTimer > 0}
                  className="font-semibold text-slate-950 transition hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-50 dark:text-stone-50"
                >
                  {resendLabel}
                </button>
              </div>
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
              <button type="submit" disabled={loading} className="w-full rounded-md bg-slate-950 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-stone-50 dark:text-slate-950">
                {cta}
              </button>
            </form>
          )}

          {mode !== "otp" && (
            <>
              <div className="my-5 flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-950/10 dark:bg-white/10" />
                <span className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">or</span>
                <div className="h-px flex-1 bg-slate-950/10 dark:bg-white/10" />
              </div>

              <a href="/api/auth/google" className="flex w-full items-center justify-center gap-2 rounded-md border border-slate-950/10 bg-white/55 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-stone-200 dark:hover:bg-white/10">
                <span className="font-black">G</span>
                Continue with Google
              </a>
            </>
          )}

          <div className="mt-6 text-center text-sm text-slate-500 dark:text-stone-400">
            {mode === "login" ? (
              <>
                New here?{" "}
                <button onClick={() => switchMode("register")} className="font-semibold text-slate-950 hover:underline dark:text-stone-50" type="button">
                  Register
                </button>
              </>
            ) : mode === "register" ? (
              <>
                Have an account?{" "}
                <button onClick={() => switchMode("login")} className="font-semibold text-slate-950 hover:underline dark:text-stone-50" type="button">
                  Login
                </button>
              </>
            ) : (
              <button onClick={() => switchMode("login")} className="font-semibold text-slate-950 hover:underline dark:text-stone-50" type="button">
                Back to login
              </button>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}