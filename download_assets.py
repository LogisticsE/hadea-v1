#!/usr/bin/env python3
"""
Tandarts Heusden - Automatische Asset Downloader
Download alle logo's, iconen en branding materialen
"""

import requests
import os
from pathlib import Path

# Configuratie
OUTPUT_DIR = "tandartsheusden_assets"
BASE_CDN = "https://cdn.prod.website-files.com/5e6f37f339a73bc0feb8f81e"

# Alle assets met beschrijvende namen
ASSETS = {
    # Logo
    "logo-tandarts-heusden.svg": "5e6f37f339a73b197db8f86a_logo-TH-RGB-diap-lijn%2Btekst.svg",
    
    # Behandeling iconen
    "icoon-mondhygiene.svg": "5e6f37f339a73b025eb8f9e1_iconen-TH-mondhygiene.svg",
    "icoon-periodieke-controle.svg": "5e6f37f339a73b9b9fb8f980_iconen-TH-periodieke-controle.svg",
    "icoon-orthodontie.svg": "5e6f37f339a73bead5b8f9bc_iconen-TH-orthodontie.svg",
    "icoon-zenuwkanaal.svg": "5e6f37f339a73bb89ab8f9ce_iconen-TH-zenuwkanaal.svg",
    "icoon-vullingen.svg": "5e6f37f339a73b9c7eb8f9b9_iconen-TH-vullingen.svg",
    "icoon-tanden-bleken.svg": "5e6f37f339a73b3ac0b8f973_iconen-TH-tanden-bleken.svg",
    "icoon-kronen.svg": "5e6f37f339a73be65db8f9ba_iconen-TH-kronen.svg",
    "icoon-implantaten.svg": "5e6f37f339a73bb1b9b8f978_iconen-TH-implantaten.svg",
    "icoon-digital-smile-design.svg": "5e6f37f339a73b3ceab8f98e_iconen-TH-digital-smile-design.svg",
    
    # Social media
    "social-facebook.png": "5e6f37f339a73ba8b2b8f880_Icon-facebook.png",
    "social-instagram.svg": "5e6f37f339a73ba4e0b8f891_instagram.svg",
    "social-twitter.png": "5e6f37f339a73befa9b8f8bd_Icon-twitter.png",
    
    # Documenten
    "inschrijfformulier.pdf": "677d28f5f0083027ef59f5e1_8e4075182fb6b1e429b0e9fd22a2fc78_TH-inschrijfformulier.pdf",
}

def download_asset(filename, cdn_path):
    """Download een enkel asset"""
    url = f"{BASE_CDN}/{cdn_path}"
    output_path = Path(OUTPUT_DIR) / filename
    
    try:
        print(f"📥 Downloading: {filename}...", end=" ")
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        
        # Schrijf bestand
        output_path.write_bytes(response.content)
        
        # Check bestandsgrootte
        size_kb = len(response.content) / 1024
        print(f"✅ Done ({size_kb:.1f} KB)")
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Failed: {e}")
        return False

def main():
    """Hoofdfunctie"""
    print("=" * 60)
    print("🦷 TANDARTS HEUSDEN - ASSET DOWNLOADER")
    print("=" * 60)
    print()
    
    # Maak output directory
    Path(OUTPUT_DIR).mkdir(exist_ok=True)
    print(f"📁 Output directory: {OUTPUT_DIR}")
    print()
    
    # Download alle assets
    success_count = 0
    total_count = len(ASSETS)
    
    for filename, cdn_path in ASSETS.items():
        if download_asset(filename, cdn_path):
            success_count += 1
    
    # Samenvatting
    print()
    print("=" * 60)
    print(f"📊 RESULTAAT: {success_count}/{total_count} bestanden gedownload")
    print("=" * 60)
    
    if success_count == total_count:
        print("✅ Alle assets succesvol gedownload!")
    else:
        print(f"⚠️  {total_count - success_count} bestanden gefaald")
    
    print()
    print(f"📂 Bestanden opgeslagen in: {Path(OUTPUT_DIR).absolute()}")
    print()
    print("💡 TIP: Maak een backup van deze map!")
    print()

if __name__ == "__main__":
    main()
