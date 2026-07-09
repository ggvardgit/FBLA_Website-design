# AGENTS.md

## Cursor Cloud specific instructions

### Project Overview

This is a static web application (APUSH Learning Hub) with no build step, no frontend framework, and no package manager. It uses vanilla HTML/CSS/JS with browser localStorage for persistence.

### Running the Dev Server

```bash
python3 test-server.py
```

Serves the app at http://localhost:8000. The server adds CORS headers for API testing. Note: the script calls `webbrowser.open()` which is a no-op in headless environments but does not block the server.

### Linting

```bash
flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics
flake8 . --count --exit-zero --max-complexity=10 --max-line-length=127 --statistics
```

### Testing

```bash
pytest
```

Currently no test files exist (pytest collects 0 items), but the CI workflow (`python-app.yml`) runs both flake8 and pytest.

### Key Notes

- No `package.json`, `requirements.txt`, or build system exists. Python dev dependencies (flake8, pytest) are installed by the update script.
- The Google Gemini API integration is optional; the app falls back to embedded sample questions when no API key is configured.
- All data is stored in browser localStorage — no database required.
- The CI workflow uses Python 3.10 but the code runs fine on Python 3.12+.
