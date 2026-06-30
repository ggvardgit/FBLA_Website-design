#!/usr/bin/env python3
"""
Legacy entry point: forwards to the Flask app (static files + OpenAI API).

Run:
  export OPENAI_API_KEY="sk-..."   # optional, for AI features
  pip install -r requirements.txt
  python test-server.py

Or: python app.py
"""

from app import main

if __name__ == "__main__":
    main()
