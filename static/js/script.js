/**
 * AI Art Generator - Interactive Client-Side & Multi-Backend Application
 * Supports both Flask Backend API and 100% Client-Side Static Deployment (GitHub Pages)
 */

// Curated library of creative prompt ideas
const PROMPT_IDEAS = [
    "Cyberpunk samurai standing in neon rain overlooking a futuristic Tokyo megalopolis",
    "Ancient mystical library hidden inside a giant hollow tree with glowing crystal lanterns",
    "Retro 80s supercar speeding across an endless desert into a synthwave sunset",
    "Majestic celestial whale swimming through an ethereal cosmic nebula of stars",
    "Steampunk mechanical hummingbird with polished brass gears and ruby eyes",
    "Floating sky islands with cascading crystalline waterfalls and hanging gardens",
    "Overgrown ruined gothic cathedral reclaimed by emerald moss and bioluminescent flora",
    "Cute robotic botanist tending to glowing alien flowers inside a glass biodome",
    "Mythological phoenix reborn from violet flames and incandescent stardust",
    "Cozy subterranean coffee shop bustling with forest creatures in a fantasy realm"
];

// Status messages during generation with timing
const STATUS_STEPS = [
    { time: 1000, progress: 15, text: "Analyzing prompt & aesthetic semantics..." },
    { time: 4000, progress: 35, text: "Connecting to neural diffusion cluster..." },
    { time: 9000, progress: 55, text: "Synthesizing latent composition & lighting..." },
    { time: 16000, progress: 75, text: "Rendering high-resolution textures & details..." },
    { time: 25000, progress: 90, text: "Refining 1024x1024 masterwork canvas..." },
    { time: 35000, progress: 96, text: "Finalizing composition & saving artwork..." }
];

// Style preset descriptors and modifiers
const STYLE_PRESETS = {
    'photorealistic': {
        name: 'Photorealistic',
        suffix: 'photorealistic 8k, hyper-detailed, sharp focus, natural volumetric lighting, cinematic photography, shot on 35mm lens, f/1.8 aperture, realistic textures, masterpiece'
    },
    'faithful': {
        name: 'Natural / Faithful',
        suffix: 'masterpiece, high quality, sharp focus, clear details, high definition, true to prompt'
    },
    'cinematic': {
        name: 'Cinematic Film',
        suffix: 'cinematic film still, 35mm photograph, anamorphic lens flare, shallow depth of field, dramatic movie color grading, IMAX 70mm quality'
    },
    'digital_art': {
        name: 'Digital Art',
        suffix: 'digital concept art, trending on ArtStation, dramatic lighting, detailed composition, vibrant atmosphere, 8k render, masterpiece'
    },
    'anime': {
        name: 'Anime & Manga',
        suffix: 'anime art style, Makoto Shinkai aesthetic, Studio Ghibli inspired, vibrant saturated colors, clean line art, masterpiece'
    },
    'fantasy': {
        name: 'Mythic Fantasy',
        suffix: 'high fantasy concept art, mystical glowing runes, ethereal atmospheric lighting, epic scale, ArtStation trending, intricate details'
    },
    'cyberpunk': {
        name: 'Cyberpunk & Neon',
        suffix: 'cyberpunk aesthetic, glowing neon lights, rain reflections, volumetric fog, futuristic cityscape, octane render, 8k'
    },
    'oil_painting': {
        name: 'Oil Painting',
        suffix: 'classical oil painting, visible canvas texture, thick impasto brushstrokes, dramatic chiaroscuro, Rembrandt lighting'
    },
    '3d_render': {
        name: '3D Pixar / Octane',
        suffix: '3D stylized character art, smooth octane render, raytraced ambient occlusion, subsurface scattering, Pixar aesthetic, vibrant 3D'
    },
    'synthwave': {
        name: 'Synthwave',
        suffix: 'synthwave 80s retrowave, neon wireframe grid, giant glowing retro sun, deep purple and hot magenta gradient, VHS vibe'
    },
    'watercolor': {
        name: 'Watercolor',
        suffix: 'traditional watercolor painting, delicate paper grain, soft bleeding washes, fluid splash splatter, artistic masterpiece'
    },
    'pixel_art': {
        name: 'Retro Pixel Art',
        suffix: 'pixel art, 16-bit retro arcade aesthetic, nostalgic dithering, crisp pixel grid, vibrant colors'
    },
    'surrealism': {
        name: 'Surrealism',
        suffix: 'surrealist dreamscape, Salvador Dali inspired, impossible dream geometry, floating elements, metaphysical art, symbolic and evocative'
    },
    'raw': {
        name: 'Pure Prompt (Raw)',
        suffix: ''
    }
};

const ASPECT_RATIO_DIMS = {
    '1:1': [1024, 1024],
    '16:9': [1024, 576],
    '9:16': [576, 1024],
    '4:3': [1024, 768],
    '3:4': [768, 1024]
};

// Initial curated showcase samples
const SHOWCASE_SAMPLES = [
    {
        id: 'sample-1',
        prompt: 'A loyal golden retriever and a fluffy white kitten sitting in sunlit grass',
        style: 'faithful',
        dimensions: '1024x576',
        engine: 'Cloud Diffusion (FLUX.1)',
        seed: '17520961',
        image_url: 'static/generated/art_4ab1439f8957_17520961.png',
        created_at: '2026-10-30 04:53'
    },
    {
        id: 'sample-2',
        prompt: 'A loyal dog with a kitten in watercolor illustration',
        style: 'watercolor',
        dimensions: '1024x576',
        engine: 'Cloud Diffusion (FLUX.1)',
        seed: '849651504',
        image_url: 'static/generated/art_58d51fb79755_849651504.png',
        created_at: '2026-10-30 04:52'
    },
    {
        id: 'sample-3',
        prompt: 'Anime style cute puppy and playful kitten',
        style: 'anime',
        dimensions: '1024x576',
        engine: 'Cloud Diffusion (FLUX.1)',
        seed: '259507910',
        image_url: 'static/generated/art_a7f3b92e4a80_259507910.png',
        created_at: '2026-10-30 04:52'
    },
    {
        id: 'sample-4',
        prompt: 'Retro 80s supercar speeding into a synthwave sunset',
        style: 'photorealistic',
        dimensions: '1024x1024',
        engine: 'Cloud Diffusion (SDXL)',
        seed: '691586539',
        image_url: 'static/generated/art_99f7af9401bb_691586539.png',
        created_at: '2026-10-28 07:46'
    },
    {
        id: 'sample-5',
        prompt: 'Floating sky islands with cascading crystalline waterfalls',
        style: 'photorealistic',
        dimensions: '1024x1024',
        engine: 'Cloud Diffusion (SANA 1.6B)',
        seed: '451686106',
        image_url: 'static/generated/art_4e2619936b33_451686106.png',
        created_at: '2026-10-28 05:25'
    },
    {
        id: 'sample-6',
        prompt: 'A cute golden retriever puppy sitting in a flower garden',
        style: 'photorealistic',
        dimensions: '1024x1024',
        engine: 'Cloud Diffusion (FLUX.1)',
        seed: '408138792',
        image_url: 'static/generated/art_6ce123849c14_408138792.png',
        created_at: '2026-10-28 05:13'
    }
];

document.addEventListener('DOMContentLoaded', () => {
    initPromptHandlers();
    initStyleSelectors();
    initAspectRatioSelectors();
    initGenerationForm();
    initModalViewer();
    initPromptEnhancer();
    initSettingsModal();
    initRecentStrip();
    initGalleryPage();
    updateNavBadge();
});

/**
 * Intelligent AI Prompt Expansion (Client-side mirror of Python smart_expand_prompt)
 */
function smartExpandPrompt(prompt, styleKey = 'photorealistic') {
    const clean = prompt.trim().replace(/\.+$/, '');
    if (!clean) return prompt;
    const lower = clean.toLowerCase();

    const isAnimal = ['dog', 'cat', 'puppy', 'kitten', 'bird', 'lion', 'tiger', 'cow', 'horse', 'elephant', 'whale', 'animal', 'fish', 'bear', 'wolf', 'rabbit'].some(w => lower.includes(w));
    const isPerson = ['man', 'woman', 'girl', 'boy', 'person', 'child', 'people', 'warrior', 'samurai', 'doctor', 'queen', 'king', 'model', 'dancer', 'astronaut'].some(w => lower.includes(w));
    const isLandscape = ['city', 'mountain', 'forest', 'beach', 'sunset', 'landscape', 'river', 'pond', 'ocean', 'island', 'space', 'sky', 'castle', 'temple', 'village'].some(w => lower.includes(w));

    const framing = (isPerson || isAnimal) ? 'Cinematic close-up portrait' : (isLandscape ? 'Expansive panoramic wide-angle view' : 'Highly focused composition');

    let lighting = 'balanced natural studio lighting with lifelike depth and accurate shadows';
    if (['night', 'dark', 'cyber', 'neon'].some(k => lower.includes(k))) {
        lighting = 'atmospheric nocturnal illumination with radiant specular highlights';
    } else if (['sun', 'morning', 'dawn', 'sunset', 'golden'].some(k => lower.includes(k))) {
        lighting = 'warm golden hour sunlight with soft diffused shadows and raytracing glow';
    } else if (['water', 'rain', 'pond', 'ocean', 'sea'].some(k => lower.includes(k))) {
        lighting = 'crystal-clear volumetric light refractions on glistening water surfaces';
    } else if (['space', 'cosmic', 'galaxy', 'nebula'].some(k => lower.includes(k))) {
        lighting = 'luminous celestial starlight and glowing ethereal nebula radiance';
    }

    const details = 'intricate surface textures, sharp focus, natural color fidelity, high dynamic range';
    return `${framing} of ${clean}, featuring ${lighting}, ${details}`;
}

function enhancePromptText(prompt, styleKey) {
    const styleInfo = STYLE_PRESETS[styleKey] || STYLE_PRESETS['photorealistic'];
    const suffix = (styleInfo && styleInfo.suffix) ? styleInfo.suffix.trim() : '';
    const clean = prompt.trim().replace(/\.+$/, '');
    if (!suffix) return clean;
    return `${clean}, ${suffix}`;
}

/**
 * Handle Prompt Input, Character Counter, and Randomizer
 */
function initPromptHandlers() {
    const promptInput = document.getElementById('promptInput');
    const charCounter = document.getElementById('charCount');
    const btnSurprise = document.getElementById('btnSurprise');
    const suggestionChips = document.querySelectorAll('.chip-suggestion');

    if (!promptInput) return;

    promptInput.addEventListener('input', () => {
        if (charCounter) {
            charCounter.textContent = promptInput.value.length;
        }
    });

    if (btnSurprise) {
        btnSurprise.addEventListener('click', () => {
            const randomIdea = PROMPT_IDEAS[Math.floor(Math.random() * PROMPT_IDEAS.length)];
            promptInput.value = randomIdea;
            if (charCounter) charCounter.textContent = randomIdea.length;
            promptInput.focus();
            showToast("Inspired! Prompt updated.");
        });
    }

    suggestionChips.forEach(chip => {
        chip.addEventListener('click', () => {
            const text = chip.getAttribute('data-prompt') || chip.textContent;
            promptInput.value = text;
            if (charCounter) charCounter.textContent = text.length;
            promptInput.focus();
        });
    });
}

/**
 * Handle Style Selection Chips
 */
function initStyleSelectors() {
    const styleCards = document.querySelectorAll('.style-card');
    const hiddenStyleInput = document.getElementById('selectedStyle');

    styleCards.forEach(card => {
        card.addEventListener('click', () => {
            styleCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            const styleKey = card.getAttribute('data-style');
            if (hiddenStyleInput) {
                hiddenStyleInput.value = styleKey;
            }
        });
    });
}

/**
 * Handle Aspect Ratio Selector Buttons
 */
function initAspectRatioSelectors() {
    const ratioBtns = document.querySelectorAll('.ratio-btn');
    const hiddenRatioInput = document.getElementById('selectedRatio');

    ratioBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            ratioBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const ratioKey = btn.getAttribute('data-ratio');
            if (hiddenRatioInput) {
                hiddenRatioInput.value = ratioKey;
            }
        });
    });
}

/**
 * Local Storage History Helpers
 */
function getLocalHistory() {
    try {
        const stored = localStorage.getItem('ai_art_gallery');
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        return [];
    }
}

function saveLocalHistory(items) {
    try {
        localStorage.setItem('ai_art_gallery', JSON.stringify(items));
        updateNavBadge();
    } catch (e) {
        console.warn('Could not save history to localStorage', e);
    }
}

function addGenerationToHistory(item) {
    const list = getLocalHistory();
    list.unshift(item);
    saveLocalHistory(list);
}

function updateNavBadge() {
    const countEl = document.getElementById('navGalleryCount');
    if (!countEl) return;
    const history = getLocalHistory();
    const count = history.length > 0 ? history.length : SHOWCASE_SAMPLES.length;
    countEl.textContent = count > 0 ? count : '';
}

/**
 * Handle Asynchronous Art Generation
 */
function initGenerationForm() {
    const form = document.getElementById('generateForm');
    const btnGenerate = document.getElementById('btnGenerate');
    const btnText = document.getElementById('btnGenerateText');
    
    const placeholderView = document.getElementById('placeholderView');
    const loadingView = document.getElementById('loadingView');
    const resultView = document.getElementById('resultView');
    
    const loadingStatus = document.getElementById('loadingStatus');
    const progressFill = document.getElementById('progressFill');
    
    const resultImage = document.getElementById('resultImage');
    const resultPrompt = document.getElementById('resultPrompt');
    const pillStyle = document.getElementById('pillStyle');
    const pillDimensions = document.getElementById('pillDimensions');
    const pillEngine = document.getElementById('pillEngine');
    const pillSeed = document.getElementById('pillSeed');
    const btnDownload = document.getElementById('btnDownload');
    const btnCopyPrompt = document.getElementById('btnCopyPrompt');
    const btnRemix = document.getElementById('btnRemix');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const promptInput = document.getElementById('promptInput');
        const prompt = promptInput ? promptInput.value.trim() : '';

        if (!prompt) {
            showToast("Please enter a prompt first!", "error");
            if (promptInput) promptInput.focus();
            return;
        }

        const style = document.getElementById('selectedStyle')?.value || 'photorealistic';
        const aspect_ratio = document.getElementById('selectedRatio')?.value || '1:1';
        let seed = parseInt(document.getElementById('seedInput')?.value);
        if (isNaN(seed) || seed === -1) {
            seed = Math.floor(Math.random() * 900000000) + 100000;
        }
        const engine = document.getElementById('engineSelect')?.value || 'auto';
        const model = document.getElementById('modelSelect')?.value || 'flux';
        const negative_prompt = document.getElementById('negativePromptInput')?.value || '';
        const enhance = document.getElementById('enhanceToggle')?.checked ?? true;

        // UI State: Loading
        btnGenerate.disabled = true;
        btnText.textContent = "Synthesizing Artwork...";
        
        if (placeholderView) placeholderView.style.display = 'none';
        if (resultView) resultView.style.display = 'none';
        if (loadingView) loadingView.style.display = 'flex';

        const timerIds = [];
        if (progressFill) progressFill.style.width = '10%';
        if (loadingStatus) loadingStatus.textContent = STATUS_STEPS[0].text;

        STATUS_STEPS.forEach((step) => {
            const tId = setTimeout(() => {
                if (progressFill) progressFill.style.width = `${step.progress}%`;
                if (loadingStatus) loadingStatus.textContent = step.text;
            }, step.time);
            timerIds.push(tId);
        });

        const clearTimers = () => timerIds.forEach(id => clearTimeout(id));

        try {
            let data = null;

            // Attempt backend Flask API first (if available)
            let backendSucceeded = false;
            try {
                const response = await fetch('/api/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        prompt: prompt,
                        style: style,
                        aspect_ratio: aspect_ratio,
                        seed: seed,
                        engine: engine,
                        model: model,
                        negative_prompt: negative_prompt,
                        enhance: enhance
                    })
                });

                if (response.ok) {
                    const result = await response.json();
                    if (result.success && result.data) {
                        data = result.data;
                        backendSucceeded = true;
                    }
                }
            } catch (err) {
                // Backend not available (e.g. GitHub Pages static deployment)
                backendSucceeded = false;
            }

            // Client-Side Direct Generation (GitHub Pages fallback)
            if (!backendSucceeded) {
                const [width, height] = ASPECT_RATIO_DIMS[aspect_ratio] || [1024, 1024];
                const enhancedPrompt = enhance ? enhancePromptText(prompt, style) : prompt;
                
                // Read client settings
                const localSettings = getLocalSettings();
                let imageUrl = '';
                let engineUsed = `Cloud Diffusion (${model.toUpperCase()})`;

                if (engine === 'huggingface' && localSettings.hf_token) {
                    // Direct Hugging Face Inference
                    imageUrl = await generateViaHuggingFace(enhancedPrompt, width, height, seed, localSettings.hf_token);
                    engineUsed = 'Hugging Face (FLUX.1 Schnell)';
                } else {
                    // High-accuracy Pollinations AI direct URL
                    let candModel = model || 'flux';
                    if (candModel === 'turbo') candModel = 'sana';
                    
                    let pUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=${width}&height=${height}&seed=${seed}&nologo=true&model=${candModel}`;
                    if (negative_prompt.trim()) {
                        pUrl += `&negative_prompt=${encodeURIComponent(negative_prompt.trim())}`;
                    }
                    if (localSettings.pollen_key) {
                        pUrl += `&key=${encodeURIComponent(localSettings.pollen_key)}`;
                    }

                    // Preload the image in memory to ensure synthesis completes before showing
                    await preloadImage(pUrl);
                    imageUrl = pUrl;
                }

                data = {
                    id: Date.now(),
                    prompt: prompt,
                    enhanced_prompt: enhancedPrompt,
                    style: style,
                    aspect_ratio: aspect_ratio,
                    dimensions: `${width}x${height}`,
                    seed: seed,
                    engine: engineUsed,
                    filename: `art_${seed}.png`,
                    image_url: imageUrl,
                    created_at: new Date().toISOString().replace('T', ' ').substring(0, 16)
                };

                // Save to browser localStorage history
                addGenerationToHistory(data);
            }

            clearTimers();

            if (data && data.image_url) {
                if (progressFill) progressFill.style.width = '100%';

                // Render result
                if (resultImage) {
                    resultImage.src = data.image_url;
                    resultImage.setAttribute('data-full', data.image_url);
                }
                if (resultPrompt) resultPrompt.textContent = data.prompt;
                if (pillStyle) pillStyle.textContent = `Style: ${data.style}`;
                if (pillDimensions) pillDimensions.textContent = data.dimensions;
                if (pillEngine) pillEngine.textContent = data.engine;
                if (pillSeed) pillSeed.textContent = `Seed: ${data.seed}`;

                if (btnDownload) {
                    btnDownload.href = data.image_url;
                    btnDownload.setAttribute('download', data.filename || `artwork_${data.seed}.png`);
                    btnDownload.setAttribute('target', '_blank');
                }

                if (btnCopyPrompt) {
                    btnCopyPrompt.onclick = () => {
                        navigator.clipboard.writeText(data.prompt);
                        showToast("Prompt copied to clipboard!");
                    };
                }

                if (btnRemix) {
                    btnRemix.onclick = () => {
                        promptInput.value = data.prompt;
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        showToast("Remix prompt loaded in Studio!");
                    };
                }

                // Make preview image clickable for zoom modal
                const wrapper = document.getElementById('resultImageWrapper');
                if (wrapper) {
                    wrapper.onclick = () => openModal(data.image_url, encodeURIComponent(data.prompt), data.style, data.seed);
                }

                // Switch views
                if (loadingView) loadingView.style.display = 'none';
                if (resultView) resultView.style.display = 'flex';

                showToast("Artwork generated successfully!");
                prependToRecentStrip(data);

            } else {
                throw new Error("Generation failed to return artwork.");
            }

        } catch (error) {
            clearTimers();
            console.error("Generation error:", error);
            showToast(error.message || "Failed to generate artwork.", "error");

            if (loadingView) loadingView.style.display = 'none';
            if (placeholderView) {
                placeholderView.style.display = 'block';
                placeholderView.innerHTML = `
                    <div class="placeholder-icon">⚠️</div>
                    <h3>Generation Paused</h3>
                    <p style="font-size: 0.9rem; margin-top: 0.4rem; color: #fca5a5;">${error.message || "Cloud diffusion servers are busy."}</p>
                    <p style="font-size: 0.82rem; margin-top: 0.6rem; color: var(--text-muted);">Tip: Free diffusion servers have a short cooldown between generations. Click <strong>Generate Artwork</strong> again to synthesize, or configure a free Hugging Face token in Settings.</p>
                `;
            }
        } finally {
            btnGenerate.disabled = false;
            btnText.textContent = "Generate Artwork";
        }
    });
}

/**
 * Preload Image Helper
 */
function preloadImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(url);
        img.onerror = () => reject(new Error("Image generation timed out. Please try again."));
        img.src = url;
    });
}

/**
 * Direct Hugging Face Inference
 */
async function generateViaHuggingFace(prompt, width, height, seed, token) {
    const modelId = "black-forest-labs/FLUX.1-schnell";
    const apiUrl = `https://router.huggingface.co/hf-inference/models/${modelId}`;
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            inputs: prompt,
            parameters: {
                width: Math.min(width, 1024),
                height: Math.min(height, 1024),
                seed: seed
            }
        })
    });
    if (!response.ok) {
        throw new Error(`Hugging Face API error (${response.status})`);
    }
    const blob = await response.blob();
    return URL.createObjectURL(blob);
}

/**
 * Populate Recent Creations Strip
 */
function initRecentStrip() {
    const stripGrid = document.getElementById('recentStripGrid');
    if (!stripGrid) return;

    const userHistory = getLocalHistory();
    const itemsToShow = userHistory.length > 0 ? userHistory.slice(0, 8) : SHOWCASE_SAMPLES;

    stripGrid.innerHTML = '';
    itemsToShow.forEach(item => {
        const card = document.createElement('div');
        card.className = 'strip-card';
        card.onclick = () => openModal(item.image_url, encodeURIComponent(item.prompt), item.style, item.seed);
        card.innerHTML = `
            <img src="${item.image_url}" alt="${item.prompt}" loading="lazy">
            <div class="strip-overlay">
                <span class="strip-prompt">${item.prompt}</span>
            </div>
        `;
        stripGrid.appendChild(card);
    });
}

/**
 * Prepend newly generated art into recent items strip
 */
function prependToRecentStrip(data) {
    const stripGrid = document.getElementById('recentStripGrid');
    if (!stripGrid) return;

    const card = document.createElement('div');
    card.className = 'strip-card';
    card.onclick = () => openModal(data.image_url, encodeURIComponent(data.prompt), data.style, data.seed);
    card.innerHTML = `
        <img src="${data.image_url}" alt="${data.prompt}">
        <div class="strip-overlay">
            <span class="strip-prompt">${data.prompt}</span>
        </div>
    `;
    stripGrid.prepend(card);
}

/**
 * Fullscreen Lightbox / Modal Viewer
 */
function initModalViewer() {
    const modal = document.getElementById('imageModal');
    if (!modal) return;

    modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.classList.contains('modal-close')) {
            closeModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
}

function openModal(imgSrc, promptEncoded, style, seed) {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    const modalPrompt = document.getElementById('modalPrompt');
    const modalMeta = document.getElementById('modalMeta');
    const modalDownload = document.getElementById('modalDownload');
    const modalCopy = document.getElementById('modalCopy');
    const modalRemix = document.getElementById('modalRemix');

    if (!modal || !modalImg) return;

    const prompt = decodeURIComponent(promptEncoded);
    modalImg.src = imgSrc;
    if (modalPrompt) modalPrompt.textContent = prompt;
    if (modalMeta) modalMeta.textContent = `Style: ${style} • Seed: ${seed}`;
    
    if (modalDownload) {
        modalDownload.href = imgSrc;
        modalDownload.setAttribute('download', `art_${seed}.png`);
        modalDownload.setAttribute('target', '_blank');
    }

    if (modalCopy) {
        modalCopy.onclick = () => {
            navigator.clipboard.writeText(prompt);
            showToast("Prompt copied to clipboard!");
        };
    }

    if (modalRemix) {
        modalRemix.onclick = () => {
            closeModal();
            const promptInput = document.getElementById('promptInput');
            if (promptInput) {
                promptInput.value = prompt;
                window.scrollTo({ top: 0, behavior: 'smooth' });
                showToast("Remix prompt loaded in Studio!");
            } else {
                window.location.href = `index.html`;
            }
        };
    }

    modal.classList.add('open');
}

function closeModal() {
    const modal = document.getElementById('imageModal');
    if (modal) modal.classList.remove('open');
}

/**
 * Toast Notification Helper
 */
function showToast(message, type = "info") {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    if (type === 'error') {
        toast.style.borderLeftColor = '#ef4444';
    }
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 400);
    }, 3200);
}

/**
 * AI Prompt Enhancer Handler
 */
function initPromptEnhancer() {
    const btnEnhance = document.getElementById('btnEnhancePrompt');
    const promptInput = document.getElementById('promptInput');
    const charCounter = document.getElementById('charCount');
    const hiddenStyle = document.getElementById('selectedStyle');

    if (!btnEnhance || !promptInput) return;

    btnEnhance.addEventListener('click', async () => {
        const prompt = promptInput.value.trim();
        if (!prompt) {
            showToast("Please type a short idea or prompt first!", "error");
            promptInput.focus();
            return;
        }

        const originalHtml = btnEnhance.innerHTML;
        btnEnhance.disabled = true;
        btnEnhance.innerHTML = "<span>✨ Expanding...</span>";

        try {
            const style = hiddenStyle ? hiddenStyle.value : 'photorealistic';
            let enhanced = '';

            // Try backend API first, otherwise client-side
            try {
                const res = await fetch('/api/enhance-prompt', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prompt: prompt, style: style })
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.success && data.enhanced_prompt) {
                        enhanced = data.enhanced_prompt;
                    }
                }
            } catch (e) {
                // Backend not available, use client-side expansion
            }

            if (!enhanced) {
                enhanced = smartExpandPrompt(prompt, style);
            }

            promptInput.value = enhanced;
            if (charCounter) charCounter.textContent = enhanced.length;
            showToast("Prompt expanded with photorealistic details!");

        } catch (err) {
            showToast("Could not enhance prompt", "error");
        } finally {
            btnEnhance.disabled = false;
            btnEnhance.innerHTML = originalHtml;
        }
    });
}

/**
 * Settings Management & Local Storage
 */
function getLocalSettings() {
    try {
        const s = localStorage.getItem('ai_art_settings');
        return s ? JSON.parse(s) : {};
    } catch (e) {
        return {};
    }
}

function saveLocalSettings(settings) {
    try {
        localStorage.setItem('ai_art_settings', JSON.stringify(settings));
    } catch (e) {
        console.warn('Could not save settings to localStorage', e);
    }
}

function initSettingsModal() {
    const modal = document.getElementById('settingsModal');
    const btnOpen = document.getElementById('btnOpenSettings');
    const btnClose = document.getElementById('btnCloseSettings');
    const form = document.getElementById('settingsForm');

    if (!modal) return;

    if (btnOpen) {
        btnOpen.addEventListener('click', async () => {
            modal.classList.add('open');
            const local = getLocalSettings();
            
            const hf = document.getElementById('settingHfToken');
            const oa = document.getElementById('settingOpenAiKey');
            const st = document.getElementById('settingStabilityKey');
            const po = document.getElementById('settingPollenKey');
            const sd = document.getElementById('settingSdUrl');

            if (hf && local.hf_token) hf.value = local.hf_token;
            if (oa && local.openai_api_key) oa.value = local.openai_api_key;
            if (st && local.stability_api_key) st.value = local.stability_api_key;
            if (po && local.pollen_key) po.value = local.pollen_key;
            if (sd && local.sd_url) sd.value = local.sd_url;

            // Also check backend settings if connected
            try {
                const res = await fetch('/api/settings');
                if (res.ok) {
                    const data = await res.json();
                    if (data.success && data.keys) {
                        const k = data.keys;
                        if (hf && k.hf_token_configured) hf.placeholder = "●●● Token Configured (Server) ●●●";
                        if (oa && k.openai_configured) oa.placeholder = "●●● Key Configured (Server) ●●●";
                        if (st && k.stability_configured) st.placeholder = "●●● Key Configured (Server) ●●●";
                    }
                }
            } catch (e) {}
        });
    }

    if (btnClose) {
        btnClose.addEventListener('click', () => modal.classList.remove('open'));
    }

    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('open');
    });

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const hfVal = document.getElementById('settingHfToken')?.value.trim();
            const oaVal = document.getElementById('settingOpenAiKey')?.value.trim();
            const stVal = document.getElementById('settingStabilityKey')?.value.trim();
            const poVal = document.getElementById('settingPollenKey')?.value.trim();
            const sdVal = document.getElementById('settingSdUrl')?.value.trim();

            const payload = {};
            if (hfVal) payload.hf_token = hfVal;
            if (oaVal) payload.openai_api_key = oaVal;
            if (stVal) payload.stability_api_key = stVal;
            if (poVal) payload.pollen_key = poVal;
            if (sdVal) payload.sd_url = sdVal;

            // Always save to browser localStorage
            saveLocalSettings(payload);

            // Attempt backend save as well
            try {
                await fetch('/api/settings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            } catch (err) {}

            showToast("API keys saved and applied successfully!");
            modal.classList.remove('open');
        });
    }
}

/**
 * Gallery & History Page Manager
 */
function initGalleryPage() {
    const galleryGrid = document.getElementById('galleryGrid');
    if (!galleryGrid) return; // Not on history.html

    const filterPills = document.querySelectorAll('.pill-filter');
    const searchInput = document.getElementById('gallerySearchInput');
    const btnClear = document.getElementById('btnClearHistory');
    const emptyState = document.getElementById('galleryEmptyState');
    const totalArtCount = document.getElementById('totalArtCount');

    let currentFilter = 'all';
    let searchQuery = '';

    function getCombinedItems() {
        const local = getLocalHistory();
        return local.length > 0 ? local : SHOWCASE_SAMPLES;
    }

    function renderGallery() {
        const allItems = getCombinedItems();
        if (totalArtCount) totalArtCount.textContent = allItems.length;

        const filtered = allItems.filter(item => {
            const matchesStyle = (currentFilter === 'all') || (item.style === currentFilter);
            const matchesSearch = !searchQuery || item.prompt.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesStyle && matchesSearch;
        });

        galleryGrid.innerHTML = '';

        if (filtered.length === 0) {
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        if (emptyState) emptyState.style.display = 'none';

        filtered.forEach(item => {
            const card = document.createElement('div');
            card.className = 'gallery-card';
            card.id = `card-${item.id}`;
            card.innerHTML = `
                <div class="gallery-thumb-wrapper">
                    <img src="${item.image_url}" alt="${item.prompt}" loading="lazy">
                </div>
                <div class="gallery-body">
                    <p class="gallery-prompt" title="${item.prompt}">${item.prompt}</p>
                    <div style="display: flex; gap: 0.4rem; margin-bottom: 0.8rem; flex-wrap: wrap;">
                        <span class="meta-pill">${item.style}</span>
                        <span class="meta-pill">${item.dimensions || '1024x1024'}</span>
                        <span class="meta-pill">${item.engine || 'Cloud Diffusion'}</span>
                    </div>
                    <div class="gallery-footer">
                        <span class="gallery-date">${(item.created_at || '').substring(0, 16)}</span>
                        <div class="gallery-btn-group">
                            <a href="${item.image_url}" download="${item.filename || 'artwork.png'}" target="_blank" class="btn-icon" title="Download Image">
                                📥
                            </a>
                            <button type="button" class="btn-icon delete" title="Delete Artwork" data-id="${item.id}">
                                🗑️
                            </button>
                        </div>
                    </div>
                </div>
            `;

            // Card zoom
            const thumb = card.querySelector('.gallery-thumb-wrapper');
            if (thumb) {
                thumb.onclick = () => openModal(item.image_url, encodeURIComponent(item.prompt), item.style, item.seed);
            }

            // Card delete
            const btnDel = card.querySelector('.btn-icon.delete');
            if (btnDel) {
                btnDel.onclick = (e) => {
                    e.stopPropagation();
                    deleteGalleryItem(item.id, card);
                };
            }

            galleryGrid.appendChild(card);
        });
    }

    function deleteGalleryItem(id, cardElement) {
        if (!confirm("Are you sure you want to delete this artwork?")) return;

        let history = getLocalHistory();
        history = history.filter(item => String(item.id) !== String(id));
        saveLocalHistory(history);

        if (cardElement) {
            cardElement.style.transition = "opacity 0.3s, transform 0.3s";
            cardElement.style.opacity = '0';
            cardElement.style.transform = 'scale(0.9)';
            setTimeout(() => {
                cardElement.remove();
                renderGallery();
            }, 300);
        }
        showToast("Artwork removed from gallery.");
    }

    // Filter pills
    filterPills.forEach(pill => {
        pill.addEventListener('click', () => {
            filterPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            currentFilter = pill.getAttribute('data-filter') || 'all';
            renderGallery();
        });
    });

    // Search input
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.trim();
            renderGallery();
        });
    }

    // Clear All
    if (btnClear) {
        btnClear.addEventListener('click', () => {
            if (!confirm("Clear your entire generation history?")) return;
            saveLocalHistory([]);
            renderGallery();
            showToast("Gallery cleared.");
        });
    }

    renderGallery();
}
