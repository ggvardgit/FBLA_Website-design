#!/usr/bin/env python3
"""
APUSH Learning Hub — development server with OpenAI (ChatGPT API) backend.

Usage:
  export OPENAI_API_KEY="sk-..."   # required for AI features
  pip install -r requirements.txt
  python app.py

Optional:
  export OPENAI_MODEL="gpt-4o-mini"   # default; or gpt-3.5-turbo, gpt-4o, etc.
  export JITSI_BASE="https://meet.jit.si"   # default; used only if you expose room URLs from API later

AI features are NOT available in the browser without this server (no API key in frontend).
"""

from __future__ import annotations

import json
import os
import re
import sys
from pathlib import Path

from flask import Flask, abort, jsonify, request, send_from_directory

ROOT = Path(__file__).resolve().parent

try:
    from openai import OpenAI
except ImportError:
    OpenAI = None  # type: ignore

app = Flask(__name__, static_folder=None)
_client: OpenAI | None = None


def get_openai_client() -> OpenAI | None:
    global _client
    if OpenAI is None:
        return None
    if not os.environ.get("OPENAI_API_KEY"):
        return None
    if _client is None:
        _client = OpenAI()
    return _client


def get_model() -> str:
    return os.environ.get("OPENAI_MODEL", "gpt-4o-mini")


def extract_json_text(raw: str) -> str:
    text = raw.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text, count=1)
        text = re.sub(r"\s*```$", "", text, count=1)
    return text.strip()


def chat_json(system: str, user: str) -> dict:
    client = get_openai_client()
    if not client:
        raise RuntimeError("OpenAI client not configured")
    resp = client.chat.completions.create(
        model=get_model(),
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        temperature=0.7,
    )
    raw = resp.choices[0].message.content
    if not raw:
        raise RuntimeError("Empty model response")
    return json.loads(extract_json_text(raw))


@app.route("/api/health", methods=["GET"])
def health():
    ok = get_openai_client() is not None
    return jsonify(ok=True, ai=ok, model=get_model() if ok else None)


@app.route("/api/ai", methods=["POST", "OPTIONS"])
def ai_dispatch():
    if request.method == "OPTIONS":
        return "", 204
    client = get_openai_client()
    if not client:
        return (
            jsonify(
                error="Server has no OpenAI API key. Set the OPENAI_API_KEY environment variable and restart."
            ),
            503,
        )

    data = request.get_json(silent=True) or {}
    action = data.get("action")
    try:
        if action == "mcq":
            period = data.get("period") or {}
            themes = (period.get("themes") or [])[:3]
            user = f"""Generate one AP U.S. History multiple choice question for Period {period.get("number")}: {period.get("name")} ({period.get("dates")}).
Focus on themes: {", ".join(themes)}.
Return ONLY a JSON object:
{{
    "question": "The question stem",
    "options": ["A", "B", "C", "D"],
    "correct": 0,
    "explanation": "Brief explanation of the correct answer"
}}"""
            out = chat_json(
                "You output only valid JSON for AP U.S. History practice. No markdown outside JSON.",
                user,
            )
            return jsonify(out)

        if action == "dbq":
            period = data.get("period") or {}
            themes = (period.get("themes") or [])[:3]
            user = f"""Generate a Document-Based Question (DBQ) prompt for AP U.S. History Period {period.get("number")}: {period.get("name")} ({period.get("dates")}).
Requirements: College Board APUSH DBQ format, evaluative prompt, themes: {", ".join(themes)}, 7 documents, historically accurate.
Return ONLY JSON:
{{
    "prompt": "full prompt text",
    "documents": 7,
    "points": 7,
    "themes": ["Theme 1", "Theme 2", "Theme 3"]
}}"""
            out = chat_json(
                "You output only valid JSON for AP U.S. History. No markdown outside JSON.",
                user,
            )
            return jsonify(out)

        if action == "leq":
            period = data.get("period") or {}
            themes = (period.get("themes") or [])[:3]
            user = f"""Generate a Long Essay Question (LEQ) for AP U.S. History Period {period.get("number")}: {period.get("name")} ({period.get("dates")}).
Requirements: College Board LEQ format, evaluative, themes: {", ".join(themes)}, 6 points.
Return ONLY JSON:
{{
    "prompt": "full prompt text",
    "points": 6,
    "themes": ["Theme 1", "Theme 2"]
}}"""
            out = chat_json(
                "You output only valid JSON for AP U.S. History. No markdown outside JSON.",
                user,
            )
            return jsonify(out)

        if action == "leq-outline":
            prompt_text = (data.get("promptText") or "").strip()
            if not prompt_text:
                return jsonify(error="promptText required"), 400
            user = f"""Given this LEQ prompt for AP U.S. History:
"{prompt_text}"

Return ONLY JSON:
{{
    "thesis": "...",
    "context": "...",
    "body1": {{ "topic": "...", "evidence": ["..."], "analysis": "..." }},
    "body2": {{ "topic": "...", "evidence": ["..."], "analysis": "..." }},
    "body3": {{ "topic": "...", "evidence": ["..."], "analysis": "..." }},
    "conclusion": "..."
}}"""
            out = chat_json(
                "You output only valid JSON. No markdown outside JSON.",
                user,
            )
            return jsonify(out)

        if action == "grade-essay":
            essay_type = (data.get("essayType") or "leq").lower()
            prompt_text = data.get("promptText") or ""
            student = (data.get("studentResponse") or "").strip()
            period = data.get("period") or {}
            if len(student) < 40:
                return jsonify(error="Response too short for grading."), 400
            period_line = (
                f'APUSH Period {period.get("number")}: {period.get("name")} ({period.get("dates")}). '
                f'Themes: {", ".join((period.get("themes") or [])[:4])}.'
                if period
                else "AP U.S. History."
            )
            max_total = 7 if essay_type == "dbq" else 6
            rubric = (
                "DBQ (0–7): Thesis 1, Context 1, Evidence 3, Analysis 2."
                if essay_type == "dbq"
                else "LEQ (0–6): Thesis 1, Context 1, Evidence 2, Analysis 2."
            )
            user = f"""You are an AP U.S. History exam reader. {period_line}

Essay type: {essay_type.upper()}
Prompt: {prompt_text}

Student response:
{student}

{rubric}

Return ONLY valid JSON:
{{
  "thesis": 0,
  "context": 0,
  "evidence": 0,
  "analysis": 0,
  "total": 0,
  "maxTotal": {max_total},
  "meetsCriteria": true,
  "summary": "2-3 sentence overall assessment",
  "strengths": ["..."],
  "improvements": ["..."]
}}"""
            out = chat_json(
                "You output only valid JSON. Score honestly using AP-style rubric. No markdown outside JSON.",
                user,
            )
            return jsonify(out)

        if action == "saq":
            # Legacy name: same structured output as MCQ for compatibility
            period = data.get("period") or {}
            themes = (period.get("themes") or [])[:3]
            user = f"""Generate one APUSH multiple choice question for Period {period.get("number")}: {period.get("name")} ({period.get("dates")}).
Themes: {", ".join(themes)}.
Return ONLY JSON:
{{
    "question": "...",
    "options": ["A", "B", "C", "D"],
    "correct": 0,
    "feedback": "why the answer is correct"
}}"""
            out = chat_json(
                "You output only valid JSON for AP U.S. History. No markdown outside JSON.",
                user,
            )
            return jsonify(out)

        return jsonify(error=f"Unknown action: {action}"), 400

    except json.JSONDecodeError as e:
        return jsonify(error=f"Invalid JSON from model: {e}"), 502
    except Exception as e:
        return jsonify(error=str(e)), 502


@app.route("/", methods=["GET"])
def index():
    return send_from_directory(ROOT, "index.html")


@app.route("/login.html", methods=["GET"])
@app.route("/login", methods=["GET"])
def login_page():
    return send_from_directory(ROOT, "login.html")


@app.route("/<path:filename>", methods=["GET"])
def static_files(filename: str):
    if ".." in filename or filename.startswith("/"):
        abort(404)
    low = filename.lower()
    if low.endswith(".py") or low.endswith(".pyc") or low.endswith(".env"):
        abort(404)
    path = ROOT / filename
    if path.is_file():
        return send_from_directory(ROOT, filename)
    abort(404)


def main():
    os.chdir(ROOT)
    if OpenAI is None:
        print("Install dependencies: pip install -r requirements.txt", file=sys.stderr)
        sys.exit(1)
    port = int(os.environ.get("PORT", "8000"))
    print("=" * 60)
    print("APUSH Learning Hub — http://localhost:%s" % port)
    print("AI: set OPENAI_API_KEY on this machine to enable ChatGPT-backed features.")
    print("=" * 60)
    app.run(host="0.0.0.0", port=port, debug=False)


if __name__ == "__main__":
    main()
