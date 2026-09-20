"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type Job = {
  id: string;
  title: string;
  company_name: string;
  location: string | null;
  status: string;
  created_at: string;
};

type Application = {
  id: string;
  job_id: string;
  status: string;
};

export default function RecruiterDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [recruiterName, setRecruiterName] = useState("");
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/auth";
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      if (profileError) {
        throw new Error(profileError.message);
      }

      setRecruiterName(profile?.full_name || "Recruiter");

      const { data: jobsData, error: jobsError } = await supabase
        .from("jobs")
        .select(
          "id, title, company_name, location, status, created_at"
        )
        .eq("recruiter_id", user.id)
        .order("created_at", { ascending: false });

      if (jobsError) {
        throw new Error(jobsError.message);
      }

      const loadedJobs = jobsData || [];
      setJobs(loadedJobs);

      if (loadedJobs.length > 0) {
        const jobIds = loadedJobs.map((job) => job.id);

        const {
          data: applicationData,
          error: applicationError,
        } = await supabase
          .from("applications")
          .select("id, job_id, status")
          .in("job_id", jobIds);

        if (applicationError) {
          throw new Error(applicationError.message);
        }

        setApplications(applicationData || []);
      } else {
        setApplications([]);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not load recruiter dashboard."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    setSigningOut(true);

    const { error } = await supabase.auth.signOut();

    if (error) {
      setError(error.message);
      setSigningOut(false);
      return;
    }

    window.location.href = "/auth";
  }

  const totalApplications = applications.length;

  const shortlisted = applications.filter(
    (application) => application.status === "shortlisted"
  ).length;

  const interviews = applications.filter(
    (application) => application.status === "interview"
  ).length;

  const selected = applications.filter(
    (application) => application.status === "selected"
  ).length;

  const rejected = applications.filter(
    (application) => application.status === "rejected"
  ).length;

  const activeJobs = jobs.filter(
    (job) => job.status === "open"
  ).length;

  const screening = applications.filter(
    (application) => application.status === "screening"
  ).length;

  const applied = applications.filter(
    (application) => application.status === "applied"
  ).length;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020617] text-white">

      {/* =====================================================
          ANIMATED BACKGROUND
      ====================================================== */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">

        <div className="absolute -left-40 -top-40 h-[650px] w-[650px] rounded-full bg-violet-700/15 blur-[140px]" />

        <div className="absolute right-[-250px] top-[100px] h-[650px] w-[650px] rounded-full bg-cyan-500/10 blur-[150px]" />

        <div className="absolute bottom-[-300px] left-[30%] h-[650px] w-[650px] rounded-full bg-indigo-600/10 blur-[150px]" />

        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.7) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      {/* =====================================================
          NAVBAR
      ====================================================== */}

      <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#020617]/75 backdrop-blur-2xl">

        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-6 py-4">

          {/* LOGO */}

          <button
            onClick={() => (window.location.href = "/recruiter")}
            className="group flex items-center gap-3"
          >

            <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-violet-400/30 bg-gradient-to-br from-violet-600/30 to-cyan-400/20 shadow-[0_0_35px_rgba(124,58,237,.25)] transition duration-300 group-hover:scale-105">

              <div className="absolute inset-1 rounded-xl border border-white/10" />

              <span className="relative text-xl font-black">
                P
              </span>

              <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(103,232,249,1)]" />

            </div>

            <div className="hidden sm:block">

              <p className="text-base font-black tracking-[0.18em]">
                PLACEMENT
                <span className="text-violet-400">
                  OS
                </span>
              </p>

              <p className="text-[8px] uppercase tracking-[0.28em] text-slate-600">
                AI Hiring Intelligence
              </p>

            </div>

          </button>

          {/* RIGHT NAV */}

          <div className="flex items-center gap-3">

            <div className="hidden items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-4 py-2 sm:flex">

              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,1)]" />

              <span className="text-[10px] font-bold uppercase tracking-[.16em] text-emerald-300">
                AI Online
              </span>

            </div>

            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-slate-400 transition hover:border-red-400/30 hover:bg-red-500/5 hover:text-red-300 disabled:opacity-50"
            >
              {signingOut ? "Signing out..." : "Sign Out"}
            </button>

          </div>

        </div>

      </nav>

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <div className="relative z-10 mx-auto max-w-[1500px] px-6 py-8 lg:px-10">

        {/* HEADER */}

        <section className="relative overflow-hidden rounded-[32px] border border-white/[0.08] bg-gradient-to-br from-violet-600/[0.12] via-[#070b19]/90 to-cyan-500/[0.06] p-7 shadow-[0_30px_100px_rgba(0,0,0,.35)] md:p-10">

          {/* decorative circles */}

          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full border border-violet-400/10" />

          <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full border border-cyan-400/10" />

          <div className="absolute right-16 top-14 h-2 w-2 animate-pulse rounded-full bg-cyan-300 shadow-[0_0_20px_cyan]" />

          <div className="relative">

            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/5 px-4 py-2">

              <span className="h-2 w-2 rounded-full bg-violet-400 shadow-[0_0_12px_rgba(167,139,250,1)]" />

              <span className="text-[10px] font-bold uppercase tracking-[.22em] text-violet-300">
                Recruiter Control Center
              </span>

            </div>

            <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-end">

              <div>

                <h1 className="text-4xl font-black tracking-[-.04em] sm:text-5xl">

                  Welcome back,

                  <br />

                  <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">
                    {recruiterName || "Recruiter"}.
                  </span>

                </h1>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">
                  Your AI hiring workspace is ready. Monitor candidates,
                  review intelligence, manage interviews and make final
                  hiring decisions from one place.
                </p>

              </div>

              <div className="flex flex-wrap gap-3">

                <button
                  onClick={() =>
                    (window.location.href =
                      "/recruiter/jobs/create")
                  }
                  className="group rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3.5 font-bold shadow-[0_12px_35px_rgba(124,58,237,.3)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(124,58,237,.45)]"
                >
                  + Create Job
                  <span className="ml-2 transition group-hover:translate-x-1">
                    →
                  </span>
                </button>

                <button
                  onClick={() =>
                    (window.location.href =
                      "/recruiter/applicants")
                  }
                  className="rounded-2xl border border-white/10 bg-white/[.04] px-6 py-3.5 font-bold text-slate-300 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[.07] hover:text-white"
                >
                  View Applicants
                </button>

              </div>

            </div>

          </div>

        </section>

        {/* ERROR */}

        {error && (
          <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-500/5 p-5 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* =====================================================
            LOADING
        ====================================================== */}

        {loading ? (

          <div className="mt-8 flex min-h-[350px] items-center justify-center rounded-[30px] border border-white/[0.06] bg-white/[0.02]">

            <div className="text-center">

              <div className="mx-auto h-14 w-14 animate-spin rounded-full border-2 border-violet-500/20 border-t-violet-400" />

              <p className="mt-5 text-sm text-slate-500">
                Initializing AI hiring workspace...
              </p>

            </div>

          </div>

        ) : (

          <>

            {/* =================================================
                STAT CARDS
            ================================================== */}

            <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

              <StatCard
                label="Active Jobs"
                value={activeJobs}
                color="violet"
                icon="◈"
              />

              <StatCard
                label="Applications"
                value={totalApplications}
                color="cyan"
                icon="◎"
              />

              <StatCard
                label="Shortlisted"
                value={shortlisted}
                color="fuchsia"
                icon="✦"
              />

              <StatCard
                label="Interviews"
                value={interviews}
                color="indigo"
                icon="◉"
              />

              <StatCard
                label="Selected"
                value={selected}
                color="emerald"
                icon="✓"
              />

            </section>

            {/* =================================================
                3D AI CORE
            ================================================== */}

            <section className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_.8fr]">

              {/* AI CORE */}

              <div className="relative min-h-[430px] overflow-hidden rounded-[32px] border border-white/[0.08] bg-[#050816]">

                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(124,58,237,.12),transparent_45%)]" />

                {/* rings */}

                <div className="absolute left-1/2 top-1/2 h-[330px] w-[330px] -translate-x-1/2 -translate-y-1/2 animate-[spin_24s_linear_infinite] rounded-full border border-violet-400/10">

                  <span className="absolute left-1/2 top-[-5px] h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_20px_cyan]" />

                </div>

                <div className="absolute left-1/2 top-1/2 h-[250px] w-[420px] -translate-x-1/2 -translate-y-1/2 rotate-45 animate-[spin_18s_linear_infinite_reverse] rounded-full border border-cyan-400/10" />

                <div className="absolute left-1/2 top-1/2 h-[230px] w-[230px] -translate-x-1/2 -translate-y-1/2 animate-[spin_16s_linear_infinite] rounded-full border border-fuchsia-400/10" />

                {/* core */}

                <div className="absolute left-1/2 top-1/2 flex h-36 w-36 -translate-x-1/2 -translate-y-1/2 items-center justify-center">

                  <div className="absolute inset-[-25px] animate-pulse rounded-full bg-violet-600/10 blur-2xl" />

                  <div className="absolute inset-0 rounded-full border border-violet-300/30 bg-gradient-to-br from-violet-600/50 via-indigo-700/40 to-cyan-400/30 shadow-[0_0_70px_rgba(124,58,237,.4)] backdrop-blur-xl" />

                  <div className="absolute inset-5 rounded-full border border-white/10 bg-gradient-to-br from-violet-500 to-cyan-400 shadow-[0_0_45px_rgba(99,102,241,.5)]" />

                  <span className="relative z-10 text-5xl font-black">
                    P
                  </span>

                </div>

                {/* floating agents */}

                <AgentNode
                  className="left-[8%] top-[18%]"
                  number="01"
                  name="Resume Intelligence"
                />

                <AgentNode
                  className="right-[7%] top-[20%]"
                  number="02"
                  name="Candidate Matching"
                />

                <AgentNode
                  className="bottom-[16%] left-[9%]"
                  number="03"
                  name="Interview Intelligence"
                />

                <AgentNode
                  className="bottom-[17%] right-[7%]"
                  number="04"
                  name="Scheduling Agent"
                />

                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-center">

                  <p className="text-[10px] font-bold uppercase tracking-[.25em] text-emerald-300">
                    ● Agent Core Active
                  </p>

                </div>

              </div>

              {/* AGENT ACTIVITY */}

              <div className="rounded-[32px] border border-white/[0.08] bg-white/[0.025] p-7 backdrop-blur-xl">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-[10px] font-bold uppercase tracking-[.2em] text-violet-300">
                      Live Intelligence
                    </p>

                    <h2 className="mt-2 text-2xl font-black">
                      Agent Activity
                    </h2>

                  </div>

                  <span className="h-3 w-3 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,1)]" />

                </div>

                <div className="mt-7 space-y-4">

                  <Activity
                    number="01"
                    title="Resume Intelligence"
                    text={`${totalApplications} candidate records available`}
                    active
                  />

                  <Activity
                    number="02"
                    title="Candidate Matching"
                    text="Comparing skills with job requirements"
                  />

                  <Activity
                    number="03"
                    title="Interview Intelligence"
                    text={`${interviews} interview stage candidate${interviews === 1 ? "" : "s"}`}
                  />

                  <Activity
                    number="04"
                    title="Recruiter Decision"
                    text={`${selected} final selection${selected === 1 ? "" : "s"} confirmed`}
                  />

                </div>

              </div>

            </section>

            {/* =================================================
                FINAL DECISION
            ================================================== */}

            {selected > 0 && (

              <section className="relative mt-8 overflow-hidden rounded-[30px] border border-emerald-400/20 bg-emerald-500/[0.05] p-7">

                <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-emerald-500/10 blur-3xl" />

                <div className="relative flex flex-col justify-between gap-5 md:flex-row md:items-center">

                  <div>

                    <div className="flex items-center gap-3">

                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                        ✓
                      </span>

                      <p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-400">
                        Hiring Decision Completed
                      </p>

                    </div>

                    <h2 className="mt-4 text-2xl font-black">
                      {selected} candidate
                      {selected !== 1 ? "s have" : " has"} been selected
                    </h2>

                    <p className="mt-2 text-sm text-emerald-200/60">
                      Final selection was confirmed by the recruiter.
                    </p>

                  </div>

                  <button
                    onClick={() =>
                      (window.location.href =
                        "/recruiter/applicants")
                    }
                    className="rounded-2xl bg-emerald-500 px-6 py-3 font-bold text-slate-950 transition hover:-translate-y-1 hover:bg-emerald-400"
                  >
                    View Selected Candidate →
                  </button>

                </div>

              </section>

            )}

            {/* =================================================
                PIPELINE
            ================================================== */}

            <section className="mt-8 rounded-[30px] border border-white/[0.08] bg-white/[0.025] p-7 backdrop-blur-xl">

              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">

                <div>

                  <p className="text-[10px] font-bold uppercase tracking-[.2em] text-cyan-300">
                    Recruitment Flow
                  </p>

                  <h2 className="mt-2 text-2xl font-black">
                    Hiring Pipeline
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Track candidates through the recruitment journey.
                  </p>

                </div>

                <p className="text-sm text-slate-600">
                  {rejected} rejected
                </p>

              </div>

              <div className="mt-7 grid gap-4 md:grid-cols-5">

                <PipelineCard
                  label="Applied"
                  count={applied}
                  icon="01"
                />

                <PipelineCard
                  label="AI Screening"
                  count={screening}
                  icon="02"
                />

                <PipelineCard
                  label="Shortlisted"
                  count={shortlisted}
                  icon="03"
                />

                <PipelineCard
                  label="Interview"
                  count={interviews}
                  icon="04"
                />

                <PipelineCard
                  label="Selected"
                  count={selected}
                  icon="05"
                  highlight={selected > 0}
                />

              </div>

            </section>

            {/* =================================================
                JOBS
            ================================================== */}

            <section className="mt-8">

              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

                <div>

                  <p className="text-[10px] font-bold uppercase tracking-[.2em] text-violet-300">
                    Recruitment Workspace
                  </p>

                  <h2 className="mt-2 text-2xl font-black">
                    Your Jobs
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Jobs and candidate activity managed by you.
                  </p>

                </div>

                <button
                  onClick={() =>
                    (window.location.href =
                      "/recruiter/jobs/create")
                  }
                  className="rounded-xl border border-violet-400/20 bg-violet-500/5 px-4 py-2 text-sm font-bold text-violet-300 transition hover:bg-violet-500/10"
                >
                  + New Job
                </button>

              </div>

              {jobs.length === 0 ? (

                <div className="mt-6 rounded-[30px] border border-white/[0.08] bg-white/[0.025] p-12 text-center">

                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-violet-400/20 bg-violet-500/10 text-3xl">
                    ◈
                  </div>

                  <h3 className="mt-5 text-xl font-black">
                    No jobs created yet
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                    Create your first job to start receiving and
                    analyzing candidates.
                  </p>

                  <button
                    onClick={() =>
                      (window.location.href =
                        "/recruiter/jobs/create")
                    }
                    className="mt-6 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3 font-bold shadow-lg shadow-violet-900/20 transition hover:-translate-y-1"
                  >
                    Create Job →
                  </button>

                </div>

              ) : (

                <div className="mt-6 space-y-5">

                  {jobs.map((job) => {

                    const jobApplications =
                      applications.filter(
                        (application) =>
                          application.job_id === job.id
                      );

                    const jobInterviews =
                      jobApplications.filter(
                        (application) =>
                          application.status === "interview"
                      ).length;

                    const jobShortlisted =
                      jobApplications.filter(
                        (application) =>
                          application.status === "shortlisted"
                      ).length;

                    const jobSelected =
                      jobApplications.filter(
                        (application) =>
                          application.status === "selected"
                      ).length;

                    return (

                      <div
                        key={job.id}
                        className="group relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-white/[0.025] p-6 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-violet-400/20 hover:bg-white/[0.04]"
                      >

                        <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-violet-600/5 blur-3xl transition group-hover:bg-violet-600/10" />

                        <div className="relative flex flex-col justify-between gap-7 xl:flex-row xl:items-center">

                          <div>

                            <div className="flex flex-wrap items-center gap-3">

                              <h3 className="text-xl font-black">
                                {job.title}
                              </h3>

                              <span
                                className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                                  job.status === "open"
                                    ? "border border-emerald-400/20 bg-emerald-400/5 text-emerald-300"
                                    : job.status === "closed"
                                    ? "border border-red-400/20 bg-red-400/5 text-red-300"
                                    : "border border-white/10 bg-white/5 text-slate-400"
                                }`}
                              >
                                {job.status}
                              </span>

                            </div>

                            <p className="mt-2 text-sm font-medium text-slate-300">
                              {job.company_name}
                            </p>

                            {job.location && (
                              <p className="mt-2 text-xs text-slate-600">
                                ◉ {job.location}
                              </p>
                            )}

                          </div>

                          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">

                            <MiniStat
                              value={jobApplications.length}
                              label="Applicants"
                            />

                            <MiniStat
                              value={jobShortlisted}
                              label="Shortlisted"
                              color="text-fuchsia-300"
                            />

                            <MiniStat
                              value={jobInterviews}
                              label="Interviews"
                              color="text-violet-300"
                            />

                            <MiniStat
                              value={jobSelected}
                              label="Selected"
                              color="text-emerald-300"
                            />

                          </div>

                        </div>

                        <div className="relative mt-6 border-t border-white/[0.06] pt-5">

                          <button
                            onClick={() =>
                              (window.location.href =
                                "/recruiter/applicants")
                            }
                            className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-2.5 text-sm font-bold text-slate-400 transition hover:border-violet-400/20 hover:bg-violet-500/5 hover:text-white"
                          >
                            View Applicants →
                          </button>

                        </div>

                      </div>

                    );
                  })}

                </div>

              )}

            </section>

          </>

        )}

      </div>

    </main>
  );
}

/* ============================================================
   STAT CARD
============================================================ */

function StatCard({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: number;
  color: string;
  icon: string;
}) {
  const colors: Record<string, string> = {
    violet: "text-violet-300",
    cyan: "text-cyan-300",
    fuchsia: "text-fuchsia-300",
    indigo: "text-indigo-300",
    emerald: "text-emerald-300",
  };

  return (
    <div className="group relative overflow-hidden rounded-[24px] border border-white/[0.08] bg-white/[0.025] p-5 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-white/[0.15]">

      <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-violet-500/5 blur-2xl transition group-hover:bg-violet-500/10" />

      <div className="relative">

        <div className="flex items-center justify-between">

          <span className="text-xl text-slate-600">
            {icon}
          </span>

          <span className={`text-3xl font-black ${colors[color]}`}>
            {value}
          </span>

        </div>

        <p className="mt-4 text-xs font-bold uppercase tracking-[.12em] text-slate-600">
          {label}
        </p>

      </div>

    </div>
  );
}

/* ============================================================
   AGENT NODE
============================================================ */

function AgentNode({
  className,
  number,
  name,
}: {
  className: string;
  number: string;
  name: string;
}) {
  return (
    <div
      className={`absolute ${className} hidden animate-[bounce_5s_ease-in-out_infinite] rounded-2xl border border-white/10 bg-[#070b19]/80 px-4 py-3 shadow-[0_15px_40px_rgba(0,0,0,.3)] backdrop-blur-xl sm:block`}
    >

      <p className="text-[8px] font-bold uppercase tracking-[.18em] text-violet-300">
        Agent {number}
      </p>

      <p className="mt-1 text-xs font-bold text-slate-200">
        {name}
      </p>

      <div className="mt-2 flex items-center gap-2">

        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300" />

        <span className="text-[8px] uppercase tracking-wider text-slate-600">
          Active
        </span>

      </div>

    </div>
  );
}

/* ============================================================
   ACTIVITY
============================================================ */

function Activity({
  number,
  title,
  text,
  active = false,
}: {
  number: string;
  title: string;
  text: string;
  active?: boolean;
}) {
  return (
    <div className="flex gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 transition hover:border-violet-400/20 hover:bg-violet-500/[0.03]">

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-[10px] font-black text-violet-300">
        {number}
      </div>

      <div className="min-w-0">

        <div className="flex items-center gap-2">

          <p className="text-sm font-bold">
            {title}
          </p>

          {active && (
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          )}

        </div>

        <p className="mt-1 text-xs text-slate-600">
          {text}
        </p>

      </div>

    </div>
  );
}

/* ============================================================
   PIPELINE CARD
============================================================ */

function PipelineCard({
  label,
  count,
  icon,
  highlight = false,
}: {
  label: string;
  count: number;
  icon: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border p-5 transition duration-300 hover:-translate-y-1 ${
        highlight
          ? "border-emerald-400/20 bg-emerald-500/[0.06]"
          : "border-white/[0.06] bg-white/[0.02] hover:border-violet-400/20"
      }`}
    >

      <div className="flex items-center justify-between">

        <span
          className={`text-[10px] font-black ${
            highlight
              ? "text-emerald-300"
              : "text-violet-300"
          }`}
        >
          {icon}
        </span>

        <span
          className={`text-3xl font-black ${
            highlight
              ? "text-emerald-300"
              : "text-white"
          }`}
        >
          {count}
        </span>

      </div>

      <p className="mt-5 text-xs font-bold uppercase tracking-[.1em] text-slate-600">
        {label}
      </p>

    </div>
  );
}

/* ============================================================
   MINI STAT
============================================================ */

function MiniStat({
  value,
  label,
  color = "text-white",
}: {
  value: number;
  label: string;
  color?: string;
}) {
  return (
    <div className="min-w-[90px] rounded-2xl border border-white/[0.06] bg-black/10 px-4 py-3 text-center">

      <p className={`text-2xl font-black ${color}`}>
        {value}
      </p>

      <p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-slate-600">
        {label}
      </p>

    </div>
  );
}