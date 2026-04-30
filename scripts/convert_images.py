import os
from PIL import Image

directory = '/home/ubuntu/verdict/next-app/public/devlog'

print(f"Scanning {directory}...")

for filename in os.listdir(directory):
    if filename.endswith(".png"):
        filepath = os.path.join(directory, filename)
        webp_filename = os.path.splitext(filename)[0] + ".webp"
        webp_filepath = os.path.join(directory, webp_filename)
        
        try:
            with Image.open(filepath) as im:
                im.save(webp_filepath, "WEBP")
            print(f"Converted {filename} to {webp_filename}")
            os.remove(filepath)
            print(f"Deleted {filename}")
        except Exception as e:
            print(f"Error converting {filename}: {e}")

print("Done.")
