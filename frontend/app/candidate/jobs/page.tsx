"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

type Job = {
  id: string;
  title: string;
  company_name: string;
  description: string;
  required_skills: string[];
  experience_required: string | null;
  qualification: string | null;
  positions: number;
  location: string | null;
};

export default function JobsPage() {
  const router = useRouter();

  const [jobs, setJobs] = useState<Job[]>([]);
const [loading, setLoading] = useState(true);
const [message, setMessage] = useState("");
const [userId, setUserId] = useState<string | null>(null);
const [resumeId, setResumeId] = useState<string | null>(null);
const [applyingJobId, setApplyingJobId] = useState<string | null>(null);
  useEffect(() => {
    async function loadJobs() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth");
        return;
      }
setUserId(user.id);

const { data: resume } = await supabase
  .from("resumes")
  .select("id")
  .eq("candidate_id", user.id)
  .order("created_at", { ascending: false })
  .limit(1)
  .maybeSingle();

if (resume) {
  setResumeId(resume.id);
}
      const { data, error } = await supabase
        .from("jobs")
        .select(
          "id, title, company_name, description, required_skills, experience_required, qualification, positions, location"
        )
        .eq("status", "open")
        .order("created_at", { ascending: false });

      if (error) {
        setMessage(`Could not load jobs: ${error.message}`);
      } else {
        setJobs(data || []);
      }

      setLoading(false);
    }

    loadJobs();
  }, [router]);
async function handleApply(jobId: string) {
  if (!userId) {
    setMessage("Please log in first.");
    return;
  }

  if (!resumeId) {
    setMessage("Please upload your resume before applying.");
    return;
  }

  setApplyingJobId(jobId);
  setMessage("");

  const { error } = await supabase
    .from("applications")
    .insert({
      job_id: jobId,
      candidate_id: userId,
      resume_id: resumeId,
      status: "applied",
    });

  if (error) {
    if (error.code === "23505") {
      setMessage("You have already applied to this job.");
    } else {
      setMessage(`Application failed: ${error.message}`);
    }
  } else {
    setMessage("Application submitted successfully!");
  }

  setApplyingJobId(null);
}
  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Loading jobs...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">PlacementOS</h1>
            <p className="text-sm text-slate-400">Available Jobs</p>
          </div>

          <button
            onClick={() => router.push("/candidate")}
            className="rounded-lg border border-slate-700 px-4 py-2 hover:bg-slate-800"
          >
            Back to Dashboard
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h2 className="text-3xl font-bold">Available Jobs</h2>

          <p className="mt-2 text-slate-400">
            Browse jobs posted by recruiters and apply using your profile and
            resume.
          </p>
        </div>

        {message && (
          <div className="rounded-lg border border-red-800 bg-red-950/30 p-4 mb-6">
            {message}
          </div>
        )}

        {jobs.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
            <h3 className="text-xl font-semibold">No jobs available</h3>
            <p className="mt-2 text-slate-400">
              Recruiters have not posted any open jobs yet.
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-bold">{job.title}</h3>

                    <p className="mt-1 text-slate-300">
                      {job.company_name}
                    </p>

                    {job.location && (
                      <p className="mt-2 text-sm text-slate-500">
                        📍 {job.location}
                      </p>
                    )}
                  </div>

                  <div className="rounded-lg bg-slate-800 px-4 py-2 text-sm">
                    {job.positions} position
                    {job.positions !== 1 ? "s" : ""}
                  </div>
                </div>

                <p className="mt-5 text-slate-400">
                  {job.description}
                </p>

                {job.required_skills?.length > 0 && (
                  <div className="mt-5">
                    <p className="text-sm font-semibold text-slate-300 mb-2">
                      Required Skills
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {job.required_skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-300"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-6 grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500">Experience: </span>
                    <span className="text-slate-300">
                      {job.experience_required || "Not specified"}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500">Qualification: </span>
                    <span className="text-slate-300">
                      {job.qualification || "Not specified"}
                    </span>
                  </div>
                </div>

                <button
  onClick={() => handleApply(job.id)}
  disabled={applyingJobId === job.id}
  className="mt-6 rounded-lg bg-white px-6 py-3 font-semibold text-black hover:bg-slate-200 disabled:opacity-50"
>
  {applyingJobId === job.id ? "Applying..." : "Apply Now"}
</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}   