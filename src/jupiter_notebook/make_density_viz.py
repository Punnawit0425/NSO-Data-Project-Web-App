# -*- coding: utf-8 -*-
"""สร้างกราฟความหนาแน่นประชากรรายอำเภอ จังหวัดนนทบุรี ปี 2566
อ่านข้อมูลจาก clean_data/clean_population.csv แล้วเซฟรูปลงโฟลเดอร์ visualization
"""
from pathlib import Path

import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker

# --- ที่อยู่ไฟล์ (อ้างอิงจากตำแหน่งสคริปต์ ไม่ขึ้นกับ working directory) ---
ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "clean_data" / "clean_population.csv"
OUT_DIR = ROOT / "visualization"
OUT_DIR.mkdir(exist_ok=True)

# --- โหลดข้อมูล ---
df = pd.read_csv(SRC, index_col=0)
density = (
    df[df["อำเภอ"] != "รวมยอด"]
    .assign(อำเภอ=lambda d: d["อำเภอ"].str.replace("อำเภอ", "", regex=False))
    .sort_values("ความหนาแน่นประชากร_2566", ascending=True)
    .reset_index(drop=True)
)
province_avg = df.loc[df["อำเภอ"] == "รวมยอด", "ความหนาแน่นประชากร_2566"].iloc[0]

# --- ตั้งค่าหน้าตา ---
plt.rcParams.update({
    "font.family": "Tahoma",          # ฟอนต์รองรับภาษาไทยบน Windows
    "axes.unicode_minus": False,
    "figure.dpi": 120,
})

fig, ax = plt.subplots(figsize=(11, 6.5))
fig.patch.set_facecolor("white")
ax.set_facecolor("white")

# ไล่เฉดสีตามค่าความหนาแน่น (เข้ม = หนาแน่นมาก)
cmap = plt.cm.YlOrRd
norm = plt.Normalize(density["ความหนาแน่นประชากร_2566"].min() * 0.6,
                     density["ความหนาแน่นประชากร_2566"].max())
colors = [cmap(norm(v)) for v in density["ความหนาแน่นประชากร_2566"]]

bars = ax.barh(
    density["อำเภอ"],
    density["ความหนาแน่นประชากร_2566"],
    color=colors, edgecolor="white", linewidth=0.8, zorder=3,
)

# กำกับค่าพร้อมหน่วยที่ปลายแท่ง
for bar, value in zip(bars, density["ความหนาแน่นประชากร_2566"]):
    ax.text(
        value + ax.get_xlim()[1] * 0.012,
        bar.get_y() + bar.get_height() / 2,
        f"{value:,.0f} คน/ตร.กม.",
        va="center", ha="left", fontsize=10.5, color="#333333", fontweight="bold",
    )

# เส้นค่าเฉลี่ยทั้งจังหวัด
ax.axvline(province_avg, color="#1f77b4", linestyle="--", linewidth=1.4, zorder=2)
ax.text(province_avg, len(density) - 0.35,
        f"ค่าเฉลี่ยทั้งจังหวัด {province_avg:,.0f}",
        color="#1f77b4", fontsize=9.5, ha="center", va="bottom", fontweight="bold")

# แต่งแกน
ax.set_title("ความหนาแน่นประชากรรายอำเภอ จังหวัดนนทบุรี ปี 2566",
             fontsize=16, fontweight="bold", pad=16, color="#222222")
ax.set_xlabel("ความหนาแน่นประชากร (คน/ตร.กม.)", fontsize=12, labelpad=10)
ax.set_ylabel("")
ax.xaxis.set_major_formatter(mticker.StrMethodFormatter("{x:,.0f}"))
ax.margins(x=0.22)
ax.grid(axis="x", linestyle=":", alpha=0.5, zorder=0)
for spine in ["top", "right"]:
    ax.spines[spine].set_visible(False)
ax.tick_params(labelsize=11)

fig.text(0.01, -0.01, "ที่มา: clean_data/clean_population.csv",
         fontsize=8.5, color="gray", ha="left")

plt.tight_layout()
out_path = OUT_DIR / "ความหนาแน่นประชากร_นนทบุรี_2566.png"
fig.savefig(out_path, bbox_inches="tight", facecolor=fig.get_facecolor())
print("saved:", out_path.name.encode("ascii", "backslashreplace").decode())
