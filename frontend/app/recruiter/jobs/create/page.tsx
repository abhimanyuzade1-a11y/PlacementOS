"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabase";

export default function CreateJobPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState("");
  const [qualification, setQualification] = useState("");
  const [positions, setPositions] = useState("1");
  const [location, setLocation] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Please log in again.");
      }

      if (!title.trim()) {
        throw new Error("Please enter a job title.");
      }

      if (!companyName.trim()) {
        throw new Error("Please enter a company name.");
      }

      if (!description.trim()) {
        throw new Error("Please enter a job description.");
      }

      const requiredSkills = skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean);

      const { error: insertError } = await supabase
        .from("jobs")
        .insert({
          recruiter_id: user.id,
          title: title.trim(),
          company_name: companyName.trim(),
          description: description.trim(),
          required_skills: requiredSkills,
          experience_required: experience.trim() || null,
          qualification: qualification.trim() || null,
          positions: Number(positions) || 1,
          location: location.trim() || null,
          status: "open",
        });

      if (insertError) {
        throw new Error(insertError.message);
      }

      router.push("/recruiter");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not create the job."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-5xl px-6 py-10">

        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-purple-400">
              PLACEMENTOS
            </p>

            <h1 className="mt-2 text-4xl font-bold">
              Create New Job
            </h1>

            <p className="mt-2 text-slate-400">
              Define the hiring requirements for your new position.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/recruiter")}
            className="rounded-xl border border-slate-700 px-5 py-3 font-semibold hover:bg-slate-800"
          >
            ← Dashboard
          </button>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">

          {error && (
            <div className="mb-6 rounded-xl border border-red-800 bg-red-950/50 px-5 py-4 text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            <div className="grid gap-6 md:grid-cols-2">

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Job Title
                </label>

                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. AI Engineer"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-purple-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Company Name
                </label>

                <input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. PlacementOS Labs"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-purple-500"
                />
              </div>

            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Job Description
              </label>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the role, responsibilities and expectations..."
                rows={6}
                className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-purple-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Required Skills
              </label>

              <input
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="Python, Machine Learning, SQL, React"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-purple-500"
              />

              <p className="mt-2 text-xs text-slate-500">
                Separate skills using commas.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Experience Required
                </label>

                <input
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="e.g. 0–2 years"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-purple-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Qualification
                </label>

                <input
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  placeholder="e.g. B.Tech / B.E."
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-purple-500"
                />
              </div>

            </div>

            <div className="grid gap-6 md:grid-cols-2">

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Number of Positions
                </label>

                <input
                  type="number"
                  min="1"
                  value={positions}
                  onChange={(e) => setPositions(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-purple-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Location
                </label>

                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Pune / Remote"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-purple-500"
                />
              </div>

            </div>

            <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-end">

              <button
                type="button"
                onClick={() => router.push("/recruiter")}
                className="rounded-xl border border-slate-700 px-6 py-3 font-semibold text-slate-300 transition hover:bg-slate-800"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-3 font-semibold shadow-lg shadow-purple-900/30 transition hover:scale-[1.02] disabled:opacity-50"
              >
                {loading ? "Creating Job..." : "Create Job →"}
              </button>

            </div>

          </form>
        </div>

      </div>
    </main>
  );
}