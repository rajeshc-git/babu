#!/usr/bin/env python3
"""
Generate optimized thumbnails for all images in the memorial gallery.
Creates a 'thumbs' subfolder next to each image with compressed, resized versions.
Thumbnails are 380px on the longest side (crisp on Retina screens) with high-efficiency compression.
"""
import os
import sys
import json
from PIL import Image, ImageOps

THUMB_MAX = 380  # 380px ensures crisp 2x Retina display quality while keeping files ~12-18KB
THUMB_QUALITY = 78
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.heic'}

def get_all_image_paths():
    """Collect all image paths from Assets."""
    paths = []
    
    # Main images
    image_dir = os.path.join(BASE_DIR, 'Assets', 'Image')
    if os.path.isdir(image_dir):
        for f in os.listdir(image_dir):
            ext = os.path.splitext(f)[1].lower()
            if ext in IMAGE_EXTENSIONS:
                paths.append(os.path.join('Assets', 'Image', f))
    
    # Extras subdirectories
    extras_dir = os.path.join(BASE_DIR, 'Assets', 'Extras')
    if os.path.isdir(extras_dir):
        for cat in os.listdir(extras_dir):
            cat_path = os.path.join(extras_dir, cat)
            if os.path.isdir(cat_path):
                for f in os.listdir(cat_path):
                    ext = os.path.splitext(f)[1].lower()
                    if ext in IMAGE_EXTENSIONS:
                        paths.append(os.path.join('Assets', 'Extras', cat, f))
    
    # Favicon
    favicon = os.path.join(BASE_DIR, 'Assets', 'favicon.PNG')
    if os.path.isfile(favicon):
        paths.append(os.path.join('Assets', 'favicon.PNG'))
    
    return paths


def generate_thumbnail(src_rel_path, force=False):
    """Generate a thumbnail for a single image. Returns the thumbnail relative path."""
    src_abs = os.path.join(BASE_DIR, src_rel_path)
    if not os.path.isfile(src_abs):
        print(f"  SKIP (not found): {src_rel_path}")
        return None
    
    # Build thumbnail path: insert 'thumbs' folder
    dir_part = os.path.dirname(src_rel_path)
    filename = os.path.basename(src_rel_path)
    name_no_ext = os.path.splitext(filename)[0]
    
    thumb_dir = os.path.join(BASE_DIR, dir_part, 'thumbs')
    os.makedirs(thumb_dir, exist_ok=True)
    
    thumb_filename = f"{name_no_ext}_thumb.jpg"
    thumb_abs = os.path.join(thumb_dir, thumb_filename)
    thumb_rel = os.path.join(dir_part, 'thumbs', thumb_filename).replace('\\', '/')
    
    # Skip if thumbnail already exists and is newer than source (unless force=True)
    if not force and os.path.isfile(thumb_abs) and os.path.getmtime(thumb_abs) >= os.path.getmtime(src_abs):
        return thumb_rel
    
    try:
        with Image.open(src_abs) as img:
            # Auto-orient based on EXIF
            img = ImageOps.exif_transpose(img)

            # Convert to RGB
            if img.mode in ('RGBA', 'P', 'LA'):
                img = img.convert('RGB')
            elif img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Resize maintaining aspect ratio
            img.thumbnail((THUMB_MAX, THUMB_MAX), Image.LANCZOS)
            
            # Save progressive optimized JPEG
            img.save(thumb_abs, 'JPEG', quality=THUMB_QUALITY, optimize=True, progressive=True)
            
        return thumb_rel
    except Exception as e:
        print(f"  ERROR: {src_rel_path} -> {e}")
        return None


def main():
    force = '--force' in sys.argv or '-f' in sys.argv
    print(f"=== Memorial Gallery High-DPI Thumbnail Generator (Force={force}) ===")
    paths = get_all_image_paths()
    print(f"Found {len(paths)} images to process.\n")
    
    thumb_map = {}
    success = 0
    failed = 0
    
    for i, p in enumerate(paths, 1):
        p_normalized = p.replace('\\', '/')
        thumb_path = generate_thumbnail(p, force=force)
        if thumb_path:
            thumb_map[p_normalized] = thumb_path
            success += 1
        else:
            failed += 1
    
    # Write thumbnail mapping as JS file
    js_path = os.path.join(BASE_DIR, 'thumbs_map.js')
    with open(js_path, 'w', encoding='utf-8') as f:
        f.write('// Auto-generated thumbnail mapping\n')
        f.write('const THUMBS = ')
        json.dump(thumb_map, f, indent=2)
        f.write(';\n')
    
    print(f"\n=== Done! ===")
    print(f"  Success: {success}")
    print(f"  Failed:  {failed}")
    print(f"  Mapping: {js_path}")


if __name__ == '__main__':
    main()
