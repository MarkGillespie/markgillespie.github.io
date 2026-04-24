import subprocess
from pathlib import Path
import sys

def batch_convert_png_to_webp(directory_path, quality=80):
    """
    Recursively finds all PNGs in a directory and converts them to WebP.
    """
    target_dir = Path(directory_path)

    # Make sure the directory actually exists
    if not target_dir.is_dir():
        print(f"❌ Error: The directory '{target_dir}' does not exist.")
        sys.exit(1)

    # Find all .png files recursively (case-insensitive)
    print(f"🔍 Scanning '{target_dir}' for PNG files...")
    png_files = list(target_dir.rglob("*.[pP][nN][gG]"))

    if not png_files:
        print("🤷 No PNG files found in the specified directory.")
        return

    print(f"🚀 Found {len(png_files)} PNG files. Starting conversion...\n")

    success_count = 0
    fail_count = 0

    for png_path in png_files:
        # Create the new filename by swapping .png for .webp
        webp_path = png_path.with_suffix('.webp')
        
        # Build the exact command we would type in the terminal
        command = [
            "cwebp", 
            "-q", str(quality), 
            str(png_path), 
            "-o", str(webp_path)
        ]
        
        try:
            # Execute the command. 
            # stdout/stderr are sent to DEVNULL to keep your terminal output clean.
            subprocess.run(command, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            print(f"✅ Converted: {png_path.name} -> {webp_path.name}")
            success_count += 1
            
        except subprocess.CalledProcessError:
            print(f"❌ Failed to convert: {png_path.name}")
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
    # Change this to the path of your image folder. 
    # '.' means the current folder the script is sitting in.
    DIRECTORY_TO_SCAN = "." 
    
    # 80 is the standard sweet spot for quality vs file size
    WEBP_QUALITY = 80       
    
    batch_convert_png_to_webp(DIRECTORY_TO_SCAN, WEBP_QUALITY)
