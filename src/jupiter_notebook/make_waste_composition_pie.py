# -*- coding: utf-8 -*-
"""องค์ประกอบมูลฝอย (ขยะมูลฝอย) จังหวัดนนทบุรี — แสดงเป็นแผนภูมิวงกลม (Pie chart)

ใช้คอลัมน์ "ร้อยละ" (สัดส่วนเฉลี่ยของแต่ละองค์ประกอบมูลฝอยจากทุก อปท.)
องค์ประกอบที่มีสัดส่วนน้อย (< 2%) จะถูกรวมเป็น "อื่นๆ" เพื่อให้อ่านง่าย
"""
from pathlib import Path

import pandas as pd
import matplotlib.pyplot as plt

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "visualization"
OUT_DIR.mkdir(exist_ok=True)

SRC = ROOT / "clean_data" / "ประเภทมูลฝอย - ตารางองค์ประกอบมูลฝอย_เลขอังกฤษ.csv"
df = pd.read_csv(SRC)

# --- เลือกเฉพาะแถวที่เป็นองค์ประกอบมูลฝอย (ตัดแถวสรุป "รวม.." และ "ร้อยละ") ---
comp_col = "องค์ประกอบมูลฝอย"
mask = ~df[comp_col].str.contains("รวม|ร้อยละ", na=False)
comp = df.loc[mask, [comp_col, "ร้อยละ"]].dropna().copy()
comp = comp.sort_values("ร้อยละ", ascending=False).reset_index(drop=True)

# --- รวมชิ้นเล็ก (< 2%) เป็น "อื่นๆ" ---
THRESHOLD = 2.0
big = comp[comp["ร้อยละ"] >= THRESHOLD].copy()
small = comp[comp["ร้อยละ"] < THRESHOLD]
if not small.empty:
    other = pd.DataFrame({comp_col: ["อื่นๆ (รวมส่วนน้อย)"],
                          "ร้อยละ": [small["ร้อยละ"].sum()]})
    plot_df = pd.concat([big, other], ignore_index=True)
else:
    plot_df = big

labels = plot_df[comp_col].tolist()
sizes = plot_df["ร้อยละ"].tolist()

# --- หน้าตา ---
plt.rcParams.update({
    "font.family": "Tahoma",
    "axes.unicode_minus": False,
    "figure.dpi": 120,
})

colors = plt.cm.tab20.colors
explode = [0.06 if i == 0 else 0.0 for i in range(len(sizes))]  # เน้นชิ้นใหญ่สุด

fig, ax = plt.subplots(figsize=(10, 8))
fig.patch.set_facecolor("white")

wedges, texts, autotexts = ax.pie(
    sizes,
    labels=labels,
    autopct=lambda p: f"{p:.1f}%",
    startangle=90,
    counterclock=False,
    colors=colors[:len(sizes)],
    explode=explode,
    pctdistance=0.78,
    wedgeprops={"edgecolor": "white", "linewidth": 1.5},
    textprops={"fontsize": 11},
)
for at in autotexts:
    at.set_fontsize(10)
    at.set_fontweight("bold")
    at.set_color("#222222")

ax.set_title("องค์ประกอบมูลฝอย (ขยะมูลฝอย) จังหวัดนนทบุรี — สัดส่วนเฉลี่ย",
             fontsize=16, fontweight="bold", pad=18, color="#222222")
ax.axis("equal")

fig.text(0.01, 0.01,
         "ที่มา: clean_data/ประเภทมูลฝอย - ตารางองค์ประกอบมูลฝอย_เลขอังกฤษ.csv  "
         "| ใช้คอลัมน์ 'ร้อยละ' (เฉลี่ยทุก อปท.) | รวมส่วนที่ < 2% เป็น 'อื่นๆ'",
         fontsize=8.5, color="gray", ha="left")

plt.tight_layout()
out_path = OUT_DIR / "องค์ประกอบมูลฝอย_pie_นนทบุรี.png"
fig.savefig(out_path, bbox_inches="tight", facecolor=fig.get_facecolor())
print("saved:", out_path.name.encode("ascii", "backslashreplace").decode())
