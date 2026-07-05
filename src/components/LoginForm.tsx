"use client";

import { useEffect, useMemo, useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "./AuthContext";

const inputClasses =
  "w-full rounded-2xl border border-white/60 bg-white/65 px-4 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-[0_10px_30px_rgba(15,23,42,0.06)] outline-none transition focus:border-indigo-400 focus:bg-white/80 focus:ring-2 focus:ring-indigo-400/30 dark:border-white/10 dark:bg-slate-900/70 dark:text-white dark:placeholder:text-slate-500 dark:focus:bg-slate-900/85";

const labelClasses = "mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-300";

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
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const timeout = window.setTimeout(() => setResendTimer((value) => value - 1), 1000);
    return () => window.clearTimeout(timeout);
  }, [resendTimer]);

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
        setOtpCode("");
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

  const resendLabel = useMemo(() => {
    if (resendTimer > 0) return `Resend in 00:${String(resendTimer).padStart(2, "0")}`;
    return "Resend OTP";
  }, [resendTimer]);

  const title = mode === "login" ? "Welcome back" : mode === "register" ? "Create account" : "Verify your email";
  const subtitle =
    mode === "login"
      ? "Sign in to keep your mentor workspace ready."
      : mode === "register"
        ? "Create your account and confirm it with a secure one-time code."
        : "Enter the six-digit code we sent to your inbox.";

  return (
    <div className="mesh-bg relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
      <div className="absolute right-4 top-4 z-20">
        <ThemeToggle />
      </div>

      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-[-8%] top-[-10%] h-48 w-48 rounded-full bg-indigo-400/20 blur-3xl" />
        <div className="absolute bottom-[-12%] right-[-6%] h-60 w-60 rounded-full bg-cyan-400/20 blur-3xl" />
      </div>

      <div className="relative w-full max-w-5xl">
        <div className="grid items-center gap-8 rounded-[32px] border border-white/60 bg-white/20 p-3 shadow-[0_30px_80px_rgba(15,23,42,0.16)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/30 lg:grid-cols-[1.1fr_0.9fr] lg:p-4">
          <div className="hidden rounded-[28px] border border-white/50 bg-gradient-to-br from-indigo-600 via-violet-600 to-cyan-500 p-8 text-white shadow-2xl lg:flex lg:flex-col lg:justify-between">
            <div>
              <div className="mb-8 inline-flex rounded-full border border-white/25 bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-white/90">
                DualMentor
              </div>
              <h2 className="max-w-md text-4xl font-semibold leading-tight">A refined login experience for ambitious minds.</h2>
              <p className="mt-4 max-w-lg text-sm leading-7 text-white/80">
                Secure sign-in, seamless email verification, and a premium interface designed to feel as polished as your work.
              </p>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 p-4 text-sm text-white/90">
              <p className="font-semibold">Why it feels premium</p>
              <ul className="mt-2 space-y-2 text-white/75">
                <li>• Glassy panels with luminous gradients</li>
                <li>• Fast OTP verification and resend support</li>
                <li>• Smooth motion and understated depth</li>
              </ul>
            </div>
          </div>

          <div className="glass-panel-strong rounded-[28px] border border-white/70 p-6 shadow-2xl sm:p-8">
            <div className="mb-6 text-center">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 text-base font-semibold text-white shadow-lg">
                DM
              </div>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{subtitle}</p>
            </div>

            {error && (
              <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50/90 px-4 py-3 text-sm text-rose-700 shadow-sm dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-700 shadow-sm dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
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
                  <label className={labelClasses}>Verification code</label>
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
                <button type="submit" disabled={loading} className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60">
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>
                <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                  <span>Didn’t get the code?</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (resendTimer > 0) return;
                      setResendTimer(30);
                      setSuccess("A fresh verification code is being prepared.");
                    }}
                    disabled={loading || resendTimer > 0}
                    className="font-semibold text-indigo-600 transition hover:text-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 dark:text-indigo-400"
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
                <button type="submit" disabled={loading} className="w-full rounded-2xl bg-gradient-to-r from-slate-900 to-slate-700 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 dark:from-white dark:to-slate-200 dark:text-slate-950">
                  {loading ? "Please wait..." : mode === "login" ? "Login" : "Register"}
                </button>
              </form>
            )}

            {mode !== "otp" && (
              <>
                <div className="my-5 flex items-center gap-3">
                  <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
                  <span className="text-xs uppercase tracking-[0.3em] text-slate-400">or</span>
                  <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
                </div>

                <a href="/api/auth/google" className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white/70 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-white dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:bg-slate-900">
                  <span className="font-black text-blue-600">G</span>
                  Continue with Google
                </a>
              </>
            )}

            <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
              {mode === "login" ? (
                <>
                  Don&apos;t have an account?{' '}
                  <button onClick={() => switchMode("register")} className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400" type="button">
                    Register
                  </button>
                </>
              ) : mode === "register" ? (
                <>
                  Already have an account?{' '}
                  <button onClick={() => switchMode("login")} className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400" type="button">
                    Login
                  </button>
                </>
              ) : (
                <button onClick={() => switchMode("login")} className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400" type="button">
                  Back to login
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
