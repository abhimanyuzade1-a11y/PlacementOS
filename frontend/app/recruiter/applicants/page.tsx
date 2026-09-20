"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

type Applicant = {
  id: string;
  status: string;
  applied_at: string;
  resume_id: string | null;
  candidate_id: string;
  job_id: string;
  candidate_name: string;
  candidate_email: string;
  job_title: string;
  company_name: string;
  resume_file_name: string | null;
};

const stages = [
  "Applied",
  "AI Screening",
  "Shortlisted",
  "Interview",
  "Final Decision",
];

function getStageIndex(status: string) {
  switch (status) {
    case "applied":
      return 0;
    case "screening":
      return 1;
    case "shortlisted":
      return 2;
    case "interview":
      return 3;
    case "selected":
    case "rejected":
      return 4;
    default:
      return 0;
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "applied":
      return "Applied";
    case "screening":
      return "AI Screening";
    case "shortlisted":
      return "Shortlisted";
    case "assessment":
      return "Assessment";
    case "interview":
      return "Interview";
    case "selected":
      return "Selected";
    case "rejected":
      return "Rejected";
    default:
      return status;
  }
}

function getStatusClasses(status: string) {
  switch (status) {
    case "selected":
      return "bg-emerald-950 text-emerald-300 border border-emerald-800";

    case "rejected":
      return "bg-red-950 text-red-300 border border-red-800";

    case "interview":
      return "bg-violet-950 text-violet-300 border border-violet-800";

    case "shortlisted":
      return "bg-green-950 text-green-300 border border-green-800";

    case "screening":
      return "bg-purple-950 text-purple-300 border border-purple-800";

    default:
      return "bg-blue-950 text-blue-300 border border-blue-800";
  }
}

export default function ApplicantsPage() {
  const router = useRouter();

  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadApplicants();
  }, []);

  async function loadApplicants() {
    setLoading(true);
    setMessage("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth");
        return;
      }

      // Get recruiter's jobs
      const { data: jobs, error: jobsError } = await supabase
        .from("jobs")
        .select("id, title, company_name")
        .eq("recruiter_id", user.id);

      if (jobsError) {
        setMessage(jobsError.message);
        return;
      }

      if (!jobs || jobs.length === 0) {
        setApplicants([]);
        return;
      }

      const jobIds = jobs.map((job) => job.id);

      // Get applications
      const { data: applications, error: applicationsError } =
        await supabase
          .from("applications")
          .select(
            "id, job_id, candidate_id, resume_id, status, applied_at"
          )
          .in("job_id", jobIds)
          .order("applied_at", { ascending: false });

      if (applicationsError) {
        setMessage(applicationsError.message);
        return;
      }

      if (!applications || applications.length === 0) {
        setApplicants([]);
        return;
      }

      const candidateIds = applications.map(
        (application) => application.candidate_id
      );

      const resumeIds = applications
        .map((application) => application.resume_id)
        .filter(Boolean);

      // Get candidate profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", candidateIds);

      if (profilesError) {
        setMessage(profilesError.message);
        return;
      }

      // Get resumes
      let resumes: {
        id: string;
        file_name: string;
      }[] = [];

      if (resumeIds.length > 0) {
        const { data: resumeData, error: resumesError } = await supabase
          .from("resumes")
          .select("id, file_name")
          .in("id", resumeIds);

        if (resumesError) {
          setMessage(resumesError.message);
          return;
        }

        resumes = resumeData || [];
      }

      const finalApplicants: Applicant[] = applications.map(
        (application) => {
          const job = jobs.find(
            (item) => item.id === application.job_id
          );

          const profile = profiles?.find(
            (item) => item.id === application.candidate_id
          );

          const resume = resumes.find(
            (item) => item.id === application.resume_id
          );

          return {
            id: application.id,
            status: application.status,
            applied_at: application.applied_at,
            resume_id: application.resume_id,
            candidate_id: application.candidate_id,
            job_id: application.job_id,
            candidate_name:
              profile?.full_name || "Unknown Candidate",
            candidate_email:
              profile?.email || "No email",
            job_title:
              job?.title || "Unknown Job",
            company_name:
              job?.company_name || "",
            resume_file_name:
              resume?.file_name || null,
          };
        }
      );

      setApplicants(finalApplicants);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  function viewCandidate(application: Applicant) {
    router.push(
      `/recruiter/applicants/view?id=${application.id}`
    );
  }

  function openAIScreen(application: Applicant) {
    router.push(
      `/recruiter/applicants/ai?id=${application.id}`
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* HEADER */}
      <header className="border-b border-slate-800 bg-slate-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">

          <div>
            <h1 className="text-3xl font-bold">
              PlacementOS
            </h1>

            <p className="text-slate-400">
              Recruiter Portal
            </p>
          </div>

          <button
            onClick={() => router.push("/recruiter")}
            className="rounded-lg border border-slate-700 px-5 py-2 font-semibold hover:bg-slate-800"
          >
            Back to Dashboard
          </button>

        </div>
      </header>

      {/* CONTENT */}
      <section className="mx-auto max-w-6xl px-6 py-10">

        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">

          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-purple-400">
              Candidate Management
            </p>

            <h2 className="mt-2 text-4xl font-bold">
              Applicants
            </h2>

            <p className="mt-2 text-slate-400">
              Review candidates and track their progress through the hiring pipeline.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 px-5 py-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Total Applicants
            </p>

            <p className="mt-1 text-2xl font-bold">
              {applicants.length}
            </p>
          </div>

        </div>

        {/* MESSAGE */}
        {message && (
          <div className="mt-6 rounded-lg border border-red-800 bg-red-950 p-4 text-red-300">
            {message}
          </div>
        )}

        {/* LOADING */}
        {loading ? (
          <div className="mt-10 text-slate-400">
            Loading applicants...
          </div>
        ) : applicants.length === 0 ? (
          <div className="mt-10 rounded-xl border border-slate-800 bg-slate-900 p-8 text-slate-400">
            No applicants yet.
          </div>
        ) : (
          <div className="mt-8 space-y-6">

            {applicants.map((applicant) => {

              const currentStage = getStageIndex(
                applicant.status
              );

              const isSelected =
                applicant.status === "selected";

              const isRejected =
                applicant.status === "rejected";

              return (
                <div
                  key={applicant.id}
                  className={`rounded-2xl border bg-slate-900 p-7 ${
                    isSelected
                      ? "border-emerald-700"
                      : isRejected
                      ? "border-red-800"
                      : "border-slate-800"
                  }`}
                >

                  {/* CANDIDATE HEADER */}
                  <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">

                    <div>

                      <div className="flex flex-wrap items-center gap-3">

                        <h3 className="text-2xl font-bold">
                          {applicant.candidate_name}
                        </h3>

                        <span
                          className={`rounded-full px-3 py-1 text-sm font-semibold ${getStatusClasses(
                            applicant.status
                          )}`}
                        >
                          {getStatusLabel(applicant.status)}
                        </span>

                      </div>

                      <p className="mt-1 text-slate-400">
                        {applicant.candidate_email}
                      </p>

                      {isSelected && (
                        <p className="mt-3 font-semibold text-emerald-400">
                          ✓ Candidate selected
                        </p>
                      )}

                      {isRejected && (
                        <p className="mt-3 font-semibold text-red-400">
                          Candidate rejected
                        </p>
                      )}

                    </div>

                    <div className="text-left md:text-right">

                      <p className="text-sm text-slate-500">
                        Applied For
                      </p>

                      <p className="font-semibold">
                        {applicant.job_title}
                      </p>

                      <p className="text-slate-400">
                        {applicant.company_name}
                      </p>

                    </div>

                  </div>

                  {/* PIPELINE */}
                  <div className="mt-7 rounded-xl border border-slate-800 bg-slate-950 p-5">

                    <div className="mb-5 flex items-center justify-between">

                      <div>
                        <p className="text-sm font-semibold">
                          Hiring Progress
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Current stage:{" "}
                          <span className="text-slate-300">
                            {getStatusLabel(applicant.status)}
                          </span>
                        </p>
                      </div>

                      {isSelected && (
                        <span className="text-sm font-semibold text-emerald-400">
                          FINAL DECISION
                        </span>
                      )}

                    </div>

                    <div className="grid gap-3 md:grid-cols-5">

                      {stages.map((stage, index) => {

                        const completed =
                          index < currentStage;

                        const current =
                          index === currentStage;

                        return (
                          <div
                            key={stage}
                            className={`rounded-lg border p-3 ${
                              current
                                ? isSelected
                                  ? "border-emerald-600 bg-emerald-950/50"
                                  : "border-purple-600 bg-purple-950/50"
                                : completed
                                ? "border-slate-700 bg-slate-900"
                                : "border-slate-800 bg-slate-950"
                            }`}
                          >

                            <div className="flex items-center justify-between">

                              <span
                                className={`text-sm font-bold ${
                                  current
                                    ? isSelected
                                      ? "text-emerald-400"
                                      : "text-purple-400"
                                    : completed
                                    ? "text-slate-300"
                                    : "text-slate-600"
                                }`}
                              >
                                {index + 1}
                              </span>

                              {completed && (
                                <span className="text-green-400">
                                  ✓
                                </span>
                              )}

                              {current && !isSelected && (
                                <span className="text-purple-400">
                                  ●
                                </span>
                              )}

                              {current && isSelected && (
                                <span className="text-emerald-400">
                                  ✓
                                </span>
                              )}

                            </div>

                            <p
                              className={`mt-3 text-xs font-medium ${
                                current
                                  ? isSelected
                                    ? "text-emerald-300"
                                    : "text-purple-300"
                                  : completed
                                  ? "text-slate-300"
                                  : "text-slate-600"
                              }`}
                            >
                              {stage}
                            </p>

                          </div>
                        );
                      })}

                    </div>

                  </div>

                  {/* DETAILS */}
                  <div className="mt-6 grid gap-4 border-t border-slate-800 pt-6 md:grid-cols-2">

                    <div>
                      <p className="text-sm text-slate-500">
                        Resume
                      </p>

                      <p className="mt-1 font-medium">
                        📄{" "}
                        {applicant.resume_file_name ||
                          "No resume"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-500">
                        Applied On
                      </p>

                      <p className="mt-1 font-medium">
                        {new Date(
                          applicant.applied_at
                        ).toLocaleDateString("en-IN")}
                      </p>
                    </div>

                  </div>

                  {/* ACTIONS */}
                  <div className="mt-7 flex flex-wrap gap-3">

                    <button
                      onClick={() =>
                        viewCandidate(applicant)
                      }
                      className="rounded-lg bg-white px-5 py-3 font-semibold text-slate-950 hover:bg-slate-200"
                    >
                      View Candidate
                    </button>

                    <button
                      onClick={() =>
                        openAIScreen(applicant)
                      }
                      className="rounded-lg bg-purple-600 px-5 py-3 font-semibold text-white hover:bg-purple-500"
                    >
                      AI Candidate Intelligence
                    </button>

                  </div>

                </div>
              );
            })}

          </div>
        )}

      </section>
    </main>
  );
}