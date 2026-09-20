"use client";

import { ChangeEvent, useState } from "react";
import { supabase } from "../../../lib/supabase";

export default function CandidateResumePage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0] || null;

    setFile(selectedFile);
    setMessage("");
    setError("");

    if (!selectedFile) {
      return;
    }

    if (selectedFile.type !== "application/pdf") {
      setFile(null);
      setError("Please select a PDF resume.");
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setFile(null);
      setError("Resume must be smaller than 5 MB.");
      return;
    }
  }

  async function uploadResume() {
    if (!file) {
      setError("Please select a PDF resume first.");
      return;
    }

    setUploading(true);
    setMessage("");
    setError("");

    try {
      // Get logged-in candidate
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("Please log in again.");
      }

      // --------------------------------
      // 1. Extract text from PDF
      // --------------------------------

      const formData = new FormData();
      formData.append("file", file);

      const extractionResponse = await fetch(
        "http://127.0.0.1:8000/extract-resume",
        {
          method: "POST",
          body: formData,
        }
      );

      const extractionData = await extractionResponse.json();

      if (!extractionResponse.ok) {
        throw new Error(
          extractionData.detail ||
            "Could not extract text from the resume."
        );
      }

      const extractedText = extractionData.text;

      // --------------------------------
      // 2. Upload PDF to Supabase Storage
      // --------------------------------

      const filePath = `${user.id}/${Date.now()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("resumes")
        .upload(filePath, file, {
          contentType: "application/pdf",
          upsert: false,
        });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      // --------------------------------
      // 3. Save resume information
      // --------------------------------

      const { data: resume, error: resumeError } =
        await supabase
          .from("resumes")
          .insert({
            candidate_id: user.id,
            file_name: file.name,
            file_path: filePath,
            extracted_text: extractedText,
          })
          .select()
          .single();

      if (resumeError) {
        throw new Error(resumeError.message);
      }

      // --------------------------------
      // 4. Connect the new resume
      //    to candidate applications
      // --------------------------------

      const { error: applicationError } =
        await supabase
          .from("applications")
          .update({
            resume_id: resume.id,
          })
          .eq("candidate_id", user.id);

      if (applicationError) {
        console.warn(
          "Resume uploaded, but applications could not be updated:",
          applicationError.message
        );
      }

      setMessage(
        `Resume uploaded and analyzed successfully! Extracted ${extractedText.length} characters.`
      );

      setFile(null);

      // Reset file input
      const input = document.getElementById(
        "resume-file"
      ) as HTMLInputElement | null;

      if (input) {
        input.value = "";
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Resume upload failed."
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-3xl px-6 py-12">

        <h1 className="text-4xl font-bold">
          Upload Resume
        </h1>

        <p className="mt-3 text-slate-400">
          Upload your PDF resume. PlacementOS will extract
          the resume information for AI screening.
        </p>

        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-8">

          <label
            htmlFor="resume-file"
            className="block text-sm font-semibold text-slate-300"
          >
            Select Resume
          </label>

          <input
            id="resume-file"
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            className="mt-3 block w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-slate-300"
          />

          {file && (
            <div className="mt-4 rounded-lg bg-slate-950 p-4">
              <p className="font-semibold">
                📄 {file.name}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          )}

          {error && (
            <div className="mt-5 rounded-lg border border-red-800 bg-red-950 p-4 text-red-300">
              {error}
            </div>
          )}

          {message && (
            <div className="mt-5 rounded-lg border border-green-800 bg-green-950 p-4 text-green-300">
              {message}
            </div>
          )}

          <button
            onClick={uploadResume}
            disabled={!file || uploading}
            className="mt-6 rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploading
              ? "Uploading & Analyzing..."
              : "Upload Resume"}
          </button>

        </div>

      </div>
    </main>
  );
}