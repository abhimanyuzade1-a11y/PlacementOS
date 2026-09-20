"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Applicant = {
  id: string;
  candidate_id: string;
  job_id: string;
  resume_id: string | null;
  status: string;
  applied_at: string;
  candidate?: {
    full_name: string;
    email: string;
  };
  job?: {
    title: string;
    company_name: string;
    location: string | null;
  };
  resume?: {
    file_name: string;
    extracted_text: string | null;
  };
};

function ApplicantViewPage() {
  const searchParams = useSearchParams();
  const applicationId = searchParams.get("id");

  const [applicant, setApplicant] = useState<Applicant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadApplicant() {
      if (!applicationId) {
        setError("No application ID was provided.");
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from("applications")
          .select(`
            id,
            candidate_id,
            job_id,
            resume_id,
            status,
            applied_at,
            candidate:profiles!applications_candidate_id_fkey(
              full_name,
              email
            ),
            job:jobs!applications_job_id_fkey(
              title,
              company_name,
              location
            ),
            resume:resumes!applications_resume_id_fkey(
              file_name,
              extracted_text
            )
          `)
          .eq("id", applicationId)
          .single();

        if (fetchError) {
          throw fetchError;
        }

        setApplicant(data as unknown as Applicant);
      } catch (err) {
        console.error("Applicant loading error:", err);
        setError("Unable to load candidate details.");
      } finally {
        setLoading(false);
      }
    }

    loadApplicant();
  }, [applicationId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 p-10 text-white">
        <div className="mx-auto max-w-5xl">
          <p className="text-slate-400">Loading candidate profile...</p>
        </div>
      </main>
    );
  }

  if (error || !applicant) {
    return (
      <main className="min-h-screen bg-slate-950 p-10 text-white">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
            <h1 className="text-xl font-semibold">Candidate Profile</h1>
            <p className="mt-2 text-red-300">
              {error || "Candidate not found."}
            </p>
          </div>
        </div>
      </main>
    );
  }

  const candidate = Array.isArray(applicant.candidate)
    ? applicant.candidate[0]
    : applicant.candidate;

  const job = Array.isArray(applicant.job)
    ? applicant.job[0]
    : applicant.job;

  const resume = Array.isArray(applicant.resume)
    ? applicant.resume[0]
    : applicant.resume;

  const statusLabel =
    applicant.status.charAt(0).toUpperCase() +
    applicant.status.slice(1);

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <p className="text-sm font-medium text-blue-400">
            PLACEMENTOS
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Candidate Profile
          </h1>

          <p className="mt-2 text-slate-400">
            Review candidate information and application details.
          </p>
        </div>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold">
                {candidate?.full_name || "Candidate"}
              </h2>

              <p className="mt-2 text-slate-400">
                {candidate?.email || "No email available"}
              </p>
            </div>

            <div className="rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-300">
              {statusLabel}
            </div>
          </div>
        </section>

        <div className="grid gap-6 md:grid-cols-2">
          <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold">
              Applied Position
            </h2>

            <div className="mt-5 space-y-4">
              <div>
                <p className="text-sm text-slate-500">Job</p>
                <p className="mt-1 font-medium">
                  {job?.title || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Company</p>
                <p className="mt-1 font-medium">
                  {job?.company_name || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Location</p>
                <p className="mt-1 font-medium">
                  {job?.location || "Not specified"}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Applied On</p>
                <p className="mt-1 font-medium">
                  {new Date(applicant.applied_at).toLocaleDateString(
                    "en-IN"
                  )}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold">
              Resume
            </h2>

            <div className="mt-5">
              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
                <p className="font-medium">
                  {resume?.file_name || "Resume not available"}
                </p>

                <p className="mt-2 text-sm text-slate-400">
                  Resume uploaded by the candidate.
                </p>
              </div>
            </div>
          </section>
        </div>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold">
            Hiring Progress
          </h2>

          <div className="mt-6 grid gap-3 md:grid-cols-5">
            {[
              "Applied",
              "AI Screening",
              "Shortlisted",
              "Interview",
              "Final Decision",
            ].map((stage, index) => {
              const active =
                (applicant.status === "applied" && index === 0) ||
                (applicant.status === "screening" && index === 1) ||
                (applicant.status === "shortlisted" && index === 2) ||
                (applicant.status === "interview" && index === 3) ||
                (applicant.status === "selected" && index === 4);

              return (
                <div
                  key={stage}
                  className={`rounded-2xl border p-4 text-center ${
                    active
                      ? "border-blue-400/40 bg-blue-500/10 text-blue-300"
                      : "border-white/10 bg-slate-900/40 text-slate-500"
                  }`}
                >
                  <div className="text-sm font-semibold">
                    {index + 1}
                  </div>

                  <div className="mt-1 text-xs">
                    {stage}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-3xl border border-blue-400/20 bg-blue-500/5 p-6">
          <h2 className="text-lg font-semibold">
            AI Candidate Intelligence
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            AI screening, interview generation, and recruiter review
            are available from the AI Candidate Intelligence workspace.
          </p>

          <div className="mt-5">
            <a
              href={`/recruiter/applicants/ai?id=${applicant.id}`}
              className="inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              Open AI Candidate Intelligence
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function ApplicantViewPageWrapper() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-950 p-10 text-white">
          <p className="text-slate-400">
            Loading candidate profile...
          </p>
        </main>
      }
    >
      <ApplicantViewPage />
    </Suspense>
  );
}