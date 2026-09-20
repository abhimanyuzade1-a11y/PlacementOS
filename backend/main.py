import os
import json

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from google import genai
from pypdf import PdfReader

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise RuntimeError("GEMINI_API_KEY is missing. Please add it to backend/.env")

client = genai.Client(api_key=api_key)

app = FastAPI(
    title="PlacementOS API",
    description="AI-powered recruitment and hiring intelligence platform",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------
# BASIC
# ---------------------------------------------------------

@app.get("/")
def root():
    return {
        "message": "PlacementOS API is running",
        "status": "online"
    }


@app.get("/health")
def health():
    return {"status": "healthy"}


# ---------------------------------------------------------
# RESUME EXTRACTION
# ---------------------------------------------------------

@app.post("/extract-resume")
async def extract_resume(file: UploadFile = File(...)):

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No file was provided."
        )

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF resumes are supported."
        )

    try:

        file_bytes = await file.read()

        if not file_bytes:
            raise HTTPException(
                status_code=400,
                detail="The uploaded PDF is empty."
            )

        from io import BytesIO

        pdf_file = BytesIO(file_bytes)

        reader = PdfReader(pdf_file)

        extracted_text = ""

        for page in reader.pages:

            page_text = page.extract_text()

            if page_text:
                extracted_text += page_text + "\n"

        extracted_text = extracted_text.strip()

        if not extracted_text:
            raise HTTPException(
                status_code=400,
                detail="Could not extract text from this PDF."
            )

        return {
            "success": True,
            "file_name": file.filename,
            "text": extracted_text,
            "pages": len(reader.pages),
        }

    except HTTPException:
        raise

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"PDF extraction failed: {str(e)}"
        )


# ---------------------------------------------------------
# AI SCREENING
# ---------------------------------------------------------

class AIScreenRequest(BaseModel):

    candidate_name: str
    resume_text: str
    job_title: str
    job_description: str
    required_skills: list[str] = []


@app.post("/ai-screen")
def ai_screen(request: AIScreenRequest):

    prompt = f"""
You are the AI Screening Agent inside PlacementOS,
an AI-powered recruitment platform.

Analyze the candidate's resume against the job requirements.

Candidate:
{request.candidate_name}

Job Title:
{request.job_title}

Job Description:
{request.job_description}

Required Skills:
{", ".join(request.required_skills)}

Candidate Resume:
{request.resume_text}

Return ONLY valid JSON in exactly this structure:

{{
    "match_score": 0,
    "recommendation": "Shortlist",
    "summary": "Short explanation of the candidate's suitability.",
    "matched_skills": [],
    "missing_skills": [],
    "strengths": [],
    "skill_gaps": [],
    "experience_assessment": "Short assessment",
    "education_assessment": "Short assessment"
}}

Rules:

1. match_score must be an integer from 0 to 100.
2. recommendation must be one of:
   "Strong Match",
   "Shortlist",
   "Needs Review",
   "Not Recommended"
3. matched_skills must contain skills found in both
   the resume and required skills.
4. missing_skills must contain important required skills
   that are not clearly present in the resume.
5. Do not invent candidate experience.
6. Do not make decisions based on age, gender, religion,
   caste, race, disability, or other protected characteristics.
7. Keep the explanation concise and useful for a recruiter.
8. Return JSON only. No markdown.
"""

    try:

        response = client.models.generate_content(
            model="gemini-3.5-flash",
            contents=prompt,
        )

        text = response.text.strip()

        if text.startswith("```"):

            text = text.replace("```json", "")
            text = text.replace("```", "")
            text = text.strip()

        result = json.loads(text)

        return {
            "success": True,
            "candidate_name": request.candidate_name,
            "job_title": request.job_title,
            "analysis": result,
        }

    except json.JSONDecodeError:

        raise HTTPException(
            status_code=500,
            detail="Gemini returned an invalid JSON response."
        )

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"AI screening failed: {str(e)}"
        )


# ---------------------------------------------------------
# AI INTERVIEW QUESTIONS
# ---------------------------------------------------------

class InterviewRequest(BaseModel):

    candidate_name: str
    resume_text: str
    job_title: str
    job_description: str
    required_skills: list[str] = []


class InterviewRequest(BaseModel):
    candidate_name: str
    resume_text: str
    job_title: str
    job_description: str
    required_skills: list[str] = []


@app.post("/generate-interview")
def generate_interview(request: InterviewRequest):

    prompt = f"""
You are the AI Interview Agent inside PlacementOS.

Create a personalized technical interview plan for the candidate.

Candidate:
{request.candidate_name}

Job Title:
{request.job_title}

Job Description:
{request.job_description}

Required Skills:
{", ".join(request.required_skills)}

Candidate Resume:
{request.resume_text}

Generate exactly 6 interview questions.

Include:

1. Technical question
2. AI / Machine Learning question
3. Programming question
4. Project-based question
5. Problem-solving question
6. Candidate-specific follow-up question

Return ONLY valid JSON using this structure:

{{
    "questions": [
        {{
            "number": 1,
            "category": "Technical",
            "question": "Question here",
            "why": "Why this question is relevant"
        }}
    ]
}}

Rules:

1. Generate exactly 6 questions.
2. Use the candidate's actual resume.
3. Do not invent projects or experience.
4. At least 2 questions must directly reference the resume.
5. Keep questions concise.
6. Return JSON only.
"""

    try:

        response = client.models.generate_content(
            model="gemini-3.5-flash",
            contents=prompt,
        )

        text = response.text.strip()

        if text.startswith("```"):
            text = text.replace("```json", "")
            text = text.replace("```", "")
            text = text.strip()

        result = json.loads(text)

        return {
            "success": True,
            "candidate_name": request.candidate_name,
            "job_title": request.job_title,
            "interview": result,
        }

    except json.JSONDecodeError:

        raise HTTPException(
            status_code=500,
            detail="Gemini returned invalid interview JSON."
        )

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Interview generation failed: {str(e)}"
        )