"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type Application = {
  id: string;
  status: string;
  applied_at: string;

  interview_date: string | null;
  interview_time: string | null;
  interview_type: string | null;
  interview_location: string | null;
  interview_link: string | null;
  interview_message: string | null;

  jobs: {
    title: string;
    company_name: string;
    location: string | null;
  } | null;
};

const steps = [
  { key: "applied", label: "Applied" },
  { key: "screening", label: "AI Screening" },
  { key: "shortlisted", label: "Shortlisted" },
  { key: "interview", label: "Interview" },
  { key: "selected", label: "Final Decision" },
];

function getStepIndex(status: string) {
  if (status === "rejected") return -1;

  const index = steps.findIndex((step) => step.key === status);

  if (index >= 0) return index;

  if (status === "assessment") return 2;

  return 0;
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    applied: "Application Submitted",
    screening: "AI Screening",
    shortlisted: "Shortlisted",
    assessment: "Assessment",
    interview: "Interview",
    selected: "Selected",
    rejected: "Not Selected",
  };

  return labels[status] || status;
}

function formatInterviewDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatInterviewTime(time: string) {
  const [hours, minutes] = time.split(":");
  const date = new Date();

  date.setHours(Number(hours), Number(minutes), 0, 0);

  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function CandidatePortal() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [candidateName, setCandidateName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadApplications();
  }, []);

  async function loadApplications() {
    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Please log in again.");
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      if (profile) {
        setCandidateName(profile.full_name);
      }

      const { data, error: applicationError } = await supabase
        .from("applications")
        .select(
          `
          id,
          status,
          applied_at,
          interview_date,
          interview_time,
          interview_type,
          interview_location,
          interview_link,
          interview_message,
          jobs (
            title,
            company_name,
            location
          )
        `
        )
        .eq("candidate_id", user.id)
        .order("applied_at", { ascending: false });

      if (applicationError) {
        throw new Error(applicationError.message);
      }

      setApplications((data as unknown as Application[]) || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not load your applications."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">

        {/* Header */}
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-medium text-purple-400">
              PLACEMENTOS
            </p>

            <h1 className="mt-2 text-4xl font-bold">
              Candidate Portal
            </h1>

            <p className="mt-2 text-slate-400">
              Welcome back, {candidateName || "Candidate"}.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() =>
                (window.location.href = "/candidate/jobs")
              }
              className="rounded-lg border border-slate-700 px-5 py-3 font-semibold hover:bg-slate-800"
            >
              Browse Jobs
            </button>

            <button
              onClick={() =>
                (window.location.href = "/candidate/resume")
              }
              className="rounded-lg bg-purple-600 px-5 py-3 font-semibold hover:bg-purple-500"
            >
              Manage Resume
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-8 rounded-xl border border-red-800 bg-red-950 p-5 text-red-300">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-8">
            <p className="text-slate-400">
              Loading your applications...
            </p>
          </div>
        ) : applications.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">
            <div className="text-5xl">📋</div>

            <h2 className="mt-5 text-2xl font-bold">
              No applications yet
            </h2>

            <p className="mt-2 text-slate-400">
              Browse available jobs and apply to start your hiring journey.
            </p>

            <button
              onClick={() =>
                (window.location.href = "/candidate/jobs")
              }
              className="mt-6 rounded-lg bg-purple-600 px-6 py-3 font-semibold hover:bg-purple-500"
            >
              Browse Jobs
            </button>
          </div>
        ) : (
          <div className="mt-10 space-y-6">

            <div>
              <h2 className="text-2xl font-bold">
                My Applications
              </h2>

              <p className="mt-1 text-slate-400">
                Track your progress through the hiring process.
              </p>
            </div>

            {applications.map((application) => {
              const job = application.jobs;
              const currentStep = getStepIndex(application.status);
              const rejected = application.status === "rejected";

              const interviewScheduled =
                Boolean(application.interview_date) &&
                Boolean(application.interview_time);

              return (
                <div
                  key={application.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900 p-7"
                >

                  {/* Job header */}
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">

                    <div>
                      <h3 className="text-2xl font-bold">
                        {job?.title || "Job"}
                      </h3>

                      <p className="mt-1 text-lg text-slate-300">
                        {job?.company_name || "Company"}
                      </p>

                      {job?.location && (
                        <p className="mt-2 text-sm text-slate-500">
                          📍 {job.location}
                        </p>
                      )}
                    </div>

                    <div className="text-left md:text-right">
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Current Status
                      </p>

                      <span
                        className={`mt-2 inline-block rounded-full px-4 py-2 text-sm font-semibold ${
                          rejected
                            ? "bg-red-950 text-red-300"
                            : application.status === "selected"
                            ? "bg-green-950 text-green-300"
                            : "bg-purple-950 text-purple-300"
                        }`}
                      >
                        {getStatusLabel(application.status)}
                      </span>
                    </div>

                  </div>

                  {/* Interview Invitation */}
                  {interviewScheduled && (
                    <div className="mt-8 overflow-hidden rounded-2xl border border-green-800 bg-green-950/30">

                      <div className="border-b border-green-900 bg-green-950/50 px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-600 text-xl">
                            📅
                          </div>

                          <div>
                            <h3 className="text-xl font-bold text-green-300">
                              Interview Invitation
                            </h3>

                            <p className="text-sm text-green-200/70">
                              You have been invited for an interview.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-5 p-6 md:grid-cols-2">

                        {/* Date */}
                        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                          <p className="text-xs uppercase tracking-wide text-slate-500">
                            Interview Date
                          </p>

                          <p className="mt-2 font-semibold text-white">
                            {formatInterviewDate(
                              application.interview_date!
                            )}
                          </p>
                        </div>

                        {/* Time */}
                        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                          <p className="text-xs uppercase tracking-wide text-slate-500">
                            Interview Time
                          </p>

                          <p className="mt-2 font-semibold text-white">
                            {formatInterviewTime(
                              application.interview_time!
                            )}
                          </p>
                        </div>

                        {/* Type */}
                        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                          <p className="text-xs uppercase tracking-wide text-slate-500">
                            Interview Type
                          </p>

                          <p className="mt-2 font-semibold text-white">
                            {application.interview_type ||
                              "Personal Interview"}
                          </p>
                        </div>

                        {/* Location */}
                        {application.interview_location && (
                          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                            <p className="text-xs uppercase tracking-wide text-slate-500">
                              Location
                            </p>

                            <p className="mt-2 font-semibold text-white">
                              📍 {application.interview_location}
                            </p>
                          </div>
                        )}

                      </div>

                      {/* Online meeting link */}
                      {application.interview_link && (
                        <div className="px-6 pb-6">
                          <a
                            href={application.interview_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex rounded-lg bg-purple-600 px-5 py-3 font-semibold hover:bg-purple-500"
                          >
                            🔗 Join Interview
                          </a>
                        </div>
                      )}

                      {/* Recruiter message */}
                      {application.interview_message && (
                        <div className="border-t border-green-900 px-6 py-5">
                          <p className="text-xs uppercase tracking-wide text-slate-500">
                            Message from Recruiter
                          </p>

                          <p className="mt-2 text-slate-300">
                            {application.interview_message}
                          </p>
                        </div>
                      )}

                      <div className="border-t border-green-900 bg-slate-950/50 px-6 py-4">
                        <p className="text-sm text-slate-400">
                          Please arrive or join a few minutes before your
                          scheduled interview time.
                        </p>
                      </div>

                    </div>
                  )}

                  {/* Rejected */}
                  {rejected ? (
                    <div className="mt-8 rounded-xl border border-red-900 bg-red-950/40 p-5">
                      <p className="font-semibold text-red-300">
                        Application Closed
                      </p>

                      <p className="mt-1 text-sm text-red-200/70">
                        This application is no longer active.
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Progress */}
                      <div className="mt-10">

                        <div className="flex items-center">

                          {steps.map((step, index) => {
                            const completed = index <= currentStep;
                            const active = index === currentStep;

                            return (
                              <div
                                key={step.key}
                                className="flex flex-1 items-center"
                              >

                                <div className="flex flex-col items-center">

                                  <div
                                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold ${
                                      completed
                                        ? "border-purple-500 bg-purple-600 text-white"
                                        : "border-slate-700 bg-slate-950 text-slate-600"
                                    }`}
                                  >
                                    {completed ? "✓" : index + 1}
                                  </div>

                                  <p
                                    className={`mt-3 whitespace-nowrap text-xs font-medium ${
                                      active
                                        ? "text-purple-300"
                                        : completed
                                        ? "text-slate-300"
                                        : "text-slate-600"
                                    }`}
                                  >
                                    {step.label}
                                  </p>

                                </div>

                                {index < steps.length - 1 && (
                                  <div
                                    className={`mx-2 h-0.5 flex-1 ${
                                      index < currentStep
                                        ? "bg-purple-600"
                                        : "bg-slate-800"
                                    }`}
                                  />
                                )}

                              </div>
                            );
                          })}

                        </div>

                      </div>

                      {/* Status explanation */}
                      <div className="mt-10 rounded-xl border border-slate-800 bg-slate-950 p-5">

                        <p className="font-semibold">
                          {application.status === "interview"
                            ? "🎉 You have reached the interview stage!"
                            : application.status === "shortlisted"
                            ? "🎯 Your application has been shortlisted."
                            : application.status === "screening"
                            ? "🤖 Your resume is being reviewed by PlacementOS AI."
                            : application.status === "selected"
                            ? "🎉 Congratulations! You have been selected."
                            : "✓ Your application has been submitted successfully."}
                        </p>

                        <p className="mt-2 text-sm text-slate-400">
                          Applied on{" "}
                          {new Date(
                            application.applied_at
                          ).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>

                      </div>
                    </>
                  )}

                </div>
              );
            })}

          </div>
        )}

      </div>
    </main>
  );
}