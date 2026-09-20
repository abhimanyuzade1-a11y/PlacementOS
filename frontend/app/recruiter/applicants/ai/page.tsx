"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabase";

type AIResult = {
  match_score: number;
  recommendation: string;
  summary: string;
  matched_skills: string[];
  missing_skills: string[];
  strengths: string[];
  skill_gaps: string[];
  experience_assessment: string;
  education_assessment: string;
};

type InterviewQuestion = {
  number: number;
  category: string;
  question: string;
  why: string;
};

function AIScreenPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const applicationId = searchParams.get("id");

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [screening, setScreening] = useState(false);
  const [interviewLoading, setInterviewLoading] = useState(false);

  const [result, setResult] = useState<AIResult | null>(null);

  const [interviewQuestions, setInterviewQuestions] = useState<
    InterviewQuestion[]
  >([]);

  const [decisionLoading, setDecisionLoading] = useState(false);

  const [decision, setDecision] = useState<
    "selected" | "rejected" | null
  >(null);

  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleSaved, setScheduleSaved] = useState(false);

  const [interviewDate, setInterviewDate] = useState("");
  const [interviewTime, setInterviewTime] = useState("");
  const [interviewType, setInterviewType] = useState("Online");
  const [interviewLocation, setInterviewLocation] = useState("");
  const [interviewLink, setInterviewLink] = useState("");
  const [interviewMessage, setInterviewMessage] = useState("");

  const [error, setError] = useState("");

  useEffect(() => {
    if (applicationId) {
      loadData();
    }
  }, [applicationId]);

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const { data: application, error: applicationError } =
        await supabase
          .from("applications")
          .select(`
            id,
            candidate_id,
            resume_id,
            job_id,
            status,
            interview_date,
            interview_time,
            interview_type,
            interview_location,
            interview_link,
            interview_message
          `)
          .eq("id", applicationId)
          .single();

      if (applicationError) {
        throw new Error(applicationError.message);
      }

      const { data: profile, error: profileError } =
        await supabase
          .from("profiles")
          .select("full_name, email")
          .eq("id", application.candidate_id)
          .single();

      if (profileError) {
        throw new Error(profileError.message);
      }

      let resume = null;

      if (application.resume_id) {
        const { data: linkedResume, error: linkedResumeError } =
          await supabase
            .from("resumes")
            .select("id, file_name, extracted_text, created_at")
            .eq("id", application.resume_id)
            .maybeSingle();

        if (!linkedResumeError && linkedResume) {
          resume = linkedResume;
        }
      }

      if (!resume?.extracted_text?.trim()) {
        const { data: latestResumes, error: latestResumeError } =
          await supabase
            .from("resumes")
            .select("id, file_name, extracted_text, created_at")
            .eq("candidate_id", application.candidate_id)
            .not("extracted_text", "is", null)
            .order("created_at", { ascending: false })
            .limit(10);

        if (latestResumeError) {
          throw new Error(latestResumeError.message);
        }

        const usableResume = latestResumes?.find(
          (item) => item.extracted_text?.trim()
        );

        if (usableResume) {
          resume = usableResume;
        }
      }

      if (!resume?.extracted_text?.trim()) {
        throw new Error(
          "A resume was found, but no extracted resume text is available."
        );
      }

      const { data: job, error: jobError } = await supabase
        .from("jobs")
        .select("title, company_name, description, required_skills")
        .eq("id", application.job_id)
        .single();

      if (jobError) {
        throw new Error(jobError.message);
      }

      setData({
        application,
        profile,
        resume,
        job,
      });

      if (
        application.status === "selected" ||
        application.status === "rejected"
      ) {
        setDecision(application.status);
      }

      // Load previously scheduled interview if one already exists.
      if (application.interview_date) {
        setInterviewDate(application.interview_date);
      }

      if (application.interview_time) {
        setInterviewTime(
          String(application.interview_time).slice(0, 5)
        );
      }

      if (application.interview_type) {
        setInterviewType(application.interview_type);
      }

      if (application.interview_location) {
        setInterviewLocation(application.interview_location);
      }

      if (application.interview_link) {
        setInterviewLink(application.interview_link);
      }

      if (application.interview_message) {
        setInterviewMessage(application.interview_message);
      }

      if (
        application.interview_date &&
        application.interview_time
      ) {
        setScheduleSaved(true);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load candidate information."
      );
    } finally {
      setLoading(false);
    }
  }

  async function runAIScreening() {
    if (!data) return;

    setScreening(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(
        "/backend/ai-screen",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            candidate_name:
              data.profile?.full_name || "Candidate",

            resume_text: data.resume.extracted_text,

            job_title:
              data.job?.title || "Job",

            job_description:
              data.job?.description ||
              "No job description available.",

            required_skills:
              data.job?.required_skills || [],
          }),
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(
          responseData.detail || "AI screening failed."
        );
      }

      setResult(responseData.analysis);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "AI screening failed."
      );
    } finally {
      setScreening(false);
    }
  }

  async function generateInterview() {
    if (!data) return;

    setInterviewLoading(true);
    setError("");

    try {
      const response = await fetch(
        "/backend/generate-interview",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            candidate_name:
              data.profile?.full_name || "Candidate",

            resume_text: data.resume.extracted_text,

            job_title:
              data.job?.title || "Job",

            job_description:
              data.job?.description ||
              "No job description available.",

            required_skills:
              data.job?.required_skills || [],
          }),
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(
          responseData.detail ||
            "Could not generate interview questions."
        );
      }

      setInterviewQuestions(
        responseData.interview?.questions || []
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Interview generation failed."
      );
    } finally {
      setInterviewLoading(false);
    }
  }

  async function makeRecruiterDecision(
    newDecision: "selected" | "rejected"
  ) {
    if (!applicationId) return;

    setDecisionLoading(true);
    setError("");

    try {
      const { error: updateError } = await supabase
        .from("applications")
        .update({
          status: newDecision,
        })
        .eq("id", applicationId);

      if (updateError) {
        throw new Error(updateError.message);
      }

      setDecision(newDecision);

      setData((previous: any) => ({
        ...previous,
        application: {
          ...previous.application,
          status: newDecision,
        },
      }));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not update recruiter decision."
      );
    } finally {
      setDecisionLoading(false);
    }
  }

  async function scheduleInterview() {
  if (!applicationId) {
    setError("Application ID is missing.");
    return;
  }

  setError("");

  if (!interviewDate) {
    setError("Please select an interview date.");
    return;
  }

  if (!interviewTime) {
    setError("Please select an interview time.");
    return;
  }

  if (interviewType === "Online" && !interviewLink.trim()) {
    setError("Please enter the meeting link.");
    return;
  }

  if (
    interviewType === "In-person" &&
    !interviewLocation.trim()
  ) {
    setError("Please enter the interview location.");
    return;
  }

  setScheduleLoading(true);
  setScheduleSaved(false);

  try {
    console.log("Scheduling interview...");

    const updateData = {
      interview_date: interviewDate,
      interview_time: interviewTime,
      interview_type: interviewType,
      interview_location:
        interviewType === "In-person"
          ? interviewLocation.trim()
          : null,
      interview_link:
        interviewType === "Online"
          ? interviewLink.trim()
          : null,
      interview_message:
        interviewMessage.trim() || null,
    };

    const { data: updatedApplication, error: updateError } =
      await supabase
        .from("applications")
        .update(updateData)
        .eq("id", applicationId)
        .select()
        .single();

    console.log("Supabase response:", {
      updatedApplication,
      updateError,
    });

    if (updateError) {
      throw new Error(
        `Supabase error: ${updateError.message}`
      );
    }

    if (!updatedApplication) {
      throw new Error(
        "Interview was not saved. No application was updated."
      );
    }

    setScheduleSaved(true);

    setData((previous: any) => ({
      ...previous,
      application: {
        ...previous.application,
        ...updatedApplication,
      },
    }));

    setError("");

    console.log("✓ Interview scheduled successfully");

  } catch (err) {
    console.error("Interview scheduling failed:", err);

    setScheduleSaved(false);

    setError(
      err instanceof Error
        ? err.message
        : "Could not schedule the interview."
    );
  } finally {
    setScheduleLoading(false);
  }
}

  function formatDate(dateString: string) {
    if (!dateString) return "";

    return new Date(
      `${dateString}T00:00:00`
    ).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  function formatTime(timeString: string) {
    if (!timeString) return "";

    const [hours, minutes] = timeString
      .slice(0, 5)
      .split(":")
      .map(Number);

    const date = new Date();
    date.setHours(hours, minutes, 0, 0);

    return date.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 p-10 text-white">
        <p className="text-slate-400">
          Loading candidate information...
        </p>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="min-h-screen bg-slate-950 p-10 text-white">
        <p className="text-red-400">
          {error || "Candidate application not found."}
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">

        <button
          onClick={() =>
            router.push("/recruiter/applicants")
          }
          className="mb-8 rounded-lg border border-slate-700 px-5 py-2 hover:bg-slate-800"
        >
          ← Back to Applicants
        </button>

        <p className="text-sm font-semibold text-purple-400">
          PLACEMENTOS AI
        </p>

        <h1 className="mt-2 text-4xl font-bold">
          AI Candidate Intelligence
        </h1>

        <p className="mt-2 text-slate-400">
          AI screening and personalized interview intelligence.
        </p>

        {/* CANDIDATE */}

        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-7">

          <div className="flex flex-col justify-between gap-5 md:flex-row">

            <div>
              <h2 className="text-3xl font-bold">
                {data.profile?.full_name}
              </h2>

              <p className="mt-1 text-slate-400">
                {data.profile?.email}
              </p>
            </div>

            <div className="md:text-right">

              <p className="text-sm text-slate-500">
                Applied For
              </p>

              <p className="text-xl font-semibold">
                {data.job?.title}
              </p>

              <p className="text-slate-400">
                {data.job?.company_name}
              </p>

            </div>

          </div>

          <div className="mt-7 border-t border-slate-800 pt-6">

            <p className="text-sm text-slate-500">
              Resume used for AI analysis
            </p>

            <p className="mt-2 font-semibold">
              📄 {data.resume?.file_name}
            </p>

            <p className="mt-2 text-xs text-green-400">
              ✓ Resume text successfully loaded
            </p>

          </div>

        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-800 bg-red-950 p-4 text-red-300">
            {error}
          </div>
        )}

        {/* AGENT 01 */}

        <div className="mt-8 rounded-2xl border border-purple-800 bg-slate-900 p-7">

          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

            <div>

              <p className="text-sm font-semibold text-purple-400">
                AGENT 01
              </p>

              <h2 className="mt-1 text-2xl font-bold">
                Resume Intelligence Agent
              </h2>

              <p className="mt-2 text-slate-400">
                Analyze resume, skills, experience and job fit.
              </p>

            </div>

            {!result && (
              <button
                onClick={runAIScreening}
                disabled={screening}
                className="rounded-lg bg-purple-600 px-6 py-3 font-semibold hover:bg-purple-500 disabled:opacity-50"
              >
                {screening
                  ? "🤖 Analyzing..."
                  : "🤖 Run AI Screening"}
              </button>
            )}

          </div>

        </div>

        {/* AI RESULT */}

        {result && (
          <div className="mt-8 space-y-6">

            <div className="grid gap-6 md:grid-cols-2">

              <div className="rounded-2xl border border-purple-800 bg-slate-900 p-7">

                <p className="text-sm text-slate-500">
                  AI Match Score
                </p>

                <p className="mt-2 text-6xl font-bold text-purple-400">
                  {result.match_score}
                  <span className="text-2xl text-slate-500">
                    /100
                  </span>
                </p>

              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-7">

                <p className="text-sm text-slate-500">
                  AI Recommendation
                </p>

                <p className="mt-4 inline-block rounded-full bg-purple-950 px-5 py-2 font-bold text-purple-300">
                  {result.recommendation}
                </p>

              </div>

            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-7">

              <h2 className="text-2xl font-bold">
                AI Summary
              </h2>

              <p className="mt-4 leading-7 text-slate-300">
                {result.summary}
              </p>

            </div>

            <div className="grid gap-6 md:grid-cols-2">

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-7">

                <h2 className="text-xl font-bold">
                  Matched Skills
                </h2>

                <div className="mt-4 flex flex-wrap gap-2">

                  {result.matched_skills?.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full bg-green-950 px-3 py-2 text-sm text-green-300"
                    >
                      ✓ {skill}
                    </span>
                  ))}

                </div>

              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-7">

                <h2 className="text-xl font-bold">
                  Missing Skills
                </h2>

                <div className="mt-4 flex flex-wrap gap-2">

                  {result.missing_skills?.length > 0
                    ? result.missing_skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full bg-red-950 px-3 py-2 text-sm text-red-300"
                        >
                          ! {skill}
                        </span>
                      ))
                    : (
                      <p className="text-slate-500">
                        No major missing skills identified.
                      </p>
                    )}

                </div>

              </div>

            </div>

            {/* AGENT 02 */}

            <div className="rounded-2xl border border-blue-800 bg-slate-900 p-7">

              <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

                <div>

                  <p className="text-sm font-semibold text-blue-400">
                    AGENT 02
                  </p>

                  <h2 className="mt-1 text-2xl font-bold">
                    AI Interview Intelligence
                  </h2>

                  <p className="mt-2 text-slate-400">
                    Generate personalized interview questions
                    from the candidate&apos;s resume and job
                    requirements.
                  </p>

                </div>

                <button
                  onClick={generateInterview}
                  disabled={interviewLoading}
                  className="rounded-lg bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-500 disabled:opacity-50"
                >
                  {interviewLoading
                    ? "🤖 Generating..."
                    : "🎤 Generate Interview"}
                </button>

              </div>

            </div>

            {/* QUESTIONS */}

            {interviewQuestions.length > 0 && (
              <div className="rounded-2xl border border-blue-800 bg-slate-900 p-7">

                <p className="text-sm font-semibold text-blue-400">
                  AI-GENERATED INTERVIEW PLAN
                </p>

                <h2 className="mt-1 text-2xl font-bold">
                  Personalized Questions
                </h2>

                <p className="mt-2 text-slate-400">
                  Questions generated specifically for this
                  candidate and role.
                </p>

                <div className="mt-7 space-y-4">

                  {interviewQuestions.map((question) => (

                    <div
                      key={question.number}
                      className="rounded-xl border border-slate-800 bg-slate-950 p-6"
                    >

                      <div className="flex gap-4">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-950 font-bold text-blue-300">
                          {question.number}
                        </div>

                        <div>

                          <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300">
                            {question.category}
                          </span>

                          <h3 className="mt-3 text-lg font-semibold leading-7">
                            {question.question}
                          </h3>

                          <p className="mt-3 text-sm text-slate-500">
                            Why ask this: {question.why}
                          </p>

                        </div>

                      </div>

                    </div>

                  ))}

                </div>

                <div className="mt-7 rounded-xl border border-yellow-800 bg-yellow-950/40 p-5">

                  <p className="font-semibold text-yellow-300">
                    Human Interviewer Review
                  </p>

                  <p className="mt-1 text-sm text-yellow-200/70">
                    These questions are AI-generated decision-support
                    content. The interviewer should review and adapt
                    them before conducting the interview.
                  </p>

                </div>

              </div>
            )}

            {/* AGENT 03 */}

            <div className="rounded-2xl border border-green-800 bg-slate-900 p-7">

              <p className="text-sm font-semibold text-green-400">
                AGENT 03
              </p>

              <h2 className="mt-1 text-2xl font-bold">
                Recruiter Decision
              </h2>

              <p className="mt-2 text-slate-400">
                Review the AI analysis and make the final hiring decision.
              </p>

              <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950 p-5">

                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                  <div>

                    <p className="text-sm text-slate-500">
                      Candidate
                    </p>

                    <p className="mt-1 text-lg font-semibold">
                      {data.profile?.full_name}
                    </p>

                    <p className="text-sm text-slate-400">
                      {data.job?.title}
                    </p>

                  </div>

                  <div>

                    <p className="text-sm text-slate-500">
                      AI Recommendation
                    </p>

                    <p className="mt-1 font-semibold text-purple-300">
                      {result.recommendation}
                    </p>

                  </div>

                </div>

              </div>

              {decision ? (
                <div
                  className={`mt-6 rounded-xl border p-6 ${
                    decision === "selected"
                      ? "border-green-700 bg-green-950"
                      : "border-red-700 bg-red-950"
                  }`}
                >

                  <p
                    className={`text-lg font-bold ${
                      decision === "selected"
                        ? "text-green-300"
                        : "text-red-300"
                    }`}
                  >
                    {decision === "selected"
                      ? "✓ Candidate Selected"
                      : "✕ Candidate Rejected"}
                  </p>

                  <p className="mt-2 text-sm text-slate-300">
                    The recruiter&apos;s final decision has been saved successfully.
                  </p>

                </div>
              ) : (
                <div className="mt-6 flex flex-col gap-4 sm:flex-row">

                  <button
                    onClick={() =>
                      makeRecruiterDecision("selected")
                    }
                    disabled={decisionLoading}
                    className="flex-1 rounded-xl bg-green-600 px-6 py-4 font-bold text-white hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {decisionLoading
                      ? "Saving..."
                      : "✓ Select Candidate"}
                  </button>

                  <button
                    onClick={() =>
                      makeRecruiterDecision("rejected")
                    }
                    disabled={decisionLoading}
                    className="flex-1 rounded-xl bg-red-600 px-6 py-4 font-bold text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {decisionLoading
                      ? "Saving..."
                      : "✕ Reject Candidate"}
                  </button>

                </div>
              )}

            </div>

            {/* AGENT 04 — INTERVIEW SCHEDULING */}

            <div className="rounded-2xl border border-orange-800 bg-slate-900 p-7">

              <div>

                <p className="text-sm font-semibold text-orange-400">
                  AGENT 04
                </p>

                <h2 className="mt-1 text-2xl font-bold">
                  Interview Scheduling
                </h2>

                <p className="mt-2 text-slate-400">
                  Schedule the candidate&apos;s interview and send the
                  interview details to their Candidate Portal.
                </p>

              </div>

              <div className="mt-7 grid gap-6 md:grid-cols-2">

                {/* DATE */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-300">
                    Interview Date
                  </label>

                  <input
                    type="date"
                    value={interviewDate}
                    onChange={(e) => {
                      setInterviewDate(e.target.value);
                      setScheduleSaved(false);
                    }}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-orange-500"
                  />

                </div>

                {/* TIME */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-300">
                    Interview Time
                  </label>

                  <input
                    type="time"
                    value={interviewTime}
                    onChange={(e) => {
                      setInterviewTime(e.target.value);
                      setScheduleSaved(false);
                    }}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-orange-500"
                  />

                </div>

                {/* TYPE */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-300">
                    Interview Type
                  </label>

                  <select
                    value={interviewType}
                    onChange={(e) => {
                      setInterviewType(e.target.value);
                      setScheduleSaved(false);
                    }}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-orange-500"
                  >
                    <option value="Online">
                      Online
                    </option>

                    <option value="In-person">
                      In-person
                    </option>
                  </select>

                </div>

                {/* LOCATION */}

                {interviewType === "In-person" && (
                  <div>

                    <label className="mb-2 block text-sm font-semibold text-slate-300">
                      Interview Location
                    </label>

                    <input
                      type="text"
                      value={interviewLocation}
                      onChange={(e) => {
                        setInterviewLocation(e.target.value);
                        setScheduleSaved(false);
                      }}
                      placeholder="Example: PlacementOS Labs, Pune"
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder:text-slate-600 outline-none focus:border-orange-500"
                    />

                  </div>
                )}

                {/* MEETING LINK */}

                {interviewType === "Online" && (
                  <div>

                    <label className="mb-2 block text-sm font-semibold text-slate-300">
                      Meeting Link
                    </label>

                    <input
                      type="url"
                      value={interviewLink}
                      onChange={(e) => {
                        setInterviewLink(e.target.value);
                        setScheduleSaved(false);
                      }}
                      placeholder="https://meet.google.com/..."
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder:text-slate-600 outline-none focus:border-orange-500"
                    />

                  </div>
                )}

              </div>

              {/* MESSAGE */}

              <div className="mt-6">

                <label className="mb-2 block text-sm font-semibold text-slate-300">
                  Message to Candidate
                </label>

                <textarea
                  value={interviewMessage}
                  onChange={(e) => {
                    setInterviewMessage(e.target.value);
                    setScheduleSaved(false);
                  }}
                  rows={4}
                  placeholder="Example: Congratulations! You have been shortlisted for the next round. Please join the interview at the scheduled time."
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder:text-slate-600 outline-none focus:border-orange-500"
                />

              </div>

              {/* SCHEDULE BUTTON */}

              <div className="mt-7">

                <button
                  onClick={scheduleInterview}
                  disabled={scheduleLoading}
                  className="w-full rounded-xl bg-orange-600 px-6 py-4 font-bold text-white hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {scheduleLoading
                    ? "Saving Interview..."
                    : scheduleSaved
                    ? "✓ Interview Scheduled"
                    : "📅 Schedule Interview"}
                </button>

              </div>

              {/* SUCCESS */}

              {scheduleSaved && (
                <div className="mt-6 rounded-xl border border-green-700 bg-green-950 p-6">

                  <p className="text-lg font-bold text-green-300">
                    ✓ Interview Scheduled Successfully
                  </p>

                  <div className="mt-4 grid gap-3 text-sm text-green-200 md:grid-cols-2">

                    <p>
                      📅 <strong>Date:</strong>{" "}
                      {formatDate(interviewDate)}
                    </p>

                    <p>
                      🕐 <strong>Time:</strong>{" "}
                      {formatTime(interviewTime)}
                    </p>

                    <p>
                      🎤 <strong>Type:</strong>{" "}
                      {interviewType}
                    </p>

                    {interviewType === "In-person" &&
                      interviewLocation && (
                        <p>
                          📍 <strong>Location:</strong>{" "}
                          {interviewLocation}
                        </p>
                      )}

                    {interviewType === "Online" &&
                      interviewLink && (
                        <p className="break-all">
                          🔗 <strong>Meeting:</strong>{" "}
                          {interviewLink}
                        </p>
                      )}

                  </div>

                  <p className="mt-5 border-t border-green-800 pt-4 text-sm text-green-300">
                    The interview invitation is now visible in the
                    candidate&apos;s Candidate Portal.
                  </p>

                </div>
              )}

            </div>

          </div>
        )}

        <div className="mt-8 rounded-xl border border-yellow-800 bg-yellow-950 p-5">

          <p className="font-semibold text-yellow-300">
            Human Review Required
          </p>

          <p className="mt-1 text-sm text-yellow-200/70">
            PlacementOS provides AI decision support.
            The final hiring decision remains with the recruiter.
          </p>

        </div>

      </div>
    </main>
  );
}

export default function AIScreenPageWrapper() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-950 p-10 text-white">
          <p className="text-slate-400">
            Loading AI candidate intelligence...
          </p>
        </main>
      }
    >
      <AIScreenPage />
    </Suspense>
  );
}


