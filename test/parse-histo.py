#!/usr/bin/env python3
import re
from datetime import datetime
from collections import defaultdict

APPS = {
    "oneticket-core": [("2026-05-27 09:50", "2026-06-05 17:34")],
    "appshell":       [("2026-05-29 08:12", "2026-05-29 20:28")],
    "breakout":       [("2026-05-31 01:02", "2026-06-03 09:39")],
    "monjournal":     [("2026-05-28 11:49", "2026-06-05 16:16")],
    "flashcards":     [("2026-06-07 06:23", "2026-06-07 14:50")],
    "spaceinvaders":  [("2026-05-31 18:17", "2026-06-08 11:52")],
}

def parse_app_ranges():
    return {app: [(datetime.strptime(s, "%Y-%m-%d %H:%M"), datetime.strptime(e, "%Y-%m-%d %H:%M"))
                  for s, e in periods] for app, periods in APPS.items()}

def find_apps(dt, ranges):
    return [app for app, periods in ranges.items() if any(s <= dt <= e for s, e in periods)]

def parse_date(date_str):
    months = {"janvier":1,"février":2,"mars":3,"avril":4,"mai":5,"juin":6,
              "juillet":7,"août":8,"septembre":9,"octobre":10,"novembre":11,"décembre":12}
    m = re.match(r'(\d+)\s+(\w+),\s+(\d+):(\d+)\s+(AM|PM)', date_str.strip())
    if not m: return None
    day, month, hour, minute, ampm = int(m.group(1)), months.get(m.group(2).lower()), int(m.group(3)), int(m.group(4)), m.group(5)
    if not month: return None
    if ampm == "PM" and hour != 12: hour += 12
    elif ampm == "AM" and hour == 12: hour = 0
    return datetime(2026, month, day, hour, minute)

def parse_cost(s):
    s = s.strip()
    m = re.match(r'\$([0-9.]+)', s)
    if m: return float(m.group(1))
    m = re.match(r'BYOK \(([0-9.]+)\s*\$\)', s)
    if m: return float(m.group(1))
    return 0.0

def main():
    ranges = parse_app_ranges()
    stats = defaultdict(lambda: defaultdict(lambda: {"ti":0,"to":0,"cost":0.0,"n":0}))
    unmatched = {"ti":0,"to":0,"cost":0.0,"n":0}

    with open("histo-opencode.txt", encoding="utf-8") as f:
        lines = f.readlines()

    # Reconstruire les enregistrements
    date_pat = re.compile(r'^\d+\s+\w+,\s+\d+:\d+\s+(AM|PM)')
    records, current = [], []
    for line in lines:
        ls = line.strip()
        if date_pat.match(ls):
            if current: records.append(current)
            current = [ls]
        elif ls and current:
            current.append(ls)
    if current: records.append(current)

    print(f"Enregistrements : {len(records)}")

    for rec in records:
        if len(rec) < 4: continue
        date_str = rec[0]
        model = rec[1] if len(rec) > 1 else ""
        nums, cost = [], 0.0
        for p in rec[2:]:
            p = p.strip()
            if re.match(r'^\$[0-9.]+$', p) or re.match(r'^BYOK', p):
                cost = parse_cost(p)
            elif re.match(r'^\d+$', p):
                nums.append(int(p))
        if len(nums) < 2: continue
        ti, to = nums[0], nums[1]
        dt = parse_date(date_str)
        if not dt: continue
        apps = find_apps(dt, ranges)
        if not apps:
            unmatched["ti"] += ti; unmatched["to"] += to; unmatched["cost"] += cost; unmatched["n"] += 1
        else:
            w = 1.0 / len(apps)
            for app in apps:
                stats[app][model]["ti"] += ti*w; stats[app][model]["to"] += to*w
                stats[app][model]["cost"] += cost*w; stats[app][model]["n"] += w

    print("\n" + "="*70)
    print("SYNTHÈSE PAR APP")
    print("="*70)
    total = 0.0
    for app in ["oneticket-core","appshell","breakout","monjournal","flashcards","spaceinvaders"]:
        s = stats.get(app, {})
        if not s: print(f"\n  {app.upper()} — aucune donnée"); continue
        print(f"\n  {app.upper()}")
        ati=ato=ac=0.0
        for model, d in sorted(s.items(), key=lambda x: -x[1]["cost"]):
            print(f"    {model:35s}  in:{int(d['ti']):>10,}  out:{int(d['to']):>7,}  ${d['cost']:6.2f}  ({int(d['n'])} req)")
            ati+=d["ti"]; ato+=d["to"]; ac+=d["cost"]
        total+=ac
        print(f"    {'TOTAL':35s}  in:{int(ati):>10,}  out:{int(ato):>7,}  ${ac:6.2f}")
    print(f"\n  NON ATTRIBUÉ  in:{unmatched['ti']:>10,}  out:{unmatched['to']:>7,}  ${unmatched['cost']:6.2f}  ({unmatched['n']} req)")
    print(f"\n{'='*70}\n  TOTAL GLOBAL : ${total:.2f}\n{'='*70}")

if __name__ == "__main__":
    main()
