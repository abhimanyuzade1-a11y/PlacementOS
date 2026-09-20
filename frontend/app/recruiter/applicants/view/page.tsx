"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabase";

export default function ViewCandidatePage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const applicationId = searchParams.get("id");

  const [candidate, setCandidate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (applicationId) {
      loadCandidate();
    }
  }, [applicationId]);

  async function loadCandidate() {
    try {
      const { data: application, error } = await supabase
        .from("applications")
        .select("id, candidate_id, resume_id, status, applied_at, job_id")
        .eq("id", applicationId)
        .single();

      if (error) {
        setMessage(error.message);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", application.candidate_id)
        .single();

      const { data: resume } = await supabase
        .from("resumes")
        .select("file_name, extracted_text")
        .eq("id", application.resume_id)
        .single();

      const { data: job } = await supabase
        .from("jobs")
        .select("title, company_name, description, required_skills")
        .eq("id", application.job_id)
        .single();

      setCandidate({
        application,
        profile,
        resume,
        job,
      });
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 p-10 text-white">
        Loading candidate...
      </main>
    );
  }

  if (!candidate) {
    return (
      <main className="min-h-screen bg-slate-950 p-10 text-white">
        <p className="text-red-400">{message || "Candidate not found."}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <button
          onClick={() => router.push("/recruiter/applicants")}
          className="mb-8 rounded-lg border border-slate-700 px-5 py-2 hover:bg-slate-800"
        >
          ← Back to Applicants
        </button>

        <h1 className="text-4xl font-bold">Candidate Profile</h1>

        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-7">
          <h2 className="text-3xl font-bold">
            {candidate.profile?.full_name}
          </h2>

          <p className="mt-2 text-slate-400">
            {candidate.profile?.email}
          </p>

          <div className="mt-6 border-t border-slate-800 pt-6">
            <p className="text-sm text-slate-500">Applied For</p>
            <p className="text-xl font-semibold">
              {candidate.job?.title}
            </p>
            <p className="text-slate-400">
              {candidate.job?.company_name}
            </p>
          </div>

          <div className="mt-6">
            <p className="text-sm text-slate-500">Application Status</p>
            <p className="mt-1 font-semibold text-blue-400">
              {candidate.application?.status}
            </p>
          </div>

          <div className="mt-6">
            <p className="text-sm text-slate-500">Resume</p>
            <p className="mt-1">
              📄 {candidate.resume?.file_name || "No resume"}
            </p>
          </div>

          <div className="mt-8">
            <p className="text-sm text-slate-500">Resume Content</p>

            <div className="mt-2 whitespace-pre-wrap rounded-xl bg-slate-950 p-5 text-sm leading-7 text-slate-300">
              {candidate.resume?.extracted_text ||
                "Resume text extraction is not available yet."}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}