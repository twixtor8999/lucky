from PIL import Image, ImageDraw, ImageFont
import os

os.makedirs('apps/web/public/icons', exist_ok=True)
os.makedirs('public/icons', exist_ok=True)

def generate_icon(size, filename, is_maskable=False):
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Background
    corner_radius = 0 if is_maskable else int(size * 0.22)
    bg_color = (226, 46, 40, 255) # Rich Mantri Red #e22e28
    
    # Create smooth rounded rectangle or full bleed for maskable
    if is_maskable:
        draw.rectangle([(0, 0), (size, size)], fill=bg_color)
    else:
        draw.rounded_rectangle([(0, 0), (size, size)], radius=corner_radius, fill=bg_color)
        
    # Inner subtle border
    inset = int(size * 0.04)
    border_radius = int(size * 0.18)
    if not is_maskable:
        draw.rounded_rectangle([(inset, inset), (size - inset, size - inset)], radius=border_radius, outline=(255, 215, 0, 180), width=max(2, int(size * 0.015)))
    else:
        # For maskable safe zone (within center 80%)
        safe_inset = int(size * 0.1)
        draw.rounded_rectangle([(safe_inset, safe_inset), (size - safe_inset, size - safe_inset)], radius=int(size * 0.15), outline=(255, 215, 0, 180), width=max(2, int(size * 0.015)))
    
    # Try finding standard bold font, else draw clean stylized vector typography
    font_loaded = False
    for font_path in [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
        "/usr/share/fonts/truetype/freefont/FreeSansBold.ttf"
    ]:
        if os.path.exists(font_path):
            try:
                # Main "M"
                font_m = ImageFont.truetype(font_path, int(size * 0.45))
                # "777"
                font_sub = ImageFont.truetype(font_path, int(size * 0.18))
                
                # Draw "M" in center upper
                draw.text((size / 2, size * 0.38), "M", fill=(255, 255, 255, 255), font=font_m, anchor="mm")
                # Draw "777" below in Gold
                draw.text((size / 2, size * 0.72), "777", fill=(255, 223, 0, 255), font=font_sub, anchor="mm")
                font_loaded = True
                break
            except Exception as e:
                pass
                
    if not font_loaded:
        # Fallback default text
        draw.text((size / 2, size / 2), "M777", fill=(255, 255, 255, 255), anchor="mm")
        
    img.save(filename, 'PNG')
    print(f"Generated {filename} ({size}x{size})")

generate_icon(192, 'apps/web/public/icons/icon-192.png')
generate_icon(512, 'apps/web/public/icons/icon-512.png')
generate_icon(512, 'apps/web/public/icons/icon-maskable-512.png', is_maskable=True)
generate_icon(192, 'public/icons/icon-192.png')
generate_icon(512, 'public/icons/icon-512.png')
generate_icon(512, 'public/icons/icon-maskable-512.png', is_maskable=True)
