#!/usr/bin/env python3
"""
Generate files.js - run this once before deploying to Netlify
No backend needed on Netlify - this just creates a static JS file
"""
import json
import os

DELETE_HEIC = os.environ.get("DELETE_HEIC", "").strip() == "1"

def _try_enable_heic_support():
    try:
        from pillow_heif import register_heif_opener  # type: ignore
        register_heif_opener()
        return True
    except Exception:
        return False

def _convert_heic_to_jpg(in_path: str) -> str:
    """Convert a .heic image to .jpg next to it.

    Returns the path that should be used in files.js (either the converted .jpg
    if successful / already exists, or the original in_path if conversion isn't
    possible).
    """
    base, _ = os.path.splitext(in_path)
    out_path = base + ".jpg"

    if os.path.exists(out_path):
        if DELETE_HEIC:
            try:
                os.remove(in_path)
                print(f"Deleted original HEIC (JPG already exists): {in_path}")
            except Exception:
                pass
        return out_path

    try:
        from PIL import Image  # type: ignore

        img = Image.open(in_path)
        if getattr(img, "mode", None) in ("RGBA", "LA"):
            img = img.convert("RGB")
        img.save(out_path, format="JPEG", quality=90, optimize=True)
        if DELETE_HEIC:
            try:
                os.remove(in_path)
                print(f"Deleted original HEIC after conversion: {in_path}")
            except Exception:
                pass
        return out_path
    except Exception:
        return in_path

def _normalize_asset_path(p: str) -> str:
    # Ensure forward slashes for the website paths.
    return p.replace("\\", "/")

def _process_asset_file(path: str, heic_enabled: bool) -> str:
    if heic_enabled and path.lower().endswith(".heic"):
        path = _convert_heic_to_jpg(path)
    return _normalize_asset_path(path)

def get_files():
    structure = {"images": [], "videos": [], "audio": [], "extras": {}}

    heic_enabled = _try_enable_heic_support()
    if not heic_enabled:
        print("Note: HEIC conversion disabled (install 'Pillow' and 'pillow-heif' to batch-convert HEIC to JPG).")
    elif DELETE_HEIC:
        print("Note: DELETE_HEIC=1 enabled (original .HEIC files will be deleted only after a .jpg exists).")
    
    # Images - support all image formats AND MOV files in Image folder
    if os.path.exists("Assets/Image"):
        structure["images"] = []
        for f in os.listdir("Assets/Image"):
            if f.lower().endswith(('.jpg','.jpeg','.png','.gif','.webp','.heic','.bmp','.svg','.mov')):
                structure["images"].append(
                    _process_asset_file(os.path.join("Assets", "Image", f), heic_enabled)
                )
    
    # Videos - support all video formats
    if os.path.exists("Assets/Video"):
        structure["videos"] = []
        for f in os.listdir("Assets/Video"):
            if f.lower().endswith(('.mp4','.avi','.mov','.mkv','.webm','.heic','.mpeg')):
                structure["videos"].append(_normalize_asset_path(os.path.join("Assets", "Video", f)))
    
    # Audio - support all audio formats including mpeg
    if os.path.exists("Assets/Voice"):
        structure["audio"] = []
        for f in os.listdir("Assets/Voice"):
            if f.lower().endswith(('.mp3','.wav','.ogg','.m4a','.flac','.mpeg')):
                structure["audio"].append(_normalize_asset_path(os.path.join("Assets", "Voice", f)))
    
    # Extras - include ALL files (no extension filtering)
    if os.path.exists("Assets/Extras"):
        for folder in os.listdir("Assets/Extras"):
            folder_path = f"Assets/Extras/{folder}"
            if os.path.isdir(folder_path):
                # Include ALL files in Extras
                all_files = []
                for f in os.listdir(folder_path):
                    if not f.startswith('.'):
                        all_files.append(
                            _process_asset_file(os.path.join(folder_path, f), heic_enabled)
                        )
                structure["extras"][folder] = all_files
                print(f"Debug: {folder} found {len(all_files)} files")
    
    return structure

data = get_files()

# Write as JavaScript file - no backend needed!
with open("files.js", "w") as f:
    f.write("// Auto-generated file list - no backend needed!\n")
    f.write("const FILES = ")
    f.write(json.dumps(data, indent=2))
    f.write(";\n")

print(f"Generated files.js:")
print(f"  Images: {len(data['images'])}")
print(f"  Videos: {len(data['videos'])}")
print(f"  Audio: {len(data['audio'])}")
extras_total = sum(len(files) for files in data['extras'].values())
print(f"  Extras files: {extras_total} in {len(data['extras'])} categories")
print(f"\nDeploy to Netlify: index.html + files.js + Assets/")
