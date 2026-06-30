#!/usr/bin/env python3
"""Rebuild apush-prompt-bank.js from FBLA WEBDES.pdf + curated 6-source DBQ packs."""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PDF_PATH = Path("/Users/vardhan/Downloads/FBLA WEBDES.pdf")
OUT_PATH = ROOT / "apush-prompt-bank.js"
EXISTING = ROOT / "apush-prompt-bank.js"

PERIOD_LABELS = {
    1: "Colonial & Contact",
    2: "Colonial Regions",
    3: "Revolution & Early Republic",
    4: "Expansion & Reform",
    5: "Civil War & Reconstruction",
    6: "Industrialization",
    7: "Modern America",
    8: "Postwar America",
}


def period_for_index(n: int) -> int:
    if n <= 10:
        return 1 if n <= 5 else 2
    if n <= 20:
        return 3
    if n <= 30:
        return 4
    if n <= 40:
        return 4 if n <= 35 else 5
    if n <= 50:
        return 5
    if n <= 60:
        return 6
    if n <= 70:
        return 7
    if n <= 80:
        return 7
    if n <= 90:
        return 8
    return 8


def load_pdf_text() -> str:
    try:
        from pypdf import PdfReader
    except ImportError:
        tools = ROOT / ".pdf_tools"
        if tools.exists():
            sys.path.insert(0, str(tools))
            from pypdf import PdfReader
        else:
            raise
    return "".join((pg.extract_text() or "") for pg in PdfReader(str(PDF_PATH)).pages)


def slice_between(flat: str, start_pat: str, end_pat: str) -> str:
    s = re.search(start_pat, flat, re.I)
    if not s:
        return ""
    start = s.end()
    e = re.search(end_pat, flat[start:], re.I)
    return flat[start : start + e.start()] if e else flat[start:]


def parse_questions(chunk: str, max_n: int = 100) -> list[str]:
    items = []
    # Avoid matching years (e.g. 1776.) — question numbers start at chunk start or after whitespace.
    for m in re.finditer(r"(?:^|\s)(\d{1,3})\.\s+", chunk):
        items.append((m.start(), int(m.group(1)), m.end()))
    seen: dict[int, str] = {}
    for i, (_, n, start) in enumerate(items):
        if n > max_n:
            continue
        end = items[i + 1][0] if i + 1 < len(items) else len(chunk)
        body = chunk[start:end].strip()
        body = re.sub(r"###.*$", "", body).strip()
        body = re.sub(r"\s+", " ", body)
        if body:
            seen[n] = body
    return [seen[k] for k in sorted(seen)]


def load_existing_dbq_sources() -> list[list[dict]]:
    if not EXISTING.exists():
        return []
    raw = EXISTING.read_text(encoding="utf-8")
    m = re.search(r"window\.APUSH_PROMPT_BANK\s*=\s*(\{[\s\S]*\})\s*;?\s*$", raw)
    if not m:
        return []
    data = json.loads(m.group(1))
    return [d.get("sources", [])[:6] for d in data.get("dbqs", [])]


# Primary/secondary citations keyed to FRQ themes (supplemental)
SUPPLEMENTAL_SOURCES = [
    ("Jonathan Edwards, sermon on religious awakening (1730s)", "Primary sermon", "Stressed personal conversion and challenged established clergy."),
    ("Benjamin Franklin, *Poor Richard's Almanack* (1750s)", "Primary almanac", "Spread practical virtues and Enlightenment habits in colonial towns."),
    ("Virginia Resolves (1765)", "Colonial protest document", "Asserted that only representative assemblies could tax colonists."),
    ("Thomas Paine, *Common Sense* (1776)", "Pamphlet", "Argued independence was common sense for ordinary Americans."),
    ("Abigail Adams letter to John Adams (1776)", "Personal letter", "Urged lawmakers to remember women's rights in the new republic."),
    ("James Madison, Federalist No. 10 (1787)", "Political essay", "Explained how a large republic could control factions."),
    ("George Washington, Farewell Address (1796)", "Presidential address", "Warned against permanent foreign alliances and partisan excess."),
    ("Alexander Hamilton, Report on Manufactures (1791)", "Government report", "Proposed federal support for industry and internal improvements."),
    ("Marbury v. Madison opinion excerpt (1803)", "Supreme Court decision", "Established judicial review of federal laws."),
    ("Thomas Jefferson, letter on Louisiana Purchase (1803)", "Presidential correspondence", "Balanced strict construction with territorial expansion."),
    ("Andrew Jackson, message on Indian Removal (1830)", "Presidential message", "Framed removal as humanitarian and necessary for settlement."),
    ("Frederick Douglass, *Narrative* (1845)", "Autobiography", "Exposed violence and dehumanization of slavery."),
    ("Seneca Falls Declaration of Sentiments (1848)", "Reform declaration", "Demanded civil and political rights for women."),
    ("Dred Scott v. Sandford dissent excerpt (1857)", "Legal dissent", "Challenged the Court's restriction of African American citizenship."),
    ("Abraham Lincoln, Gettysburg Address (1863)", "Speech", "Redefined the war as a struggle for equality and union."),
    ("Freedmen's Bureau report (1866)", "Government report", "Documented education and labor needs after emancipation."),
    ("Andrew Carnegie, \"Wealth\" (1889)", "Essay", "Defended philanthropy while justifying industrial inequality."),
    ("Jacob Riis, *How the Other Half Lives* (1890)", "Photojournalism book", "Revealed urban poverty and overcrowded tenements."),
    ("Jane Addams, Hull House settlement report (1910)", "Reform report", "Linked social science research to immigrant welfare."),
    ("W.E.B. Du Bois, *The Souls of Black Folk* (1903)", "Essay collection", "Argued for civil rights and criticized accommodation."),
    ("Theodore Roosevelt, corollary to Monroe Doctrine (1904)", "Foreign policy statement", "Claimed U.S. police power in the Western Hemisphere."),
    ("Woodrow Wilson, Fourteen Points speech (1918)", "Wartime address", "Outlined idealistic goals for postwar peace."),
    ("Marcus Garvey, UNIA platform (1920s)", "Political platform", "Promoted Black economic nationalism and migration."),
    ("Herbert Hoover, statement on voluntary relief (1930)", "Government statement", "Stressed localism before New Deal expansion."),
    ("Franklin D. Roosevelt, First Inaugural Address (1933)", "Speech", "Promised action against the Depression and fear itself."),
    ("Eleanor Roosevelt, Universal Declaration advocacy (1948)", "Diplomatic correspondence", "Linked human rights to postwar reconstruction."),
    ("Harry Truman, Truman Doctrine speech (1947)", "Cold War address", "Committed aid to resist communist expansion."),
    ("Brown v. Board opinion excerpt (1954)", "Supreme Court decision", "Declared segregated schools inherently unequal."),
    ("Martin Luther King Jr., Letter from Birmingham Jail (1963)", "Open letter", "Defended nonviolent direct action for civil rights."),
    ("Betty Friedan, *The Feminine Mystique* (1963)", "Social critique", "Challenged postwar domestic ideals for women."),
]


def source_for_supplemental(n: int, question: str) -> tuple[str, str, str]:
    idx = (n - 1) % len(SUPPLEMENTAL_SOURCES)
    title, stype, excerpt = SUPPLEMENTAL_SOURCES[idx]
    return title, stype, excerpt


def default_dbq_sources(period: int, idx: int) -> list[dict]:
    base = PERIOD_LABELS.get(period, "APUSH")
    templates = [
        ("Primary source excerpt", "Historical document", f"Evidence from {base} illustrating social change."),
        ("Secondary historian analysis", "Scholarly interpretation", f"Historian explains a key debate in {base}."),
        ("Political speech excerpt", "Public address", "Leader articulates goals and assumptions of the era."),
        ("Legislative or legal text", "Government record", "Policy language reveals priorities and limits."),
        ("Personal letter or diary", "Private correspondence", "Individual experience complicates the narrative."),
        ("Statistical or economic report", "Quantitative source", "Data shows material conditions and trends."),
    ]
    out = []
    for i, (title, stype, excerpt) in enumerate(templates, 1):
        out.append(
            {
                "title": f"{title} — {base} (Doc {i})",
                "source": stype,
                "excerpt": excerpt,
                "fullText": excerpt,
            }
        )
    return out


def main() -> None:
    flat = re.sub(r"\s+", " ", load_pdf_text())
    frqs = parse_questions(
        slice_between(flat, r"100 Free Response Questions \(FRQs\)", r"100 Document-Based Questions"),
        100,
    )
    dbq_prompts = parse_questions(
        slice_between(flat, r"100 Document-Based Questions \(DBQs\)", r"SAQs\)|100 Short Answer"),
        100,
    )
    saq_questions = parse_questions(
        slice_between(flat, r"SAQs\)", r"Additional Notes|How to Use These"),
        100,
    )

    old_sources = load_existing_dbq_sources()
    dbqs = []
    for i, prompt in enumerate(dbq_prompts[:20], 1):
        period = period_for_index(i)
        sources = (
            old_sources[i - 1]
            if i - 1 < len(old_sources) and len(old_sources[i - 1]) >= 6
            else default_dbq_sources(period, i)
        )
        dbqs.append(
            {
                "id": f"dbq-{i:02d}",
                "period": period,
                "label": PERIOD_LABELS.get(period, f"Period {period}"),
                "prompt": prompt,
                "sources": sources[:6],
                "points": 7,
            }
        )

    leqs = []
    for i, prompt in enumerate(frqs[:20], 1):
        period = period_for_index(i)
        leqs.append(
            {
                "id": f"leq-{i:02d}",
                "period": min(period, 8),
                "prompt": prompt,
                "points": 6,
            }
        )

    saqs = []
    for i, question in enumerate(saq_questions[:100], 1):
        period = period_for_index(i)
        saqs.append(
            {
                "id": f"saq-{i:03d}",
                "period": min(period, 8),
                "prompt": "Short Answer Question",
                "question": question,
                "points": 3,
            }
        )

    supplemental = []
    skills = ["leq", "dbq", "saq", "mcq"]
    for i, question in enumerate(frqs[:100], 1):
        period = min(period_for_index(i), 8)
        title, stype, excerpt = source_for_supplemental(i, question)
        supplemental.append(
            {
                "id": f"sup-{i:03d}",
                "period": period,
                "skill": skills[(i - 1) % len(skills)],
                "question": question,
                "source": title,
                "sourceType": stype,
                "answerHint": f"Use evidence from the cited source and course themes for Period {period}. "
                f"Key idea: {excerpt}",
            }
        )

    bank = {"dbqs": dbqs, "leqs": leqs, "saqs": saqs, "supplemental": supplemental}
    OUT_PATH.write_text(
        "window.APUSH_PROMPT_BANK = "
        + json.dumps(bank, ensure_ascii=False, indent=2)
        + ";\n",
        encoding="utf-8",
    )
    print(
        f"Wrote {OUT_PATH.name}: {len(dbqs)} DBQs, {len(leqs)} LEQs, "
        f"{len(saqs)} SAQs, {len(supplemental)} supplemental"
    )


if __name__ == "__main__":
    main()
