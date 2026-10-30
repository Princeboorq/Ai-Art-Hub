import os
import logging
from flask import Flask, render_template, request, jsonify, redirect, url_for, flash
from config import Config
from utils.database import (
    init_db,
    save_generation,
    get_generations,
    get_generation_by_id,
    delete_generation,
    clear_all_generations,
    get_stats
)
from utils.image_generator import (
    generate_art,
    STYLE_PRESETS,
    ASPECT_RATIOS,
    smart_expand_prompt
)

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
logger = logging.getLogger(__name__)

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

app = Flask(
    __name__,
    template_folder=os.path.join(BASE_DIR, 'templates'),
    static_folder=os.path.join(BASE_DIR, 'static')
)
app.config.from_object(Config)

# Ensure upload, generated, and database directories exist safely
try:
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    os.makedirs(app.config['GENERATED_FOLDER'], exist_ok=True)
    os.makedirs(os.path.dirname(app.config['DATABASE_PATH']), exist_ok=True)
    # Initialize SQLite tables
    init_db()
except Exception as e:
    logger.warning(f"Storage / database init warning: {e}")

@app.route('/')
def index():
    """Studio / Generator Page."""
    recent_art = get_generations(limit=8)
    stats = get_stats()
    return render_template(
        'index.html',
        styles=STYLE_PRESETS,
        aspect_ratios=ASPECT_RATIOS,
        recent_art=recent_art,
        stats=stats,
        hf_token_configured=bool(Config.HF_TOKEN),
        openai_configured=bool(Config.OPENAI_API_KEY),
        stability_configured=bool(Config.STABILITY_API_KEY),
        pollen_configured=bool(Config.POLLEN_API_KEY)
    )

@app.route('/api/enhance-prompt', methods=['POST'])
def api_enhance_prompt():
    """AI Prompt Enhancement endpoint - expands brief prompts into detailed scenes."""
    try:
        data = request.get_json(force=True) if request.is_json else request.form.to_dict()
        prompt = data.get('prompt', '').strip()
        style = data.get('style', 'photorealistic')
        
        if not prompt:
            return jsonify({'success': False, 'error': 'Please enter a prompt first.'}), 400
            
        enhanced = smart_expand_prompt(prompt, style)
        return jsonify({'success': True, 'enhanced_prompt': enhanced})
    except Exception as e:
        logger.exception("Error enhancing prompt")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/settings', methods=['GET', 'POST'])
def api_settings():
    """Get status or save API configuration keys."""
    env_file = os.path.join(Config.BASE_DIR, '.env')
    
    if request.method == 'GET':
        return jsonify({
            'success': True,
            'keys': {
                'hf_token_configured': bool(Config.HF_TOKEN),
                'openai_configured': bool(Config.OPENAI_API_KEY),
                'stability_configured': bool(Config.STABILITY_API_KEY),
                'pollen_configured': bool(Config.POLLEN_API_KEY),
                'sd_url': Config.STABLE_DIFFUSION_API_URL
            }
        })
        
    try:
        data = request.get_json(force=True) if request.is_json else request.form.to_dict()
        
        # Read existing .env lines
        existing = {}
        if os.path.exists(env_file):
            with open(env_file, 'r', encoding='utf-8') as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith('#') and '=' in line:
                        k, v = line.split('=', 1)
                        existing[k.strip()] = v.strip()

        # Update fields if provided
        for key, field in [
            ('HF_TOKEN', 'hf_token'),
            ('OPENAI_API_KEY', 'openai_api_key'),
            ('STABILITY_API_KEY', 'stability_api_key'),
            ('POLLEN_API_KEY', 'pollen_api_key'),
            ('STABLE_DIFFUSION_API_URL', 'sd_url')
        ]:
            val = data.get(field)
            if val is not None:
                existing[key] = val.strip()

        # Write back to .env
        with open(env_file, 'w', encoding='utf-8') as f:
            for k, v in existing.items():
                f.write(f"{k}={v}\n")
                
        # Reload Config
        Config.reload()
        logger.info("Configuration reloaded successfully.")
        
        return jsonify({
            'success': True,
            'message': 'API settings saved and applied successfully!',
            'keys': {
                'hf_token_configured': bool(Config.HF_TOKEN),
                'openai_configured': bool(Config.OPENAI_API_KEY),
                'stability_configured': bool(Config.STABILITY_API_KEY),
                'pollen_configured': bool(Config.POLLEN_API_KEY)
            }
        })
    except Exception as e:
        logger.exception("Error saving settings")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/generate', methods=['POST'])
def api_generate():
    """API endpoint to generate art asynchronously via JSON request."""
    try:
        data = request.get_json(force=True) if request.is_json else request.form.to_dict()
        
        prompt = data.get('prompt', '').strip()
        if not prompt:
            return jsonify({'success': False, 'error': 'Please enter a prompt to generate artwork.'}), 400
            
        style = data.get('style', 'cyberpunk')
        aspect_ratio = data.get('aspect_ratio', '1:1')
        engine = data.get('engine', 'auto')
        model = data.get('model', 'flux')
        negative_prompt = data.get('negative_prompt', '')
        enhance = str(data.get('enhance', 'true')).lower() in ('true', '1', 'yes')
        
        seed_raw = data.get('seed')
        try:
            seed = int(seed_raw) if seed_raw not in (None, '', -1, '-1') else None
        except ValueError:
            seed = None

        logger.info(f"Generating artwork for prompt: '{prompt}' (style: {style}, aspect: {aspect_ratio}, engine: {engine}, model: {model})")
        
        # Execute Generation
        result = generate_art(
            prompt=prompt,
            style=style,
            aspect_ratio=aspect_ratio,
            seed=seed,
            engine=engine,
            enhance=enhance,
            model=model,
            negative_prompt=negative_prompt
        )
        
        # Save to SQLite Database
        record_id = save_generation(
            prompt=result['prompt'],
            enhanced_prompt=result['enhanced_prompt'],
            style=result['style'],
            aspect_ratio=result['aspect_ratio'],
            dimensions=result['dimensions'],
            seed=result['seed'],
            engine=result['engine'],
            filename=result['filename'],
            filepath=result['filepath']
        )
        result['id'] = record_id
        
        logger.info(f"Artwork saved successfully as {result['filename']} (ID: {record_id})")
        return jsonify({'success': True, 'data': result})

    except Exception as e:
        logger.exception("Error during image generation")
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/history')
def history():
    """Gallery page of past generations."""
    style_filter = request.args.get('style', 'all')
    search_query = request.args.get('q', '').strip()
    
    items = get_generations(limit=100, style=style_filter, search=search_query)
    stats = get_stats()
    
    return render_template(
        'history.html',
        items=items,
        styles=STYLE_PRESETS,
        current_style=style_filter,
        search_query=search_query,
        stats=stats
    )

@app.route('/api/history/<int:item_id>', methods=['DELETE'])
def api_delete_history(item_id):
    """Delete a generated artwork from DB and filesystem."""
    try:
        filename = delete_generation(item_id)
        if not filename:
            return jsonify({'success': False, 'error': 'Artwork not found.'}), 404
            
        filepath = os.path.join(Config.GENERATED_FOLDER, filename)
        if os.path.exists(filepath):
            try:
                os.remove(filepath)
            except OSError as e:
                logger.warning(f"Could not remove file {filepath}: {e}")
                
        return jsonify({'success': True, 'message': 'Artwork deleted successfully.'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/history/clear', methods=['POST'])
def api_clear_history():
    """Clear all generation history and delete image files."""
    try:
        count = clear_all_generations(Config.GENERATED_FOLDER)
        return jsonify({'success': True, 'count': count, 'message': f'Cleared {count} artworks.'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/about')
def about():
    """Information and guide page."""
    stats = get_stats()
    return render_template('about.html', stats=stats)

@app.route('/static/generated/<path:filename>')
def serve_generated_file(filename):
    """Serve dynamically generated images across local and serverless environments."""
    from flask import send_from_directory
    if os.path.exists(os.path.join(Config.GENERATED_FOLDER, filename)):
        return send_from_directory(Config.GENERATED_FOLDER, filename)
    local_dir = os.path.join(Config.BASE_DIR, 'static', 'generated')
    if os.path.exists(os.path.join(local_dir, filename)):
        return send_from_directory(local_dir, filename)
    return "Image not found", 404

if __name__ == '__main__':
    print("=" * 60)
    print("AI Art Generator is starting!")
    print("Open your browser at: http://127.0.0.1:5000")
    print("=" * 60)
    app.run(host='127.0.0.1', port=5000, debug=True)
