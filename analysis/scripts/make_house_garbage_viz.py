# -*- coding: utf-8 -*-
"""The "more people (housing) -> more waste" relationship by district, Nonthaburi Province
ความสัมพันธ์ "คน(ที่อยู่อาศัย)เยอะ -> ขยะเยอะ" รายอำเภอ จังหวัดนนทบุรี

Easy-to-read version: data aggregated to district level (6 districts) and shown as a combined chart
แบบอ่านง่าย: รวมข้อมูลเป็นระดับอำเภอ (6 อำเภอ) แล้วแสดงเป็นกราฟผสม
  - Bars = population (a proxy for the amount of housing/homes)
  - Line = total municipal solid waste for the year (tonnes)
  - แท่ง = จำนวนประชากร (ตัวแทนปริมาณที่อยู่อาศัย/บ้านเยอะ)
  - เส้น = ปริมาณขยะมูลฝอยชุมชนรวมทั้งปี (ตัน)
Sorted from most to least populous — both values decline together
เรียงจากประชากรมากไปน้อย จะเห็นว่าทั้งสองค่าลดหลั่นไปด้วยกัน

Note: there is no direct "number of housing estates" data, and the household data
(clean_store) does not cover every local government, so "population by district"
(clean_population), which covers all 6 districts, is used as a proxy for housing
หมายเหตุ: ไม่มีข้อมูล "จำนวนหมู่บ้านจัดสรร" โดยตรง และข้อมูลครัวเรือน
(clean_store) ครอบคลุมไม่ครบทุก อปท. จึงใช้ "จำนวนประชากรรายอำเภอ"
(clean_population) ซึ่งครบทั้ง 6 อำเภอ เป็นตัวแทนปริมาณที่อยู่อาศัย
"""
from pathlib import Path

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "figures"
OUT_DIR.mkdir(exist_ok=True)

YEAR = 2563

# --- Population by district (proxy for "lots of housing/homes") ---
# --- จำนวนประชากร รายอำเภอ (ตัวแทน "ที่อยู่อาศัย/บ้านเยอะ") ---
pop = pd.read_csv(ROOT / "data" / "clean" / "clean_population.csv", index_col=0)
pop = pop[pop["อำเภอ"] != "รวมยอด"].copy()
pop["อำเภอ"] = pop["อำเภอ"].str.replace("อำเภอ", "", regex=False)
people = pop[["อำเภอ", f"ประชากร_{YEAR}"]] \
    .rename(columns={f"ประชากร_{YEAR}": "ประชากร"})

# --- Total municipal solid waste for the year, by district ---
# --- ปริมาณขยะมูลฝอยชุมชนรวมทั้งปี รายอำเภอ ---
comm = pd.read_csv(ROOT / "data" / "clean" / "clean_community.csv", index_col=0)
comm = comm[comm["ปี"] == YEAR]
garbage = comm.groupby("อำเภอ", as_index=False)["ขยะมูลฝอยชุมชน(ตัน)"].sum() \
              .rename(columns={"ขยะมูลฝอยชุมชน(ตัน)": "ขยะ_ตันต่อปี"})

df = people.merge(garbage, on="อำเภอ", how="inner") \
           .sort_values("ประชากร", ascending=False).reset_index(drop=True)
labels = df["อำเภอ"]

# --- Styling ---
# --- หน้าตา ---
plt.rcParams.update({
    "font.family": "Tahoma",
    "axes.unicode_minus": False,
    "figure.dpi": 120,
})

fig, ax1 = plt.subplots(figsize=(11, 6.5))
fig.patch.set_facecolor("white")
ax1.set_facecolor("white")
x = np.arange(len(df))

# Bars = population (left axis)
# แท่ง = ประชากร (แกนซ้าย)
bars = ax1.bar(x, df["ประชากร"], width=0.62,
               color="#4C9BE0", edgecolor="white", linewidth=1, zorder=3,
               label="จำนวนประชากร")
ax1.set_ylabel("จำนวนประชากร (คน)", fontsize=12, color="#1f6fb2", labelpad=10)
ax1.tick_params(axis="y", labelcolor="#1f6fb2")
ax1.yaxis.set_major_formatter(mticker.StrMethodFormatter("{x:,.0f}"))
for xi, v in zip(x, df["ประชากร"]):
    ax1.text(xi, v, f"{v:,.0f}", ha="center", va="bottom",
             fontsize=9.5, color="#1f6fb2", fontweight="bold")

# Line = waste (right axis)
# เส้น = ขยะ (แกนขวา)
ax2 = ax1.twinx()
ax2.plot(x, df["ขยะ_ตันต่อปี"], color="#E8632A", marker="o", markersize=9,
         linewidth=2.6, zorder=4, label="ปริมาณขยะ (ตัน/ปี)")
ax2.set_ylabel("ปริมาณขยะมูลฝอยชุมชน (ตัน/ปี)", fontsize=12, color="#c24a18", labelpad=10)
ax2.tick_params(axis="y", labelcolor="#c24a18")
ax2.yaxis.set_major_formatter(mticker.StrMethodFormatter("{x:,.0f}"))
for xi, v in zip(x, df["ขยะ_ตันต่อปี"]):
    ax2.text(xi, v, f"  {v:,.0f}", ha="left", va="center",
             fontsize=9.5, color="#c24a18", fontweight="bold")

ax1.set_xticks(x)
ax1.set_xticklabels(labels, fontsize=11.5)
ax1.set_title(f"คน(ที่อยู่อาศัย)ยิ่งเยอะ ขยะยิ่งเยอะ — รายอำเภอ จังหวัดนนทบุรี ปี {YEAR}",
              fontsize=15.5, fontweight="bold", pad=16, color="#222222")
ax1.set_ylim(0, df["ประชากร"].max() * 1.15)
ax2.set_ylim(0, df["ขยะ_ตันต่อปี"].max() * 1.15)
ax1.grid(axis="y", linestyle=":", alpha=0.45, zorder=0)
for ax in (ax1, ax2):
    ax.spines["top"].set_visible(False)

# Combined legend for both axes
# legend รวมสองแกน
h1, l1 = ax1.get_legend_handles_labels()
h2, l2 = ax2.get_legend_handles_labels()
ax1.legend(h1 + h2, l1 + l2, loc="upper right", fontsize=10.5, frameon=True, framealpha=0.9)

fig.text(0.01, -0.02,
         "ที่มา: data/clean/clean_population.csv (ประชากร) + data/clean/clean_community.csv (ขยะ)  "
         "| ใช้จำนวนประชากรเป็นตัวแทนปริมาณที่อยู่อาศัย",
         fontsize=8.5, color="gray", ha="left")

plt.tight_layout()
out_path = OUT_DIR / "คนเยอะขยะเยอะ_รายอำเภอ_นนทบุรี_2563.png"
fig.savefig(out_path, bbox_inches="tight", facecolor=fig.get_facecolor())
print("saved:", out_path.name.encode("ascii", "backslashreplace").decode())
