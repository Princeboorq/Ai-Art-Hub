/**
 * AI Art Generator - Interactive Client-Side Application
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

document.addEventListener('DOMContentLoaded', () => {
    initPromptHandlers();
    initStyleSelectors();
    initAspectRatioSelectors();
    initGenerationForm();
    initModalViewer();
    initPromptEnhancer();
    initSettingsModal();
});

/**
 * Handle Prompt Input, Character Counter, and Randomizer
 */
function initPromptHandlers() {
    const promptInput = document.getElementById('promptInput');
    const charCounter = document.getElementById('charCount');
    const btnSurprise = document.getElementById('btnSurprise');
    const suggestionChips = document.querySelectorAll('.chip-suggestion');

    if (!promptInput) return;

    // Character counter
    promptInput.addEventListener('input', () => {
        if (charCounter) {
            charCounter.textContent = promptInput.value.length;
        }
    });

    // Surprise Me / Inspire Me button
    if (btnSurprise) {
        btnSurprise.addEventListener('click', () => {
            const randomIdea = PROMPT_IDEAS[Math.floor(Math.random() * PROMPT_IDEAS.length)];
            promptInput.value = randomIdea;
            if (charCounter) charCounter.textContent = randomIdea.length;
            promptInput.focus();
            showToast("Inspired! Prompt updated.");
        });
    }

    // Quick suggestion chips
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
 * Handle Asynchronous Art Generation
 */
function initGenerationForm() {
    const form = document.getElementById('generateForm');
    const btnGenerate = document.getElementById('btnGenerate');
    const btnText = document.getElementById('btnGenerateText');
    
    // Viewport elements
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
        const seed = document.getElementById('seedInput')?.value || -1;
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

        // Animate simulated progress steps smoothly across generation duration
        const timerIds = [];
        if (progressFill) progressFill.style.width = '10%';
        if (loadingStatus) loadingStatus.textContent = STATUS_STEPS[0].text;

        STATUS_STEPS.forEach((step, idx) => {
            const tId = setTimeout(() => {
                if (progressFill) progressFill.style.width = `${step.progress}%`;
                if (loadingStatus) loadingStatus.textContent = step.text;
            }, step.time);
            timerIds.push(tId);
        });

        const clearTimers = () => timerIds.forEach(id => clearTimeout(id));

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

            const result = await response.json();
            clearTimers();

            if (result.success && result.data) {
                const data = result.data;
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
                    btnDownload.setAttribute('download', data.filename);
                }

                if (btnCopyPrompt) {
                    btnCopyPrompt.onclick = () => {
                        navigator.clipboard.writeText(data.prompt);
                        showToast("Prompt copied to clipboard!");
                    };
                }

                // Switch views
                if (loadingView) loadingView.style.display = 'none';
                if (resultView) resultView.style.display = 'flex';

                showToast("Artwork generated successfully!");
                prependToRecentStrip(data);

            } else {
                throw new Error(result.error || "Generation failed.");
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
                    <p style="font-size: 0.82rem; margin-top: 0.6rem; color: var(--text-muted);">Tip: Free servers have a 30s cooldown between images. Click <strong>Generate Artwork</strong> again to synthesize, or configure a free Hugging Face token in Settings.</p>
                `;
            }
        } finally {
            btnGenerate.disabled = false;
            btnText.textContent = "Generate Artwork";
        }
    });
}

/**
 * Prepend newly generated art into recent items strip
 */
function prependToRecentStrip(data) {
    const stripGrid = document.querySelector('.strip-grid');
    if (!stripGrid) return;

    const card = document.createElement('div');
    card.className = 'strip-card';
    card.setAttribute('onclick', `openModal('${data.image_url}', '${encodeURIComponent(data.prompt)}', '${data.style}', '${data.seed}')`);
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

    if (!modal || !modalImg) return;

    const prompt = decodeURIComponent(promptEncoded);
    modalImg.src = imgSrc;
    if (modalPrompt) modalPrompt.textContent = prompt;
    if (modalMeta) modalMeta.textContent = `Style: ${style} • Seed: ${seed}`;
    
    if (modalDownload) {
        modalDownload.href = imgSrc;
        modalDownload.setAttribute('download', `art_${seed}.png`);
    }

    if (modalCopy) {
        modalCopy.onclick = () => {
            navigator.clipboard.writeText(prompt);
            showToast("Prompt copied to clipboard!");
        };
    }

    modal.classList.add('open');
}

function closeModal() {
    const modal = document.getElementById('imageModal');
    if (modal) modal.classList.remove('open');
}

/**
 * Delete Generation from History Gallery
 */
async function deleteGeneration(id, cardElement) {
    if (!confirm("Are you sure you want to delete this artwork?")) return;

    try {
        const response = await fetch(`/api/history/${id}`, { method: 'DELETE' });
        const result = await response.json();

        if (result.success) {
            showToast("Artwork deleted.");
            if (cardElement) {
                cardElement.style.transition = "opacity 0.3s, transform 0.3s";
                cardElement.style.opacity = '0';
                cardElement.style.transform = 'scale(0.9)';
                setTimeout(() => cardElement.remove(), 300);
            }
        } else {
            showToast(result.error || "Could not delete artwork", "error");
        }
    } catch (err) {
        showToast("Error deleting artwork", "error");
    }
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
            const res = await fetch('/api/enhance-prompt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: prompt, style: style })
            });
            const data = await res.json();
            if (data.success && data.enhanced_prompt) {
                promptInput.value = data.enhanced_prompt;
                if (charCounter) charCounter.textContent = data.enhanced_prompt.length;
                showToast("Prompt expanded with photorealistic details!");
            } else {
                showToast(data.error || "Could not enhance prompt", "error");
            }
        } catch (err) {
            showToast("Error connecting to prompt enhancer", "error");
        } finally {
            btnEnhance.disabled = false;
            btnEnhance.innerHTML = originalHtml;
        }
    });
}

/**
 * Settings Modal and API Key Management
 */
function initSettingsModal() {
    const modal = document.getElementById('settingsModal');
    const btnOpen = document.getElementById('btnOpenSettings');
    const btnClose = document.getElementById('btnCloseSettings');
    const form = document.getElementById('settingsForm');

    if (!modal) return;

    if (btnOpen) {
        btnOpen.addEventListener('click', async () => {
            modal.classList.add('open');
            try {
                const res = await fetch('/api/settings');
                const data = await res.json();
                if (data.success && data.keys) {
                    const k = data.keys;
                    const hf = document.getElementById('settingHfToken');
                    const oa = document.getElementById('settingOpenAiKey');
                    const st = document.getElementById('settingStabilityKey');
                    const po = document.getElementById('settingPollenKey');
                    const sd = document.getElementById('settingSdUrl');

                    if (hf && k.hf_token_configured) hf.placeholder = "●●● Token Configured ●●●";
                    if (oa && k.openai_configured) oa.placeholder = "●●● Key Configured ●●●";
                    if (st && k.stability_configured) st.placeholder = "●●● Key Configured ●●●";
                    if (po && k.pollen_configured) po.placeholder = "●●● Key Configured ●●●";
                    if (sd && k.sd_url) sd.value = k.sd_url;
                }
            } catch (e) {
                console.warn("Could not fetch settings:", e);
            }
        });
    }

    if (btnClose) {
        btnClose.addEventListener('click', () => {
            modal.classList.remove('open');
        });
    }

    // Close on clicking backdrop
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('open');
        }
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
            if (poVal) payload.pollen_api_key = poVal;
            if (sdVal) payload.sd_url = sdVal;

            try {
                const res = await fetch('/api/settings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                if (data.success) {
                    showToast("API keys saved and applied successfully!");
                    modal.classList.remove('open');
                    if (data.keys) {
                        updateEngineOptions(data.keys);
                    }
                } else {
                    showToast(data.error || "Failed to save settings", "error");
                }
            } catch (err) {
                showToast("Error saving settings", "error");
            }
        });
    }
}

function updateEngineOptions(keys) {
    const engineSelect = document.getElementById('engineSelect');
    if (!engineSelect) return;
    const optHf = engineSelect.querySelector('option[value="huggingface"]');
    const optOa = engineSelect.querySelector('option[value="openai"]');
    const optSt = engineSelect.querySelector('option[value="stability"]');

    if (optHf) {
        optHf.disabled = !keys.hf_token_configured;
        optHf.textContent = keys.hf_token_configured ? "Hugging Face FLUX.1 ⚡ (Active)" : "Hugging Face FLUX.1 (Token in Settings)";
    }
    if (optOa) {
        optOa.disabled = !keys.openai_configured;
        optOa.textContent = keys.openai_configured ? "OpenAI DALL-E 3 ⚡ (Active)" : "OpenAI DALL-E 3 (Key in Settings)";
    }
    if (optSt) {
        optSt.disabled = !keys.stability_configured;
        optSt.textContent = keys.stability_configured ? "Stability AI SD 3.5 ⚡ (Active)" : "Stability AI SD 3.5 (Key in Settings)";
    }
}
