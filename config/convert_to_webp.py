import subprocess
from pathlib import Path
import sys

def batch_convert_images_to_webp(directory_path, quality=80):
    """
    Recursively finds all PNG and JPG/JPEG files in a directory and converts them to WebP.
    """
    target_dir = Path(directory_path)

    # Make sure the directory actually exists
    if not target_dir.is_dir():
        print(f"❌ Error: The directory '{target_dir}' does not exist.")
        sys.exit(1)

    # Find all .png, .jpg, and .jpeg files recursively (case-insensitive)
    print(f"🔍 Scanning '{target_dir}' for PNG and JPG files...")
    
    image_files = []
    # We loop through common image extensions and add them to our master list
    for ext in ['*.[pP][nN][gG]', '*.[jJ][pP][gG]', '*.[jJ][pP][eE][gG]']:
        image_files.extend(list(target_dir.rglob(ext)))

    if not image_files:
        print("🤷 No PNG or JPG files found in the specified directory.")
        return

    print(f"🚀 Found {len(image_files)} image files. Starting conversion...\n")

    success_count = 0
    fail_count = 0

    for img_path in image_files:
        # Create the new filename by swapping the current extension for .webp
        webp_path = img_path.with_suffix('.webp')
        
        # Build the exact command we would type in the terminal
        command = [
            "cwebp", 
            "-q", str(quality), 
            str(img_path), 
            "-o", str(webp_path)
        ]
        
        try:
            # Execute the command. 
            # stdout/stderr are sent to DEVNULL to keep your terminal output clean.
            subprocess.run(command, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            print(f"✅ Converted: {img_path.name} -> {webp_path.name}")
            success_count += 1
            
        except subprocess.CalledProcessError:
            print(f"❌ Failed to convert: {img_path.name}")
            fail_count += 1
            
        except FileNotFoundError:
            print("\n🚨 CRITICAL ERROR: The 'cwebp' command was not found.")
            print("Please ensure it is installed via Homebrew: brew install webp")
            sys.exit(1)

    # Print a final summary
    print("\n🎉 Conversion Complete!")
    print(f"Successfully converted: {success_count}")
    if fail_count > 0:
        print(f"Failed conversions: {fail_count}")

if __name__ == "__main__":
    # --- CONFIGURATION ---
    # Take the first command line argument if present, otherwise default to "."
    if len(sys.argv) > 1:
        DIRECTORY_TO_SCAN = sys.argv[1]
    else:
        DIRECTORY_TO_SCAN = "."
    
    # 80 is the standard sweet spot for quality vs file size
    WEBP_QUALITY = 80       
    
    batch_convert_images_to_webp(DIRECTORY_TO_SCAN, WEBP_QUALITY)