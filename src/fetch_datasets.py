"""
Re-download the public training datasets (they are gitignored, not committed).

Run this once after cloning, before train_risk_models.py:
    cd src && python3 fetch_datasets.py

Sources (public, research/education use — verify licenses before redistribution):
  * PCOS — Kaggle "Polycystic Ovary Syndrome (PCOS)" (Prasoon Kottarathil), mirrored at
    github.com/chenw-3/pcos-analysis.
  * Endometriosis — self-report symptom dataset (Scientific Reports, 2023), mirrored at
    github.com/TristanLecourtois/endodetect-based-on-symptoms.
"""

from pathlib import Path
import urllib.request

DATA = Path(__file__).resolve().parent.parent / "data" / "datasets"
DATA.mkdir(parents=True, exist_ok=True)

FILES = {
    "pcos_raw.csv":
        "https://raw.githubusercontent.com/chenw-3/pcos-analysis/main/pcos_clean.csv",
    "endometriosis_raw.xlsx":
        "https://raw.githubusercontent.com/TristanLecourtois/"
        "endodetect-based-on-symptoms/main/data/dataset.xlsx",
}


def main():
    for name, url in FILES.items():
        dest = DATA / name
        print(f"↓ {name} ...", end=" ", flush=True)
        try:
            urllib.request.urlretrieve(url, dest)
            print(f"ok ({dest.stat().st_size} bytes)")
        except Exception as e:
            print(f"FAILED: {e}\n  Try the Kaggle source in the module docstring.")
    print("Done. Now run: python3 train_risk_models.py")


if __name__ == "__main__":
    main()
