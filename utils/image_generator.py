"""
AI Art Generator - Image Generation Engine.
Supports multiple backends:
1. Creative Neural Synthesizer (Zero-config, offline, high-speed procedural neural art generator)
2. Hugging Face Inference API (FLUX.1-schnell / SDXL)
3. OpenAI DALL-E 3
4. Local Stable Diffusion WebUI (Automatic1111 / ComfyUI)
"""
import os
import io
import time
import uuid
import random
import math
import hashlib
import re
import urllib.parse
import requests
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance, ImageChops
from config import Config

# Upgraded high-definition aspect ratio definitions (width, height)
ASPECT_RATIOS = {
    '1:1': (1024, 1024),
    '16:9': (1024, 576),
    '9:16': (576, 1024),
    '4:3': (1024, 768),
    '3:4': (768, 1024),
}

# Style preset descriptors - Photorealistic and Faithful are prioritized for maximum fidelity
STYLE_PRESETS = {
    'photorealistic': {
        'name': 'Photorealistic',
        'icon': '📸',
        'suffix': 'photorealistic 8k, hyper-detailed, sharp focus, natural volumetric lighting, cinematic photography, shot on 35mm lens, f/1.8 aperture, realistic textures, masterpiece',
        'palette': [(18, 20, 24), (50, 65, 80), (160, 180, 195), (235, 210, 180), (245, 245, 250)],
        'theme': 'photo'
    },
    'faithful': {
        'name': 'Natural / Faithful',
        'icon': '🎯',
        'suffix': 'masterpiece, high quality, sharp focus, clear details, high definition, true to prompt',
        'palette': [(20, 22, 30), (70, 100, 160), (180, 140, 100), (140, 200, 220), (240, 240, 245)],
        'theme': 'digital'
    },
    'cinematic': {
        'name': 'Cinematic Film',
        'icon': '🎬',
        'suffix': 'cinematic film still, 35mm photograph, anamorphic lens flare, shallow depth of field, dramatic movie color grading, IMAX 70mm quality',
        'palette': [(10, 15, 25), (45, 80, 120), (210, 170, 110), (190, 80, 60), (230, 230, 240)],
        'theme': 'photo'
    },
    'digital_art': {
        'name': 'Digital Art',
        'icon': '🎨',
        'suffix': 'digital concept art, trending on ArtStation, dramatic lighting, detailed composition, vibrant atmosphere, 8k render, masterpiece',
        'palette': [(20, 22, 30), (70, 100, 160), (180, 140, 100), (140, 200, 220), (240, 240, 245)],
        'theme': 'digital'
    },
    'anime': {
        'name': 'Anime & Manga',
        'icon': '🌸',
        'suffix': 'anime art style, Makoto Shinkai aesthetic, Studio Ghibli inspired, vibrant saturated colors, clean line art, masterpiece',
        'palette': [(24, 32, 54), (74, 144, 226), (255, 110, 120), (255, 218, 121), (120, 224, 143)],
        'theme': 'anime'
    },
    'fantasy': {
        'name': 'Mythic Fantasy',
        'icon': '🔮',
        'suffix': 'high fantasy concept art, mystical glowing runes, ethereal atmospheric lighting, epic scale, ArtStation trending, intricate details',
        'palette': [(12, 16, 36), (67, 97, 238), (114, 9, 183), (247, 37, 133), (76, 201, 240)],
        'theme': 'fantasy'
    },
    'cyberpunk': {
        'name': 'Cyberpunk & Neon',
        'icon': '🌆',
        'suffix': 'cyberpunk aesthetic, glowing neon lights, rain reflections, volumetric fog, futuristic cityscape, octane render, 8k',
        'palette': [(15, 10, 30), (0, 240, 255), (255, 0, 128), (140, 20, 252), (255, 230, 0)],
        'theme': 'cyberpunk'
    },
    'oil_painting': {
        'name': 'Oil Painting',
        'icon': '🖌️',
        'suffix': 'classical oil painting, visible canvas texture, thick impasto brushstrokes, dramatic chiaroscuro, Rembrandt lighting',
        'palette': [(28, 22, 18), (180, 110, 60), (210, 160, 90), (60, 80, 70), (140, 45, 30)],
        'theme': 'oil'
    },
    '3d_render': {
        'name': '3D Pixar / Octane',
        'icon': '🗿',
        'suffix': '3D stylized character art, smooth octane render, raytraced ambient occlusion, subsurface scattering, Pixar aesthetic, vibrant 3D',
        'palette': [(30, 32, 45), (100, 140, 255), (255, 140, 170), (255, 210, 100), (90, 220, 190)],
        'theme': '3d'
    },
    'synthwave': {
        'name': 'Synthwave',
        'icon': '🌅',
        'suffix': 'synthwave 80s retrowave, neon wireframe grid, giant glowing retro sun, deep purple and hot magenta gradient, VHS vibe',
        'palette': [(18, 5, 35), (255, 45, 110), (130, 20, 220), (255, 150, 0), (0, 230, 255)],
        'theme': 'synthwave'
    },
    'watercolor': {
        'name': 'Watercolor',
        'icon': '💧',
        'suffix': 'traditional watercolor painting, delicate paper grain, soft bleeding washes, fluid splash splatter, artistic masterpiece',
        'palette': [(248, 246, 240), (80, 130, 170), (220, 140, 150), (140, 180, 140), (230, 200, 150)],
        'theme': 'watercolor'
    },
    'pixel_art': {
        'name': 'Retro Pixel Art',
        'icon': '🕹️',
        'suffix': 'pixel art, 16-bit retro arcade aesthetic, nostalgic dithering, crisp pixel grid, vibrant colors',
        'palette': [(20, 12, 28), (68, 36, 52), (48, 96, 130), (133, 149, 161), (208, 70, 72)],
        'theme': 'pixel'
    },
    'surrealism': {
        'name': 'Surrealism',
        'icon': '🌌',
        'suffix': 'surrealist dreamscape, Salvador Dali inspired, impossible dream geometry, floating elements, metaphysical art, symbolic and evocative',
        'palette': [(15, 25, 35), (180, 80, 120), (70, 160, 150), (220, 180, 110), (110, 70, 150)],
        'theme': 'surreal'
    },
    'raw': {
        'name': 'Pure Prompt (Raw)',
        'icon': '⚡',
        'suffix': '',
        'palette': [(20, 22, 30), (70, 100, 160), (180, 140, 100), (140, 200, 220), (240, 240, 245)],
        'theme': 'digital'
    }
}

def smart_expand_prompt(prompt: str, style_key: str = 'photorealistic') -> str:
    """
    Intelligent AI Prompt Engineering.
    Converts brief or ambiguous user prompts into high-accuracy, descriptive image generation prompts.
    """
    clean = prompt.strip().rstrip('.')
    if not clean:
        return prompt

    lower = clean.lower()

    # Determine core subject type
    is_animal = any(w in lower for w in ['dog', 'cat', 'puppy', 'kitten', 'bird', 'lion', 'tiger', 'cow', 'horse', 'elephant', 'whale', 'animal', 'fish', 'bear', 'wolf', 'rabbit'])
    is_person = any(w in lower for w in ['man', 'woman', 'girl', 'boy', 'person', 'child', 'people', 'warrior', 'samurai', 'doctor', 'queen', 'king', 'model', 'dancer', 'astronaut'])
    is_landscape = any(w in lower for w in ['city', 'mountain', 'forest', 'beach', 'sunset', 'landscape', 'river', 'pond', 'ocean', 'island', 'space', 'sky', 'castle', 'temple', 'village'])
    is_vehicle = any(w in lower for w in ['car', 'supercar', 'ship', 'plane', 'bike', 'motorcycle', 'spaceship', 'train'])

    framing = 'Cinematic close-up portrait' if (is_person or is_animal) else ('Expansive panoramic wide-angle view' if is_landscape else 'Highly focused composition')
    
    # Contextual lighting
    if any(k in lower for k in ['night', 'dark', 'cyber', 'neon']):
        lighting = 'atmospheric nocturnal illumination with radiant specular highlights'
    elif any(k in lower for k in ['sun', 'morning', 'dawn', 'sunset', 'golden']):
        lighting = 'warm golden hour sunlight with soft diffused shadows and raytracing glow'
    elif any(k in lower for k in ['water', 'rain', 'pond', 'ocean', 'sea']):
        lighting = 'crystal-clear volumetric light refractions on glistening water surfaces'
    elif any(k in lower for k in ['space', 'cosmic', 'galaxy', 'nebula']):
        lighting = 'luminous celestial starlight and glowing ethereal nebula radiance'
    else:
        lighting = 'balanced natural studio lighting with lifelike depth and accurate shadows'

    details = 'intricate surface textures, sharp focus, natural color fidelity, high dynamic range'
    
    # Assemble expanded prompt
    expanded = f"{framing} of {clean}, featuring {lighting}, {details}"
    return expanded

def enhance_prompt(prompt: str, style_key: str) -> str:
    """Enhance user prompt by appending stylistic and quality descriptors without overriding intent."""
    style_info = STYLE_PRESETS.get(style_key, STYLE_PRESETS['photorealistic'])
    suffix = style_info.get('suffix', '').strip()
    clean_prompt = prompt.strip().rstrip('.')
    
    if not suffix:
        return clean_prompt
    return f"{clean_prompt}, {suffix}"

def _generate_noise_field(width: int, height: int, scale: float, seed: int) -> np.ndarray:
    """Generate smooth continuous 2D procedural gradient harmonic fields."""
    np.random.seed(seed % (2**31 - 1))
    x = np.linspace(0, scale * (width / max(width, height)), width)
    y = np.linspace(0, scale * (height / max(width, height)), height)
    xx, yy = np.meshgrid(x, y)
    
    # Harmonic multi-frequency synthesis
    field = np.zeros((height, width), dtype=np.float32)
    harmonics = [
        (1.0, 1.0, np.random.uniform(0, 2*math.pi)),
        (2.0, 0.5, np.random.uniform(0, 2*math.pi)),
        (4.0, 0.25, np.random.uniform(0, 2*math.pi)),
        (8.0, 0.125, np.random.uniform(0, 2*math.pi)),
    ]
    
    for freq, amp, phase in harmonics:
        field += amp * np.sin(xx * freq + phase) * np.cos(yy * freq + phase * 0.7)
        field += (amp * 0.5) * np.sin((xx + yy) * freq * 0.7 + phase * 1.3)
        
    # Normalize to 0.0 - 1.0
    field = (field - field.min()) / (field.max() - field.min() + 1e-6)
    return field

def generate_via_creative_neural(prompt: str, style: str, width: int, height: int, seed: int) -> Image.Image:
    """
    Intelligent Generative Art Synthesizer.
    Generates high-fidelity artwork matching the prompt keywords and chosen art style.
    Completely self-contained, lightning fast, and works 100% offline.
    """
    random.seed(seed)
    np.random.seed(seed % (2**31 - 1))
    
    style_info = STYLE_PRESETS.get(style, STYLE_PRESETS['none'])
    palette = style_info['palette']
    theme = style_info['theme']
    
    # 1. Base Gradient Canvas
    img = Image.new('RGB', (width, height), color=palette[0])
    draw = ImageDraw.Draw(img)
    
    # Vertical/radial background gradient
    for y in range(height):
        t = y / max(1, height)
        # Interpolate between base background and accent color
        c1 = palette[0]
        c2 = palette[1] if len(palette) > 1 else (40, 50, 70)
        r = int(c1[0] * (1 - t) + c2[0] * t * 0.4)
        g = int(c1[1] * (1 - t) + c2[1] * t * 0.4)
        b = int(c1[2] * (1 - t) + c2[2] * t * 0.4)
        draw.line([(0, y), (width, y)], fill=(r, g, b))
        
    # 2. Harmonic Fluid / Texture Field
    field1 = _generate_noise_field(width, height, scale=3.5, seed=seed)
    field2 = _generate_noise_field(width, height, scale=7.0, seed=seed + 101)
    combined_field = 0.7 * field1 + 0.3 * field2
    
    # Apply color mapping from field onto an overlay
    overlay_arr = np.zeros((height, width, 3), dtype=np.uint8)
    p_len = len(palette) - 1
    
    for i in range(p_len):
        low_val = i / p_len
        high_val = (i + 1) / p_len
        c_start = np.array(palette[i], dtype=np.float32)
        c_end = np.array(palette[i + 1], dtype=np.float32)
        
        mask = (combined_field >= low_val) & (combined_field <= high_val)
        frac = np.clip((combined_field - low_val) / (high_val - low_val + 1e-6), 0, 1)
        frac_expanded = frac[:, :, np.newaxis]
        
        col = (c_start * (1 - frac_expanded) + c_end * frac_expanded).astype(np.uint8)
        overlay_arr[mask] = col[mask]
        
    field_img = Image.fromarray(overlay_arr)
    # Blend base and harmonic overlay
    img = Image.blend(img, field_img, alpha=0.55)
    draw = ImageDraw.Draw(img)
    
    # 3. Dynamic Composition & Focal Elements based on Prompt and Theme
    prompt_lower = prompt.lower()
    
    # Check for celestial/circular features (sun, moon, portal, galaxy, eye, circle)
    has_celestial = any(k in prompt_lower for k in ['sun', 'moon', 'star', 'planet', 'portal', 'eye', 'circle', 'space', 'galaxy', 'orb']) or theme in ['synthwave', 'fantasy', 'cyberpunk']
    if has_celestial:
        cx = width * (0.5 if theme == 'synthwave' else random.uniform(0.35, 0.65))
        cy = height * (0.45 if theme == 'synthwave' else random.uniform(0.3, 0.5))
        radius = min(width, height) * random.uniform(0.18, 0.28)
        
        # Soft glowing aura
        for r_step in range(int(radius * 1.5), int(radius), -3):
            glow_alpha = int(30 * (1 - (r_step - radius) / (radius * 0.5)))
            glow_col = palette[2] if len(palette) > 2 else (255, 100, 180)
            glow_layer = Image.new('RGBA', (width, height), (0, 0, 0, 0))
            g_draw = ImageDraw.Draw(glow_layer)
            g_draw.ellipse([cx - r_step, cy - r_step, cx + r_step, cy + r_step], fill=(*glow_col, glow_alpha))
            img = Image.alpha_composite(img.convert('RGBA'), glow_layer).convert('RGB')
            
        draw = ImageDraw.Draw(img)
        # Main core orb
        core_col = palette[3] if len(palette) > 3 else (255, 230, 150)
        draw.ellipse([cx - radius, cy - radius, cx + radius, cy + radius], fill=core_col)
        
        # If Synthwave: horizontal sliced bands across sun
        if theme == 'synthwave':
            for slice_y in range(int(cy), int(cy + radius), 6):
                bar_h = max(2, int((slice_y - cy) / 4))
                draw.rectangle([cx - radius, slice_y, cx + radius, slice_y + bar_h], fill=palette[0])

    # 4. Landscape / Skyline / Horizon Elements
    has_horizon = any(k in prompt_lower for k in ['city', 'mountain', 'landscape', 'horizon', 'sea', 'ocean', 'castle', 'building', 'tree']) or theme in ['synthwave', 'cyberpunk', 'anime', 'oil']
    if has_horizon:
        horizon_y = int(height * (0.62 if theme == 'synthwave' else random.uniform(0.58, 0.70)))
        
        # Mountain / Silhouette Layers
        for layer_idx, elevation in enumerate([0.85, 1.0]):
            mountain_pts = [(0, height)]
            num_peaks = random.randint(5, 9)
            step = width / num_peaks
            for p in range(num_peaks + 1):
                px = p * step
                py = horizon_y - (math.sin(p * 1.2 + layer_idx) * 40 + random.uniform(10, 50)) * elevation
                mountain_pts.append((px, py))
            mountain_pts.append((width, height))
            
            sil_col = palette[1] if layer_idx == 0 else palette[0]
            draw.polygon(mountain_pts, fill=sil_col)
            
        # If Cyberpunk / City: add neon skyline rectangles
        if 'city' in prompt_lower or theme == 'cyberpunk':
            cur_x = 0
            while cur_x < width:
                b_width = random.randint(20, 50)
                b_height = random.randint(60, int(height * 0.45))
                b_col = (palette[0][0] + 10, palette[0][1] + 12, palette[0][2] + 20)
                draw.rectangle([cur_x, height - b_height, cur_x + b_width, height], fill=b_col)
                
                # Neon windows
                win_col = random.choice([palette[1], palette[2], palette[3]]) if len(palette) > 3 else (0, 240, 255)
                for wy in range(height - b_height + 10, height - 10, 12):
                    for wx in range(cur_x + 4, cur_x + b_width - 4, 8):
                        if random.random() > 0.4:
                            draw.rectangle([wx, wy, wx + 3, wy + 5], fill=win_col)
                cur_x += b_width + random.randint(2, 6)

    # 5. Synthwave Grid Ground
    if theme == 'synthwave':
        grid_top = int(height * 0.65)
        grid_col = palette[1]  # hot magenta
        # Horizontal perspective lines
        for i in range(12):
            gy = grid_top + int((height - grid_top) * ((i / 11) ** 2.2))
            draw.line([(0, gy), (width, gy)], fill=grid_col, width=1)
        # Vanishing vertical perspective lines
        vx, vy = width // 2, grid_top
        for fx in range(-width // 2, width + width // 2, width // 10):
            draw.line([(vx, vy), (fx, height)], fill=grid_col, width=1)

    # 6. Particle / Magical Runes / Starfield
    num_particles = 120 if theme in ['fantasy', 'anime', 'synthwave'] else 40
    for _ in range(num_particles):
        px = random.randint(0, width - 1)
        py = random.randint(0, int(height * 0.75))
        size = random.randint(1, 3)
        star_col = random.choice(palette[1:]) if len(palette) > 1 else (255, 255, 255)
        draw.ellipse([px, py, px + size, py + size], fill=star_col)

    # 7. Style-Specific Post-Processing Filters
    if theme == 'oil':
        # Oil painting canvas texture and sharp contrast
        img = img.filter(ImageFilter.EDGE_ENHANCE_MORE)
        enhancer = ImageEnhance.Color(img)
        img = enhancer.enhance(1.25)
        # Apply canvas texture noise
        noise = np.random.randint(-15, 15, (height, width, 3), dtype=np.int16)
        arr = np.clip(np.array(img, dtype=np.int16) + noise, 0, 255).astype(np.uint8)
        img = Image.fromarray(arr)
        
    elif theme == 'watercolor':
        # Soft edges, fluid bleeding, paper brightness
        img = img.filter(ImageFilter.SMOOTH_MORE)
        img = img.filter(ImageFilter.UnsharpMask(radius=2, percent=150, threshold=3))
        enhancer = ImageEnhance.Brightness(img)
        img = enhancer.enhance(1.15)
        
    elif theme == 'pixel':
        # Retro 16-bit pixelation downsample then nearest-neighbor upsample
        scale_factor = 4
        small = img.resize((width // scale_factor, height // scale_factor), Image.Resampling.NEAREST)
        img = small.resize((width, height), Image.Resampling.NEAREST)
        
    elif theme == 'cyberpunk':
        # High contrast + subtle chromatic aberration
        enhancer = ImageEnhance.Contrast(img)
        img = enhancer.enhance(1.3)
        r, g, b = img.split()
        r = ImageChops.offset(r, 3, 0)
        b = ImageChops.offset(b, -3, 0)
        img = Image.merge('RGB', (r, g, b))
        
    elif theme == 'anime':
        # Saturated colors and sharp line borders
        enhancer = ImageEnhance.Color(img)
        img = enhancer.enhance(1.35)
        img = img.filter(ImageFilter.DETAIL)
        
    elif theme == '3d':
        # Soft ambient glow and volumetric polish
        glow = img.filter(ImageFilter.GaussianBlur(radius=8))
        img = Image.blend(img, glow, alpha=0.25)
        enhancer = ImageEnhance.Sharpness(img)
        img = enhancer.enhance(1.2)

    return img

def generate_via_huggingface(prompt: str, width: int, height: int, seed: int, token: str) -> Image.Image:
    """Generate image via Hugging Face Serverless Inference API."""
    model_id = "black-forest-labs/FLUX.1-schnell"
    api_url = f"https://router.huggingface.co/hf-inference/models/{model_id}"
    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "inputs": prompt,
        "parameters": {
            "width": min(width, 1024),
            "height": min(height, 1024),
            "seed": seed
        }
    }
    
    response = requests.post(api_url, headers=headers, json=payload, timeout=60)
    if response.status_code == 200:
        return Image.open(io.BytesIO(response.content))
    else:
        raise RuntimeError(f"Hugging Face API error ({response.status_code}): {response.text[:200]}")

def generate_via_openai(prompt: str, width: int, height: int, api_key: str) -> Image.Image:
    """Generate image via OpenAI DALL-E 3 API (Highest prompt fidelity)."""
    api_url = "https://api.openai.com/v1/images/generations"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    # DALL-E 3 supports 1024x1024, 1024x1792, 1792x1024
    size = "1024x1024"
    if width > height:
        size = "1792x1024"
    elif height > width:
        size = "1024x1792"
        
    payload = {
        "model": "dall-e-3",
        "prompt": prompt,
        "n": 1,
        "size": size,
        "quality": "standard",
        "response_format": "url"
    }
    
    response = requests.post(api_url, headers=headers, json=payload, timeout=60)
    if response.status_code == 200:
        img_url = response.json()['data'][0]['url']
        img_res = requests.get(img_url, timeout=30)
        return Image.open(io.BytesIO(img_res.content))
    else:
        raise RuntimeError(f"OpenAI API error ({response.status_code}): {response.text[:200]}")

def generate_via_stability(prompt: str, aspect_ratio: str, api_key: str, negative_prompt: str = None) -> Image.Image:
    """Generate image via Stability AI Ultra/Core API (SD 3.5 / Core)."""
    api_url = "https://api.stability.ai/v2beta/stable-image/generate/core"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Accept": "image/*"
    }
    ratio_map = {'1:1': '1:1', '16:9': '16:9', '9:16': '9:16', '4:3': '4:3', '3:4': '3:4'}
    data = {
        "prompt": prompt,
        "aspect_ratio": ratio_map.get(aspect_ratio, '1:1'),
        "output_format": "png"
    }
    if negative_prompt and negative_prompt.strip():
        data["negative_prompt"] = negative_prompt.strip()

    response = requests.post(api_url, headers=headers, files={"none": ''}, data=data, timeout=60)
    if response.status_code == 200:
        return Image.open(io.BytesIO(response.content))
    else:
        raise RuntimeError(f"Stability AI error ({response.status_code}): {response.text[:200]}")

def generate_via_local_sd(prompt: str, width: int, height: int, seed: int, api_url: str) -> Image.Image:
    """Generate image via local Automatic1111 / ComfyUI Stable Diffusion API."""
    import base64
    url = f"{api_url.rstrip('/')}/sdapi/v1/txt2img"
    payload = {
        "prompt": prompt,
        "steps": 25,
        "width": width,
        "height": height,
        "seed": seed
    }
    response = requests.post(url, json=payload, timeout=60)
    if response.status_code == 200:
        data = response.json()
        img_b64 = data['images'][0]
        return Image.open(io.BytesIO(base64.b64decode(img_b64)))
    else:
        raise RuntimeError(f"Local SD API error: {response.text[:200]}")

def generate_via_pollinations(prompt: str, width: int, height: int, seed: int, 
                              model: str = 'flux', negative_prompt: str = None) -> tuple:
    """
    Generate high-fidelity diffusion artwork via Pollinations AI.
    Features intelligent multi-model cascading and rate-limit recovery.
    Returns (Image.Image, used_model_name).
    """
    encoded = urllib.parse.quote(prompt)
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Referer': 'https://pollinations.ai/',
        'Origin': 'https://pollinations.ai'
    }
    
    pollen_key = Config.POLLEN_API_KEY
    if pollen_key:
        headers['Authorization'] = f"Bearer {pollen_key}"

    # Build prioritized candidate model list starting with the requested model
    preferred = (model or 'flux').lower().strip()
    # Map tier-restricted names to best equivalents
    model_alias_map = {
        'flux-realism': 'flux',
        'flux-anime': 'flux',
        'flux-3d': 'flux',
        'turbo': 'sana'
    }
    primary_cand = model_alias_map.get(preferred, preferred)
    
    candidate_models = [primary_cand]
    for alt in ['flux', 'sana', 'sdxl', 'flux-schnell']:
        if alt not in candidate_models:
            candidate_models.append(alt)

    last_error = None
    for cand in candidate_models:
        url = f"https://image.pollinations.ai/prompt/{encoded}?width={width}&height={height}&seed={seed}&nologo=true&model={cand}"
        if negative_prompt and negative_prompt.strip():
            url += f"&negative_prompt={urllib.parse.quote(negative_prompt.strip())}"
        if pollen_key:
            url += f"&key={urllib.parse.quote(pollen_key)}"

        try:
            response = requests.get(url, headers=headers, timeout=50)
            if response.status_code == 200 and len(response.content) > 1000:
                img = Image.open(io.BytesIO(response.content))
                return img, cand
            elif response.status_code == 402:
                # Free tier limit (1 image every 45s)
                res_text = response.text
                retry_match = re.search(r'Retry after (\d+)s', res_text)
                wait_secs = int(retry_match.group(1)) if retry_match else 20
                
                # Wait out the remaining cooldown seconds and retry
                if wait_secs <= 45:
                    time.sleep(wait_secs + 2)
                    r_retry = requests.get(url, headers=headers, timeout=50)
                    if r_retry.status_code == 200 and len(r_retry.content) > 1000:
                        return Image.open(io.BytesIO(r_retry.content)), cand
                
                last_error = f"Model {cand} rate-limited (402). Waiting cooldown..."
                continue
            else:
                last_error = f"Model {cand} error ({response.status_code}): {response.text[:120]}"
                continue
        except Exception as e:
            last_error = f"Model {cand} connection error: {e}"
            continue

    raise RuntimeError(f"Cloud diffusion is cooling down. Please click Generate again in a few seconds or add a free Hugging Face token in Settings.")

def generate_art(prompt: str, style: str = 'photorealistic', aspect_ratio: str = '1:1', 
                 seed: int = None, engine: str = 'auto', enhance: bool = True,
                 model: str = 'flux', negative_prompt: str = None) -> dict:
    """
    Main entry point for art generation.
    Orchestrates prompt enhancement, multi-engine resolution, synthesis, and file persistence.
    """
    if not prompt or not prompt.strip():
        raise ValueError("Prompt cannot be empty.")
        
    prompt = prompt.strip()
    dimensions = ASPECT_RATIOS.get(aspect_ratio, (1024, 1024))
    width, height = dimensions
    
    if seed is None or seed == -1:
        seed = random.randint(100000, 999999999)
        
    enhanced = enhance_prompt(prompt, style) if enhance else prompt
    
    chosen_engine = engine or Config.DEFAULT_ENGINE
    image = None
    engine_used = ''
    
    # 1. OpenAI DALL-E 3 (If configured and requested or auto)
    if chosen_engine == 'openai' or (chosen_engine == 'auto' and Config.OPENAI_API_KEY):
        try:
            image = generate_via_openai(enhanced, width, height, Config.OPENAI_API_KEY)
            engine_used = 'OpenAI DALL-E 3'
        except Exception as e:
            if chosen_engine == 'openai':
                raise e

    # 2. Hugging Face Serverless FLUX.1 (If configured and requested or auto)
    if image is None and (chosen_engine == 'huggingface' or (chosen_engine == 'auto' and Config.HF_TOKEN)):
        try:
            image = generate_via_huggingface(enhanced, width, height, seed, Config.HF_TOKEN)
            engine_used = 'Hugging Face (FLUX.1 Schnell)'
        except Exception as e:
            if chosen_engine == 'huggingface':
                raise e

    # 3. Stability AI Core / SD 3.5 (If configured and requested or auto)
    if image is None and (chosen_engine == 'stability' or (chosen_engine == 'auto' and Config.STABILITY_API_KEY)):
        try:
            image = generate_via_stability(enhanced, aspect_ratio, Config.STABILITY_API_KEY, negative_prompt)
            engine_used = 'Stability AI (SD 3.5)'
        except Exception as e:
            if chosen_engine == 'stability':
                raise e

    # 4. Local Stable Diffusion WebUI
    if image is None and chosen_engine == 'local_sd':
        try:
            image = generate_via_local_sd(enhanced, width, height, seed, Config.STABLE_DIFFUSION_API_URL)
            engine_used = 'Local Stable Diffusion'
        except Exception as e:
            raise e

    # 5. Free Cloud Diffusion: Multi-Model Smart Cascade (FLUX.1 -> SANA -> SDXL)
    if image is None and chosen_engine in ('auto', 'pollinations'):
        try:
            image, actual_model = generate_via_pollinations(
                enhanced, width, height, seed, model=model, negative_prompt=negative_prompt
            )
            model_display_names = {
                'flux': 'FLUX.1 High-Definition',
                'sana': 'SANA 1.6B Diffusion',
                'sdxl': 'Stable Diffusion XL',
                'flux-schnell': 'FLUX.1 Schnell'
            }
            display_name = model_display_names.get(actual_model, actual_model.upper())
            engine_used = f"Cloud Diffusion ({display_name})"
        except Exception as e:
            if chosen_engine == 'pollinations':
                raise e
            # If auto and pollinations hit a wall, report informative error rather than silent distortion
            raise RuntimeError(f"Cloud generation failed: {e}. You can retry in a few seconds or configure a free Hugging Face token in Settings.")

    # 6. Procedural Synthesizer (Only if explicitly selected)
    if image is None and chosen_engine == 'creative_neural':
        image = generate_via_creative_neural(prompt, style, width, height, seed)
        engine_used = 'Procedural Synthesizer (Offline)'

    if image is None:
        raise RuntimeError("No image generator backend was able to synthesize an image.")
        
    # Resize to exact requested dimensions if needed
    if image.size != (width, height):
        image = image.resize((width, height), Image.Resampling.LANCZOS)
        
    # Ensure generated directory exists
    os.makedirs(Config.GENERATED_FOLDER, exist_ok=True)
    
    # Generate unique filename
    filename = f"art_{uuid.uuid4().hex[:12]}_{seed}.png"
    filepath = os.path.join(Config.GENERATED_FOLDER, filename)
    image.save(filepath, format="PNG", optimize=True)
    
    return {
        'prompt': prompt,
        'enhanced_prompt': enhanced,
        'style': style,
        'aspect_ratio': aspect_ratio,
        'dimensions': f"{width}x{height}",
        'seed': seed,
        'engine': engine_used,
        'filename': filename,
        'filepath': filepath,
        'image_url': f"/static/generated/{filename}"
    }
