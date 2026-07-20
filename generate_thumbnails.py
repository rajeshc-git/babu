"""
Generate low-resolution thumbnails for all images in the memorial gallery.
Creates a 'thumbs' subfolder next to each image with compressed, resized versions.
Thumbnails are max 200px on the longest side, JPEG quality 60.
"""
import os
import json
from PIL import Image

THUMB_MAX = 200  # max pixels on longest side
THUMB_QUALITY = 60
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'}

def get_all_image_paths():
    """Collect all image paths from files.js data."""
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


def generate_thumbnail(src_rel_path):
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
    
    # Skip if thumbnail already exists and is newer than source
    if os.path.isfile(thumb_abs) and os.path.getmtime(thumb_abs) >= os.path.getmtime(src_abs):
        return thumb_rel
    
    try:
        with Image.open(src_abs) as img:
            # Convert to RGB if necessary (for PNG with alpha, etc.)
            if img.mode in ('RGBA', 'P', 'LA'):
                img = img.convert('RGB')
            elif img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Auto-orient based on EXIF
            from PIL import ImageOps
            img = ImageOps.exif_transpose(img)
            
            # Resize maintaining aspect ratio
            img.thumbnail((THUMB_MAX, THUMB_MAX), Image.LANCZOS)
            
            # Save as JPEG
            img.save(thumb_abs, 'JPEG', quality=THUMB_QUALITY, optimize=True)
            
        return thumb_rel
    except Exception as e:
        print(f"  ERROR: {src_rel_path} -> {e}")
        return None


def main():
    print("=== Memorial Gallery Thumbnail Generator ===")
    paths = get_all_image_paths()
    print(f"Found {len(paths)} images to process.\n")
    
    thumb_map = {}
    success = 0
    failed = 0
    
    for i, p in enumerate(paths, 1):
        # Normalize path separators
        p_normalized = p.replace('\\', '/')
        print(f"[{i}/{len(paths)}] {p_normalized}")
        thumb_path = generate_thumbnail(p)
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
