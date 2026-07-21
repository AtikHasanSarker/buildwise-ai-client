"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button, Input } from "@/components/ui";
import { useToast } from "@/components/ui/toast";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    document.title = "Login — BuildWise AI";
  }, []);

  const { showToast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleGoogleSignin() {
    setGoogleLoading(true);
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
    });
  }

  function validate(): boolean {
    const errs: typeof errors = {};
    if (!email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errs.email = "Enter a valid email";
    if (!password) errs.password = "Password is required";
    else if (password.length < 6) errs.password = "At least 6 characters";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    await authClient.signIn.email(
      {
        email,
        password,
      },
      {
        onSuccess: () => {
          showToast("success", "Signed in successfully");
          router.push("/dashboard");
        },
        onError: (ctx) => {
          showToast("error", ctx.error.message);
        },
      }
    );
    setSubmitting(false);
  }

  return (
    <div className="flex flex-1 items-center justify-center min-h-screen px-4 bg-bg">
      <div className="w-full max-w-[420px] bg-surface rounded-2xl shadow-elevated p-8">
        <h1 className="text-2xl font-bold text-text-primary mb-1">
          Welcome back
        </h1>
        <p className="text-sm text-text-secondary mb-6">
          Sign in to your BuildWise account
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            error={errors.email}
          />

          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="password"
                className="text-sm font-medium text-text-primary"
              >
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-primary hover:underline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 rounded"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              error={errors.password}
            />
          </div>

          <Button
            type="submit"
            loading={submitting}
            variant="primary"
            className="w-full"
          >
            Sign in
          </Button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-text-secondary">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Google */}
        <Button
          type="button"
          variant="secondary"
          className="w-full focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
          loading={googleLoading}
          icon={
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
          }
          onClick={handleGoogleSignin}
        >
          Continue with Google
        </Button>

        <p className="mt-6 text-center text-sm text-text-secondary">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-primary hover:underline"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
