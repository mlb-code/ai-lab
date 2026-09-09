#!/usr/bin/env python3
"""מפרסם תשובות לתגובות אחרי אישור מאיר ב-Issue של הדוח היומי.
ENV: META_ACCESS_TOKEN, ISSUE_BODY (גוף ה-Issue עם COMMENTS_JSON), COMMENT_BODY (התגובה של מאיר).
פורמט: "אשר 1 3" | "אשר הכל" | "אשר 2: טקסט מותאם". מדפיס סיכום.
"""
import os, re, json, requests
API = "https://graph.facebook.com/v21.0"; TOKEN = os.environ["META_ACCESS_TOKEN"]
body = os.environ.get("ISSUE_BODY", ""); cmd = os.environ.get("COMMENT_BODY", "").strip()
m = re.search(r"<!-- COMMENTS_JSON (.*?) -->", body, re.S)
if not m or not cmd.startswith("אשר"): print("nothing to do"); raise SystemExit(0)
todo = json.loads(m.group(1))
custom = {}
for line in cmd.splitlines():
    mm = re.match(r"אשר\s+(\d+)\s*:\s*(.+)", line.strip())
    if mm: custom[int(mm.group(1))] = mm.group(2).strip()
if "הכל" in cmd: nums = list(range(1, len(todo) + 1))
else: nums = sorted({int(x) for x in re.findall(r"\d+", cmd.split("\n")[0])} | set(custom))
done = []
for n in nums:
    if not 1 <= n <= len(todo): continue
    it = todo[n - 1]; text = custom.get(n) or it.get("reply")
    if not text: continue
    if it["net"] == "fb":
        r = requests.post(f"{API}/{it['id']}/comments", data={"message": text, "access_token": TOKEN}, timeout=60).json()
    else:
        r = requests.post(f"{API}/{it['id']}/replies", data={"message": text, "access_token": TOKEN}, timeout=60).json()
    done.append(f"{'✅' if 'id' in r else '❌'} {n} ({it['net'].upper()} · {it['who']}): {text[:60]}" + ("" if "id" in r else f" — {r}"))
print("\n".join(done) if done else "לא נמצאו מספרים לאישור.")
