"""
waste_reduction_impact.py
=========================
คำนวณผลกระทบจากโครงการลดขยะในนนทบุรี
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker
import matplotlib.font_manager as fm
import warnings

from statsmodels.tsa.holtwinters import ExponentialSmoothing

warnings.filterwarnings('ignore')

# ─────────────────────────────────────────────────────────────
# ตั้งค่าฟอนต์ภาษาไทย
# ─────────────────────────────────────────────────────────────

thai_fonts = [
    'Tahoma',
    'Leelawadee UI',
    'Leelawadee',
    'TH Sarabun New',
    'Browallia New',
    'Cordia New'
]

available_fonts = {f.name for f in fm.fontManager.ttflist}

selected_font = None
for font in thai_fonts:
    if font in available_fonts:
        selected_font = font
        break

if selected_font:
    plt.rcParams['font.family'] = selected_font
    print(f"✓ ใช้ฟอนต์ภาษาไทย: {selected_font}")
else:
    print("⚠ ไม่พบฟอนต์ภาษาไทย")

plt.rcParams['axes.unicode_minus'] = False

# ─────────────────────────────────────────────────────────────
# ตั้งค่า
# ─────────────────────────────────────────────────────────────

PROJECT_START = "2025-01"
FORECAST_MONTHS = 9
BASELINE_MONTHS = 12

MONTH_MAP = {
    "มกราคม": 1,
    "กุมภาพันธ์": 2,
    "มีนาคม": 3,
    "เมษายน": 4,
    "พฤษภาคม": 5,
    "มิถุนายน": 6,
    "กรกฎาคม": 7,
    "สิงหาคม": 8,
    "กันยายน": 9,
    "ตุลาคม": 10,
    "พฤศจิกายน": 11,
    "ธันวาคม": 12
}

# ─────────────────────────────────────────────────────────────
# Helper Functions
# ─────────────────────────────────────────────────────────────

def load_ts(csv, value_col):
    """โหลด CSV แล้วคืนค่าเป็น Time Series"""

    df = pd.read_csv(csv)
    df.columns = [c.strip() for c in df.columns]

    df["m"] = df["เดือน"].map(MONTH_MAP)

    df["date"] = pd.to_datetime(
        dict(
            year=df["ปี"] - 543,
            month=df["m"],
            day=1
        )
    )

    ts = (
        df.groupby("date")[value_col]
        .sum()
        .sort_index()
        .asfreq("MS")
        .interpolate()
    )

    return ts


def hw_forecast(ts, horizon):
    """Holt-Winters Forecast"""

    model = ExponentialSmoothing(
        ts,
        trend="add",
        seasonal="add",
        seasonal_periods=12
    ).fit(optimized=True)

    return model.forecast(horizon)


def backtest_mape(ts, holdout=12):

    train = ts.iloc[:-holdout]
    test = ts.iloc[-holdout:]

    pred = hw_forecast(train, holdout)

    mape = (
        np.abs(pred - test) / test
    ).mean() * 100

    return mape


# ─────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────

def main():

    # โหลดข้อมูล

    ts_community = load_ts(
        "clean_data/clean_community.csv",
        "ขยะมูลฝอยชุมชน(ตัน)"
    )

    ts_recycle = load_ts(
        "clean_data/clean_recycle.csv",
        "ขยะรีไซเคิลลงถัง(ตัน)"
    )

    ts_benefit = load_ts(
        "clean_data/clean_benefit.csv",
        "ขยะนำไปใช้ประโยชน์"
    )

    ts_wet = load_ts(
        "clean_data/clean_wet.csv",
        "ขยะอินทรีย์ลงถัง(ตัน)"
    )

    print("=" * 60)
    print("ข้อมูลที่โหลด")

    datasets_info = [
        ("ขยะชุมชน", ts_community),
        ("รีไซเคิล", ts_recycle),
        ("ใช้ประโยชน์", ts_benefit),
        ("อินทรีย์", ts_wet)
    ]

    for name, ts in datasets_info:
        print(
            f"{name}: "
            f"{ts.index.min():%Y-%m} ถึง "
            f"{ts.index.max():%Y-%m}"
        )

    # ประเมินโมเดล

    mape = backtest_mape(ts_community)

    print("\n" + "=" * 60)
    print(f"ค่า MAPE = {mape:.2f}%")

    # Forecast

    fc_community = hw_forecast(
        ts_community,
        FORECAST_MONTHS
    )

    fc_recycle = hw_forecast(
        ts_recycle,
        FORECAST_MONTHS
    )

    fc_benefit = hw_forecast(
        ts_benefit,
        FORECAST_MONTHS
    )

    fc_wet = hw_forecast(
        ts_wet,
        FORECAST_MONTHS
    )

    # Baseline

    baseline_avg = (
        ts_community
        .iloc[-BASELINE_MONTHS:]
        .mean()
    )

    baseline_recycle_avg = (
        ts_recycle
        .iloc[-BASELINE_MONTHS:]
        .mean()
    )

    print("\n" + "=" * 60)
    print("Baseline")

    print(
        f"ขยะชุมชนเฉลี่ย = "
        f"{baseline_avg:,.0f} ตัน/เดือน"
    )

    print(
        f"รีไซเคิลเฉลี่ย = "
        f"{baseline_recycle_avg:,.0f} ตัน/เดือน"
    )

    print("\nประมาณผลลัพธ์")

    for uplift in [5, 10, 20]:

        gain = (
            baseline_recycle_avg
            * uplift / 100
        )

        annual = gain * 12

        print(
            f"เพิ่มรีไซเคิล {uplift}% "
            f"→ ลดขยะ {gain:,.0f} ตัน/เดือน "
            f"(≈ {annual:,.0f} ตัน/ปี)"
        )

    # ───────────────────────────────
    # สร้างกราฟ
    # ───────────────────────────────

    fig, axes = plt.subplots(
        2,
        2,
        figsize=(15, 10)
    )

    fig.suptitle(
        "การวิเคราะห์ผลกระทบจากโครงการลดขยะ จังหวัดนนทบุรี",
        fontsize=16,
        fontweight="bold"
    )

    datasets = [

        (
            ts_community,
            fc_community,
            "ปริมาณขยะมูลฝอยชุมชน (ตัน)",
            axes[0, 0]
        ),

        (
            ts_recycle,
            fc_recycle,
            "ปริมาณขยะรีไซเคิล (ตัน)",
            axes[0, 1]
        ),

        (
            ts_benefit,
            fc_benefit,
            "ปริมาณขยะที่นำไปใช้ประโยชน์ (ตัน)",
            axes[1, 0]
        ),

        (
            ts_wet,
            fc_wet,
            "ปริมาณขยะอินทรีย์ (ตัน)",
            axes[1, 1]
        )
    ]

    for ts_plot, fc_plot, title, ax in datasets:

        ts_plot.plot(
            ax=ax,
            label="ข้อมูลจริง",
            linewidth=2
        )

        fc_plot.plot(
            ax=ax,
            linestyle="--",
            marker="o",
            markersize=4,
            label="ค่าพยากรณ์"
        )

        ax.axvline(
            pd.Timestamp(PROJECT_START),
            color="green",
            linestyle=":",
            linewidth=2,
            label="เริ่มโครงการ"
        )

        ax.set_title(
            title,
            fontsize=11
        )

        ax.set_xlabel("ปี")
        ax.set_ylabel("ปริมาณ (ตัน)")

        ax.yaxis.set_major_formatter(
            mticker.FuncFormatter(
                lambda x, _: f"{x:,.0f}"
            )
        )

        ax.grid(alpha=0.3)

        ax.legend()

    plt.tight_layout()

    plt.savefig(
        "waste_reduction_impact.png",
        dpi=300,
        bbox_inches="tight"
    )

    plt.show()

    print("\n✓ บันทึกกราฟเรียบร้อย")
    print("ไฟล์: waste_reduction_impact.png")


if __name__ == "__main__":
    main()