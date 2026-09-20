"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Home() {
  const [status, setStatus] = useState("Connecting to PlacementOS...");
  const [activeAgent, setActiveAgent] = useState(0);

  useEffect(() => {
    async function checkSupabase() {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        setStatus("System connection issue");
        return;
      }

      setStatus(
        data.session
          ? "AI infrastructure online"
          : "AI infrastructure online"
      );
    }

    checkSupabase();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveAgent((current) => (current + 1) % 6);
    }, 1800);

    return () => clearInterval(timer);
  }, []);

  const agents = [
    {
      number: "01",
      name: "Resume Intelligence",
      icon: "◈",
      text: "Extracting candidate signals",
    },
    {
      number: "02",
      name: "Candidate Matching",
      icon: "✦",
      text: "Comparing skills with requirements",
    },
    {
      number: "03",
      name: "Skill Verification",
      icon: "◇",
      text: "Validating demonstrated skills",
    },
    {
      number: "04",
      name: "Interview Intelligence",
      icon: "◎",
      text: "Generating personalized questions",
    },
    {
      number: "05",
      name: "Candidate Evaluation",
      icon: "◉",
      text: "Building structured insights",
    },
    {
      number: "06",
      name: "Scheduling Agent",
      icon: "▣",
      text: "Preparing the next hiring step",
    },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030712] text-white">
      {/* =========================================================
          BACKGROUND
      ========================================================= */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-180px] top-[-180px] h-[520px] w-[520px] rounded-full bg-violet-600/20 blur-[130px] animate-pulse" />

        <div
          className="absolute right-[-160px] top-[100px] h-[500px] w-[500px] rounded-full bg-cyan-500/15 blur-[140px] animate-pulse"
          style={{ animationDelay: "1s" }}
        />

        <div
          className="absolute bottom-[-250px] left-[35%] h-[600px] w-[600px] rounded-full bg-indigo-600/15 blur-[150px] animate-pulse"
          style={{ animationDelay: "2s" }}
        />

        <div className="absolute inset-0 opacity-[0.035]">
          <div
            className="h-full w-full"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
              backgroundSize: "45px 45px",
            }}
          />
        </div>
      </div>

      {/* =========================================================
          NAVBAR
      ========================================================= */}

      <nav className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <a href="/" className="group flex items-center gap-3">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-violet-400/30 bg-violet-500/10 shadow-[0_0_35px_rgba(139,92,246,0.25)]">
            <div className="absolute inset-1 rounded-xl border border-cyan-300/20" />

            <span className="text-xl font-black text-white">
              P
            </span>

            <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_15px_rgba(103,232,249,0.9)]" />
          </div>

          <div>
            <p className="text-lg font-black tracking-[0.18em]">
              PLACEMENT<span className="text-violet-400">OS</span>
            </p>

            <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-slate-500">
              AI Hiring Intelligence
            </p>
          </div>
        </a>

        <div className="hidden items-center gap-8 md:flex">
          <a
            href="#agents"
            className="text-sm text-slate-400 transition hover:text-white"
          >
            AI Agents
          </a>

          <a
            href="#workflow"
            className="text-sm text-slate-400 transition hover:text-white"
          >
            Workflow
          </a>

          <a
            href="#technology"
            className="text-sm text-slate-400 transition hover:text-white"
          >
            Intelligence
          </a>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/auth"
            className="hidden rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white sm:block"
          >
            Sign in
          </a>

          <a
            href="/auth/register"
            className="group relative overflow-hidden rounded-xl border border-violet-400/30 bg-violet-600 px-5 py-2.5 text-sm font-bold text-white shadow-[0_0_25px_rgba(124,58,237,0.25)] transition hover:-translate-y-0.5 hover:bg-violet-500 hover:shadow-[0_0_35px_rgba(124,58,237,0.4)]"
          >
            <span className="relative z-10">
              Get Started
            </span>

            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition duration-700 group-hover:translate-x-full" />
          </a>
        </div>
      </nav>

      {/* =========================================================
          HERO
      ========================================================= */}

      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-20 pt-16 lg:px-10 lg:pb-28 lg:pt-24">
        <div className="grid items-center gap-16 lg:grid-cols-[1.05fr_0.95fr]">
          {/* LEFT */}

          <div>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-4 py-2 backdrop-blur-xl">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />

              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
                {status}
              </span>
            </div>

            <h1 className="max-w-4xl text-5xl font-black leading-[0.98] tracking-[-0.04em] sm:text-6xl lg:text-8xl">
              Hiring
              <br />

              <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">
                intelligence
              </span>

              <br />

              that moves.
            </h1>

            <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-400 sm:text-xl">
              PlacementOS transforms recruitment from a manual
              process into an intelligent, agent-driven workflow
              that analyzes, matches, verifies, interviews and
              guides every candidate journey.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <a
                href="/auth/register"
                className="group relative flex items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-7 py-4 font-bold shadow-[0_15px_50px_rgba(109,40,217,0.3)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_65px_rgba(109,40,217,0.45)]"
              >
                <span>Enter PlacementOS</span>
                <span className="text-lg transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>

                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition duration-700 group-hover:translate-x-full" />
              </a>

              <a
                href="#workflow"
                className="flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-7 py-4 font-semibold text-slate-200 backdrop-blur-xl transition hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.06]"
              >
                Explore the workflow
                <span>↓</span>
              </a>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-xs text-slate-500">
              <span>✦ AI Resume Intelligence</span>
              <span>✦ Smart Candidate Matching</span>
              <span>✦ Personalized Interviews</span>
              <span>✦ Human Final Decision</span>
            </div>
          </div>

          {/* RIGHT — AI ORBIT */}

          <div className="relative mx-auto h-[500px] w-full max-w-[560px]">
            {/* Outer rings */}

            <div className="absolute left-1/2 top-1/2 h-[390px] w-[390px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-violet-400/10" />

            <div
              className="absolute left-1/2 top-1/2 h-[310px] w-[310px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-400/10"
              style={{
                animation: "spin 18s linear infinite",
              }}
            />

            <div
              className="absolute left-1/2 top-1/2 h-[230px] w-[230px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-violet-400/15"
              style={{
                animation: "spin 12s linear infinite reverse",
              }}
            />

            {/* Core */}

            <div className="absolute left-1/2 top-1/2 z-10 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-[38px] border border-white/15 bg-slate-950/80 shadow-[0_0_100px_rgba(124,58,237,0.35)] backdrop-blur-2xl">
              <div className="absolute inset-3 rounded-[30px] border border-violet-400/20" />

              <div className="flex h-full flex-col items-center justify-center">
                <div className="relative mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 shadow-[0_0_40px_rgba(139,92,246,0.45)]">
                  <span className="text-2xl font-black">
                    P
                  </span>

                  <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,1)]" />
                </div>

                <p className="text-sm font-black tracking-[0.22em]">
                  AGENT CORE
                </p>

                <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-emerald-400">
                  Autonomous
                </p>
              </div>
            </div>

            {/* Floating agent cards */}

            {agents.map((agent, index) => {
              const positions = [
                "left-0 top-12",
                "right-0 top-5",
                "right-[-12px] top-[185px]",
                "right-8 bottom-5",
                "left-8 bottom-3",
                "left-[-18px] top-[210px]",
              ];

              return (
                <div
                  key={agent.number}
                  className={`absolute ${positions[index]} z-20 w-[190px] rounded-2xl border border-white/10 bg-slate-950/70 p-3 shadow-2xl backdrop-blur-xl transition-all duration-700`}
                  style={{
                    transform:
                      activeAgent === index
                        ? "translateY(-8px) scale(1.04)"
                        : "translateY(0) scale(1)",
                    borderColor:
                      activeAgent === index
                        ? "rgba(167,139,250,0.45)"
                        : "rgba(255,255,255,0.1)",
                    boxShadow:
                      activeAgent === index
                        ? "0 0 35px rgba(124,58,237,0.22)"
                        : "0 20px 50px rgba(0,0,0,0.25)",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                        activeAgent === index
                          ? "bg-violet-500/20 text-violet-300"
                          : "bg-white/5 text-slate-400"
                      }`}
                    >
                      {agent.icon}
                    </div>

                    <div className="min-w-0">
                      <p className="text-[9px] font-bold tracking-[0.15em] text-slate-500">
                        AGENT {agent.number}
                      </p>

                      <p className="truncate text-xs font-bold text-slate-200">
                        {agent.name}
                      </p>
                    </div>
                  </div>

                  <p className="mt-2 text-[10px] text-slate-500">
                    {agent.text}
                  </p>

                  {activeAgent === index && (
                    <div className="mt-2 flex items-center gap-2 text-[9px] font-semibold text-emerald-400">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                      ACTIVE
                    </div>
                  )}
                </div>
              );
            })}

            {/* Floating particles */}

            <span className="absolute left-[45%] top-5 h-2 w-2 animate-ping rounded-full bg-cyan-300" />
            <span className="absolute right-[18%] top-[42%] h-1.5 w-1.5 animate-pulse rounded-full bg-violet-300" />
            <span className="absolute bottom-[20%] left-[42%] h-2 w-2 animate-pulse rounded-full bg-cyan-300" />
          </div>
        </div>
      </section>

      {/* =========================================================
          STATS
      ========================================================= */}

      <section className="relative z-10 mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025] backdrop-blur-xl sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["01", "Goal-driven", "Recruitment workflow"],
            ["06", "AI Agents", "Specialized intelligence"],
            ["24/7", "Automation", "Always-ready workflow"],
            ["100%", "Human", "Final decision control"],
          ].map(([value, title, subtitle], index) => (
            <div
              key={title}
              className={`group relative p-7 transition hover:bg-white/[0.035] ${
                index !== 3
                  ? "border-b border-white/10 sm:border-r lg:border-b-0"
                  : ""
              }`}
            >
              <p className="text-3xl font-black text-white">
                {value}
              </p>

              <p className="mt-2 font-bold text-violet-300">
                {title}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {subtitle}
              </p>

              <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-violet-500 to-cyan-400 transition-all duration-500 group-hover:w-full" />
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================
          WORKFLOW
      ========================================================= */}

      <section
        id="workflow"
        className="relative z-10 mx-auto max-w-7xl px-6 py-28 lg:px-10"
      >
        <div className="mb-14 max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-400">
            Autonomous workflow
          </p>

          <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
            From hiring goal
            <span className="text-violet-400"> to action.</span>
          </h2>

          <p className="mt-5 leading-7 text-slate-400">
            PlacementOS coordinates specialized AI agents across
            the recruitment journey while keeping the recruiter
            in control of the final decision.
          </p>
        </div>

        <div className="relative">
          <div className="absolute left-8 right-8 top-1/2 hidden h-px bg-gradient-to-r from-violet-500/10 via-violet-400/40 to-cyan-400/10 lg:block" />

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-5">
            {[
              ["01", "Hiring Goal", "Define role, skills and hiring needs."],
              ["02", "AI Screening", "Analyze resumes and candidate signals."],
              ["03", "Skill Match", "Compare candidate evidence with requirements."],
              ["04", "Interview", "Generate personalized interview intelligence."],
              ["05", "Human Decision", "Recruiter reviews and takes the final action."],
            ].map(([number, title, description]) => (
              <div
                key={number}
                className="group relative z-10 rounded-3xl border border-white/10 bg-[#07101f]/80 p-6 backdrop-blur-xl transition duration-300 hover:-translate-y-2 hover:border-violet-400/30 hover:shadow-[0_25px_60px_rgba(0,0,0,0.35)]"
              >
                <div className="mb-8 flex items-center justify-between">
                  <span className="text-xs font-black tracking-[0.2em] text-violet-400">
                    {number}
                  </span>

                  <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.8)] transition group-hover:scale-150" />
                </div>

                <h3 className="text-lg font-bold">
                  {title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          AGENTS
      ========================================================= */}

      <section
        id="agents"
        className="relative z-10 mx-auto max-w-7xl px-6 pb-28 lg:px-10"
      >
        <div className="mb-12 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-violet-400">
            Agent network
          </p>

          <h2 className="mt-4 text-4xl font-black sm:text-5xl">
            Specialized intelligence.
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-slate-500">
            Each agent focuses on a specific recruitment task,
            while PlacementOS coordinates the complete workflow.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent, index) => (
            <div
              key={agent.number}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025] p-7 backdrop-blur-xl transition duration-500 hover:-translate-y-2 hover:border-violet-400/25 hover:bg-white/[0.045]"
            >
              <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-violet-500/10 blur-3xl transition group-hover:bg-violet-500/20" />

              <div className="relative">
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-xl text-violet-300 transition group-hover:scale-110 group-hover:border-violet-400/30">
                    {agent.icon}
                  </div>

                  <span className="text-xs font-black tracking-[0.2em] text-slate-600">
                    AGENT {agent.number}
                  </span>
                </div>

                <h3 className="mt-7 text-xl font-bold">
                  {agent.name}
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  {agent.text}. PlacementOS uses this intelligence
                  as part of the larger hiring workflow.
                </p>

                <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  AI READY
                </div>
              </div>

              <div className="absolute bottom-0 left-0 h-px w-0 bg-gradient-to-r from-violet-500 to-cyan-400 transition-all duration-500 group-hover:w-full" />

              <span className="absolute bottom-5 right-6 text-slate-700 transition group-hover:text-violet-400">
                ↗
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================
          TECHNOLOGY
      ========================================================= */}

      <section
        id="technology"
        className="relative z-10 mx-auto max-w-7xl px-6 pb-28 lg:px-10"
      >
        <div className="overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-violet-500/[0.08] via-white/[0.025] to-cyan-500/[0.06] p-8 sm:p-12 lg:p-16">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-400">
                Built for intelligent hiring
              </p>

              <h2 className="mt-5 text-4xl font-black leading-tight sm:text-5xl">
                One system.
                <br />
                Multiple AI capabilities.
              </h2>

              <p className="mt-6 max-w-xl leading-7 text-slate-400">
                PlacementOS combines candidate data, recruitment
                workflows and generative AI to create a connected
                hiring intelligence layer.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                {[
                  "Resume Intelligence",
                  "AI Matching",
                  "Interview Generation",
                  "Skill Verification",
                  "Scheduling",
                  "Recruiter Review",
                ].map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-xs font-semibold text-slate-300"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative mx-auto h-[330px] w-full max-w-[440px]">
              <div className="absolute inset-0 rounded-[32px] border border-white/10 bg-black/20 backdrop-blur-xl" />

              <div className="absolute left-1/2 top-1/2 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-3xl border border-violet-400/30 bg-violet-500/10 shadow-[0_0_70px_rgba(124,58,237,0.25)]">
                <span className="text-2xl font-black">
                  AI
                </span>
              </div>

              {[
                ["Resume", "top-7 left-7"],
                ["Match", "top-7 right-7"],
                ["Interview", "bottom-7 left-7"],
                ["Decision", "bottom-7 right-7"],
              ].map(([name, position]) => (
                <div
                  key={name}
                  className={`absolute ${position} rounded-2xl border border-white/10 bg-slate-950/80 px-5 py-4 shadow-xl backdrop-blur-xl`}
                >
                  <p className="text-xs font-bold text-slate-200">
                    {name}
                  </p>

                  <div className="mt-2 flex gap-1">
                    <span className="h-1.5 w-5 rounded-full bg-violet-400" />
                    <span className="h-1.5 w-2 rounded-full bg-cyan-400" />
                    <span className="h-1.5 w-2 rounded-full bg-slate-700" />
                  </div>
                </div>
              ))}

              <div className="absolute left-[25%] top-1/2 h-px w-[25%] bg-gradient-to-r from-violet-500/10 to-violet-400/50" />

              <div className="absolute right-[25%] top-1/2 h-px w-[25%] bg-gradient-to-l from-cyan-500/10 to-cyan-400/50" />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          FINAL CTA
      ========================================================= */}

      <section className="relative z-10 mx-auto max-w-5xl px-6 pb-24 text-center">
        <div className="relative overflow-hidden rounded-[36px] border border-violet-400/15 bg-gradient-to-br from-violet-600/10 via-slate-950 to-cyan-500/10 px-6 py-16 shadow-[0_30px_100px_rgba(0,0,0,0.35)] sm:px-12">
          <div className="absolute left-1/2 top-0 h-40 w-80 -translate-x-1/2 rounded-full bg-violet-500/10 blur-[80px]" />

          <div className="relative">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-violet-300">
              The future of hiring
            </p>

            <h2 className="mx-auto mt-5 max-w-3xl text-4xl font-black leading-tight sm:text-6xl">
              Let intelligence handle the workflow.
              <span className="text-cyan-300">
                {" "}
                Keep humans in control.
              </span>
            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-slate-400">
              Experience a recruitment workflow built around
              AI intelligence, structured evaluation and human
              decision-making.
            </p>

            <div className="mt-9">
              <a
                href="/auth/register"
                className="inline-flex items-center gap-3 rounded-2xl bg-white px-7 py-4 font-black text-slate-950 transition hover:-translate-y-1 hover:bg-slate-100 hover:shadow-[0_15px_50px_rgba(255,255,255,0.15)]"
              >
                Launch PlacementOS
                <span>→</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          FOOTER
      ========================================================= */}

      <footer className="relative z-10 border-t border-white/5 px-6 py-8 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <div>
            <p className="font-black tracking-[0.16em]">
              PLACEMENT<span className="text-violet-400">OS</span>
            </p>

            <p className="mt-1 text-xs text-slate-600">
              AI-powered recruitment intelligence
            </p>
          </div>

          <p className="text-xs text-slate-600">
            Intelligent systems. Human decisions.
          </p>
        </div>
      </footer>

      {/* =========================================================
          ANIMATION
      ========================================================= */}

      <style jsx global>{`
        @keyframes spin {
          from {
            transform: translate(-50%, -50%) rotate(0deg);
          }

          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }
      `}</style>
    </main>
  );
} 