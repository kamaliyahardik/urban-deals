"use client";

import React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BrandMark } from "@/components/Logo";
import { canAutoLogin, getAdminToken, setAdminSession } from "@/lib/admin-auth";
import { Eye, EyeOff, LogIn, ArrowLeft, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Remembered admin skips this page and lands in the dashboard
  useEffect(() => {
    if (canAutoLogin() && getAdminToken()) {
      router.replace("/admin/dashboard");
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Invalid credentials");
      } else {
        setAdminSession(data.token, remember);
        router.replace("/admin/dashboard");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card/40 to-background flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* soft glows */}
      <div
        aria-hidden
        className="animate-glow-pulse absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-primary/15 blur-3xl"
      />
      <div
        aria-hidden
        className="animate-glow-pulse absolute bottom-0 right-0 h-80 w-80 rounded-full bg-fuchsia-500/10 blur-3xl"
      />

      <Card className="w-full max-w-md p-8 relative animate-in fade-in slide-in-from-bottom-4 duration-500 glass rounded-3xl">
          <div className="mb-8 text-center">
            <Link href="/" className="inline-flex mb-4">
              <BrandMark className="w-14 h-14 text-primary" />
            </Link>
            <h1 className="text-2xl font-extrabold tracking-tight">
              Admin Login
            </h1>
            <p className="text-sm text-muted-foreground mt-1.5">
              Sign in to manage Urban Deals products
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-300">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background/80 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary/40 transition"
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-border bg-background/80 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary/40 transition"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Save login info */}
            <label className="group flex items-center gap-3 p-3.5 rounded-xl border border-border/70 bg-secondary/40 hover:border-primary/40 cursor-pointer transition-colors select-none">
              <span className="relative flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="peer sr-only"
                />
                <span
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                    remember
                      ? "bg-primary border-primary scale-100"
                      : "border-border bg-card group-hover:border-primary/50"
                  }`}
                >
                  {remember && (
                    <svg
                      viewBox="0 0 12 12"
                      className="w-3 h-3 text-white"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M2 6.5 4.5 9 10 3.5" />
                    </svg>
                  )}
                </span>
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-bold">
                  Save login info
                </span>
                <span className="block text-xs text-muted-foreground leading-snug">
                  Skip this page next time on this device
                </span>
              </span>
              <ShieldCheck className="w-4.5 h-4.5 ml-auto text-primary shrink-0" />
            </label>

            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="w-full rounded-xl font-bold shadow-md shadow-primary/20 active:scale-[0.99] h-12"
            >
              {loading ? (
                <>
                  <Loaderish className="w-4 h-4 mr-2" />
                  Signing in…
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Login
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-border/70">
            <p className="text-sm text-muted-foreground text-center">
              Not an admin?{" "}
              <Link
                href="/"
                className="inline-flex items-center gap-1 text-primary hover:underline font-semibold"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Go back home
              </Link>
            </p>
          </div>
        </Card>
    </div>
  );
}

function Loaderish({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <span
      className={`inline-block align-middle animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
      aria-hidden="true"
    />
  );
}
