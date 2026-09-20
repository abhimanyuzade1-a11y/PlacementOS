"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

type Role = "recruiter" | "candidate";

export default function AuthPage() {
  const router = useRouter();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [role, setRole] = useState<Role>("candidate");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      if (mode === "signup") {
        if (!fullName.trim()) {
          setMessage("Please enter your full name.");
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role,
            },
          },
        });

        if (error) {
          setMessage(error.message);
          return;
        }

        if (data.session && data.user) {
          const { error: profileError } = await supabase
            .from("profiles")
            .insert({
              id: data.user.id,
              full_name: fullName,
              email,
              role,
            });

          if (profileError) {
            console.error(profileError);
          }

          router.push(
            role === "recruiter"
              ? "/recruiter"
              : "/candidate"
          );
        } else {
          setMessage(
            "Account created. Please check your email to confirm your account, then log in."
          );
        }
      } else {
        const { data, error } =
          await supabase.auth.signInWithPassword({
            email,
            password,
          });

        if (error) {
          setMessage(error.message);
          return;
        }

        if (!data.user) {
          setMessage("Login failed. Please try again.");
          return;
        }

        let { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .maybeSingle();

        if (!profile) {
          const metadata = data.user.user_metadata;

          const newRole: Role =
            metadata?.role === "recruiter"
              ? "recruiter"
              : "candidate";

          const { error: profileError } = await supabase
            .from("profiles")
            .insert({
              id: data.user.id,
              full_name:
                metadata?.full_name || "User",
              email: data.user.email,
              role: newRole,
            });

          if (profileError) {
            setMessage(profileError.message);
            return;
          }

          profile = { role: newRole };
        }

        router.push(
          profile.role === "recruiter"
            ? "/recruiter"
            : "/candidate"
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030712] text-white">

      {/* ================= BACKGROUND ================= */}

      <div className="pointer-events-none absolute inset-0">

        <div className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-violet-700/20 blur-[140px]" />

        <div className="absolute -right-40 top-20 h-[550px] w-[550px] rounded-full bg-cyan-500/15 blur-[140px]" />

        <div className="absolute bottom-[-300px] left-1/3 h-[650px] w-[650px] rounded-full bg-indigo-700/15 blur-[160px]" />

        {/* GRID */}

        <div
          className="absolute inset-0 opacity-[0.045]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.7) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      {/* ================= NAVBAR ================= */}

      <nav className="relative z-30 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">

        <a
          href="/"
          className="flex items-center gap-3"
        >
          <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-violet-400/30 bg-violet-500/10 shadow-[0_0_35px_rgba(139,92,246,.25)]">

            <div className="absolute inset-1 rounded-xl border border-cyan-300/20" />

            <span className="text-xl font-black">
              P
            </span>

            <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(103,232,249,1)]" />
          </div>

          <div>
            <p className="text-lg font-black tracking-[0.18em]">
              PLACEMENT
              <span className="text-violet-400">
                OS
              </span>
            </p>

            <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-slate-500">
              AI Hiring Intelligence
            </p>
          </div>
        </a>

        <a
          href="/"
          className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-semibold text-slate-400 backdrop-blur-xl transition hover:border-white/20 hover:text-white"
        >
          ← Back to home
        </a>
      </nav>

      {/* ================= MAIN ================= */}

      <section className="relative z-10 flex min-h-[calc(100vh-90px)] items-center justify-center px-6 pb-16">

        <div className="grid w-full max-w-7xl items-center gap-10 lg:grid-cols-[1fr_470px]">

          {/* ==================================================
              LEFT 3D AI CORE
          ================================================== */}

          <div className="relative hidden h-[650px] lg:flex items-center justify-center">

            {/* Large glow */}

            <div className="absolute h-[480px] w-[480px] rounded-full bg-violet-600/10 blur-[100px]" />

            {/* Outer orbital ring */}

            <div className="absolute h-[500px] w-[500px] animate-[spin_25s_linear_infinite] rounded-full border border-violet-400/10">

              <div className="absolute left-1/2 top-[-6px] h-3 w-3 -translate-x-1/2 rounded-full bg-cyan-300 shadow-[0_0_25px_rgba(103,232,249,1)]" />

              <div className="absolute bottom-[30px] right-[35px] h-2.5 w-2.5 rounded-full bg-violet-300 shadow-[0_0_20px_rgba(196,181,253,1)]" />

            </div>

            {/* Second ring */}

            <div className="absolute h-[380px] w-[380px] animate-[spin_18s_linear_infinite_reverse] rounded-full border border-cyan-300/10">

              <div className="absolute left-[20px] top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-cyan-300 shadow-[0_0_20px_rgba(103,232,249,1)]" />

              <div className="absolute right-[15px] top-[70px] h-2 w-2 rounded-full bg-fuchsia-300 shadow-[0_0_18px_rgba(232,121,249,1)]" />

            </div>

            {/* Third tilted ring */}

            <div className="absolute h-[290px] w-[520px] rotate-[65deg] animate-[spin_30s_linear_infinite] rounded-full border border-indigo-300/10" />

            {/* Floating node 1 */}

            <div className="absolute left-[12%] top-[25%] animate-[bounce_4s_ease-in-out_infinite] rounded-2xl border border-violet-300/20 bg-slate-950/70 px-4 py-3 shadow-[0_0_30px_rgba(124,58,237,.12)] backdrop-blur-xl">

              <p className="text-[9px] font-bold uppercase tracking-[.18em] text-violet-300">
                Agent 01
              </p>

              <p className="mt-1 text-xs font-bold">
                Resume Intelligence
              </p>

            </div>

            {/* Floating node 2 */}

            <div className="absolute right-[5%] top-[29%] animate-[bounce_5s_ease-in-out_infinite] rounded-2xl border border-cyan-300/20 bg-slate-950/70 px-4 py-3 shadow-[0_0_30px_rgba(6,182,212,.12)] backdrop-blur-xl">

              <p className="text-[9px] font-bold uppercase tracking-[.18em] text-cyan-300">
                Agent 02
              </p>

              <p className="mt-1 text-xs font-bold">
                Smart Matching
              </p>

            </div>

            {/* Floating node 3 */}

            <div className="absolute bottom-[23%] left-[13%] animate-[bounce_4.5s_ease-in-out_infinite] rounded-2xl border border-fuchsia-300/20 bg-slate-950/70 px-4 py-3 shadow-[0_0_30px_rgba(217,70,239,.12)] backdrop-blur-xl">

              <p className="text-[9px] font-bold uppercase tracking-[.18em] text-fuchsia-300">
                Agent 03
              </p>

              <p className="mt-1 text-xs font-bold">
                Interview AI
              </p>

            </div>

            {/* Floating node 4 */}

            <div className="absolute bottom-[20%] right-[7%] animate-[bounce_5.5s_ease-in-out_infinite] rounded-2xl border border-indigo-300/20 bg-slate-950/70 px-4 py-3 shadow-[0_0_30px_rgba(99,102,241,.12)] backdrop-blur-xl">

              <p className="text-[9px] font-bold uppercase tracking-[.18em] text-indigo-300">
                Agent 04
              </p>

              <p className="mt-1 text-xs font-bold">
                Hiring Decision
              </p>

            </div>

            {/* CENTRAL CORE */}

            <div className="relative flex h-[190px] w-[190px] items-center justify-center">

              {/* outer glow */}

              <div className="absolute inset-[-35px] rounded-full bg-violet-600/20 blur-[45px]" />

              {/* glass sphere */}

              <div className="absolute inset-0 rounded-full border border-violet-300/30 bg-gradient-to-br from-violet-500/30 via-indigo-700/20 to-cyan-400/20 shadow-[inset_0_0_70px_rgba(139,92,246,.2),0_0_80px_rgba(124,58,237,.3)] backdrop-blur-xl" />

              {/* inner sphere */}

              <div className="absolute inset-[25px] rounded-full border border-white/10 bg-gradient-to-br from-violet-500 via-indigo-600 to-cyan-400 shadow-[0_0_50px_rgba(99,102,241,.6)]">

                <div className="absolute inset-[10px] rounded-full border border-white/20" />

                <div className="absolute left-[28px] top-[22px] h-10 w-10 rounded-full bg-white/30 blur-xl" />

              </div>

              {/* P */}

              <span className="relative z-10 text-6xl font-black text-white drop-shadow-[0_0_25px_rgba(255,255,255,.5)]">
                P
              </span>

            </div>

            {/* title under core */}

            <div className="absolute bottom-[3%] text-center">

              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-4 py-2">

                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,1)]" />

                <span className="text-[10px] font-bold uppercase tracking-[.25em] text-emerald-300">
                  AI infrastructure online
                </span>

              </div>

              <h1 className="text-5xl font-black tracking-[-.04em]">

                Intelligent
                <br />

                <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">
                  Hiring Layer.
                </span>

              </h1>

              <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-slate-500">
                Resume intelligence, candidate matching,
                interview intelligence and recruiter decisions —
                connected in one autonomous workflow.
              </p>

            </div>

          </div>

          {/* ==================================================
              AUTH CARD
          ================================================== */}

          <div className="relative">

            <div className="absolute -inset-6 rounded-[45px] bg-violet-600/10 blur-3xl" />

            <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[#060914]/85 p-7 shadow-[0_30px_100px_rgba(0,0,0,.55)] backdrop-blur-2xl sm:p-9">

              <div className="absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-violet-400 to-transparent" />

              {/* CARD HEADER */}

              <div className="mb-8">

                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-400 text-xl font-black shadow-[0_0_35px_rgba(124,58,237,.35)]">
                  P
                </div>

                <h2 className="text-3xl font-black">
                  {mode === "login"
                    ? "Welcome back."
                    : "Create your account."}
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {mode === "login"
                    ? "Enter your credentials to continue to PlacementOS."
                    : "Join the intelligent recruitment workspace."}
                </p>

              </div>

              {/* MODE SWITCH */}

              <div className="mb-7 grid grid-cols-2 rounded-2xl border border-white/10 bg-white/[.03] p-1.5">

                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setMessage("");
                  }}
                  className={`rounded-xl py-2.5 text-sm font-bold transition ${
                    mode === "login"
                      ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg"
                      : "text-slate-500 hover:text-white"
                  }`}
                >
                  Login
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setMessage("");
                  }}
                  className={`rounded-xl py-2.5 text-sm font-bold transition ${
                    mode === "signup"
                      ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg"
                      : "text-slate-500 hover:text-white"
                  }`}
                >
                  Sign Up
                </button>

              </div>

              {/* FORM */}

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >

                {mode === "signup" && (
                  <div>

                    <label className="mb-2 block text-xs font-bold uppercase tracking-[.15em] text-slate-400">
                      Full Name
                    </label>

                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) =>
                        setFullName(e.target.value)
                      }
                      placeholder="Your full name"
                      className="w-full rounded-2xl border border-white/10 bg-white/[.035] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-violet-400/50 focus:ring-4 focus:ring-violet-500/10"
                    />

                  </div>
                )}

                {mode === "signup" && (
                  <div>

                    <label className="mb-2 block text-xs font-bold uppercase tracking-[.15em] text-slate-400">
                      Account Type
                    </label>

                    <div className="grid grid-cols-2 gap-3">

                      <button
                        type="button"
                        onClick={() =>
                          setRole("candidate")
                        }
                        className={`rounded-2xl border p-4 text-left transition ${
                          role === "candidate"
                            ? "border-violet-400/50 bg-violet-500/10"
                            : "border-white/10 bg-white/[.02] hover:border-white/20"
                        }`}
                      >
                        <div className="mb-2 text-xl">
                          ◇
                        </div>

                        <p className="text-sm font-bold">
                          Candidate
                        </p>

                        <p className="mt-1 text-[10px] text-slate-500">
                          Find opportunities
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setRole("recruiter")
                        }
                        className={`rounded-2xl border p-4 text-left transition ${
                          role === "recruiter"
                            ? "border-cyan-400/50 bg-cyan-500/10"
                            : "border-white/10 bg-white/[.02] hover:border-white/20"
                        }`}
                      >
                        <div className="mb-2 text-xl">
                          ◈
                        </div>

                        <p className="text-sm font-bold">
                          Recruiter
                        </p>

                        <p className="mt-1 text-[10px] text-slate-500">
                          Hire great talent
                        </p>
                      </button>

                    </div>

                  </div>
                )}

                {/* EMAIL */}

                <div>

                  <label className="mb-2 block text-xs font-bold uppercase tracking-[.15em] text-slate-400">
                    Email
                  </label>

                  <input
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    placeholder="you@example.com"
                    required
                    className="w-full rounded-2xl border border-white/10 bg-white/[.035] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-violet-400/50 focus:ring-4 focus:ring-violet-500/10"
                  />

                </div>

                {/* PASSWORD */}

                <div>

                  <div className="mb-2 flex items-center justify-between">

                    <label className="text-xs font-bold uppercase tracking-[.15em] text-slate-400">
                      Password
                    </label>

                    <span className="text-[10px] text-slate-600">
                      Secure access
                    </span>

                  </div>

                  <input
                    type="password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full rounded-2xl border border-white/10 bg-white/[.035] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-violet-400/50 focus:ring-4 focus:ring-violet-500/10"
                  />

                </div>

                {/* MESSAGE */}

                {message && (
                  <div className="rounded-2xl border border-violet-400/20 bg-violet-500/5 px-4 py-3 text-sm text-slate-300">
                    <span className="mr-2 text-violet-400">
                      ●
                    </span>

                    {message}
                  </div>
                )}

                {/* BUTTON */}

                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 py-4 font-black text-white shadow-[0_15px_40px_rgba(124,58,237,.3)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(124,58,237,.45)] disabled:opacity-50"
                >

                  <span className="relative z-10 flex items-center justify-center gap-3">

                    {loading
                      ? "Connecting..."
                      : mode === "login"
                      ? "Enter PlacementOS"
                      : "Create PlacementOS Account"}

                    {!loading && (
                      <span className="transition-transform duration-300 group-hover:translate-x-1">
                        →
                      </span>
                    )}

                  </span>

                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition duration-700 group-hover:translate-x-full" />

                </button>

              </form>

              {/* STATUS */}

              <div className="mt-7 flex items-center justify-center gap-2 text-[10px] uppercase tracking-[.16em] text-slate-600">

                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(34,197,94,.8)]" />

                Secure AI workspace

              </div>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}