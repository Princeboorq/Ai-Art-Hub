"""
Database utility module for AI Art Generator.
Handles SQLite operations for storing and querying art generation history.
"""
import os
import sqlite3
from datetime import datetime
from config import Config

def get_db_connection():
    """Create and return a database connection with dict-like row access."""
    os.makedirs(os.path.dirname(Config.DATABASE_PATH), exist_ok=True)
    conn = sqlite3.connect(Config.DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize database tables if they do not exist."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS generations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            prompt TEXT NOT NULL,
            enhanced_prompt TEXT,
            style TEXT NOT NULL,
            aspect_ratio TEXT NOT NULL,
            dimensions TEXT NOT NULL,
            seed INTEGER,
            engine TEXT NOT NULL,
            filename TEXT NOT NULL,
            filepath TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()

def save_generation(prompt, enhanced_prompt, style, aspect_ratio, dimensions, seed, engine, filename, filepath):
    """Save a new generation record to SQLite."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO generations (
            prompt, enhanced_prompt, style, aspect_ratio, dimensions, seed, engine, filename, filepath, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        prompt,
        enhanced_prompt,
        style,
        aspect_ratio,
        dimensions,
        seed,
        engine,
        filename,
        filepath,
        datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')
    ))
    new_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return new_id

def get_generations(limit=50, offset=0, style=None, search=None):
    """Fetch generation history with optional filters."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = "SELECT * FROM generations WHERE 1=1"
    params = []
    
    if style and style.lower() != 'all':
        query += " AND LOWER(style) = LOWER(?)"
        params.append(style)
        
    if search:
        query += " AND (prompt LIKE ? OR enhanced_prompt LIKE ?)"
        term = f"%{search}%"
        params.extend([term, term])
        
    query += " ORDER BY id DESC LIMIT ? OFFSET ?"
    params.extend([limit, offset])
    
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    
    return [dict(row) for row in rows]

def get_generation_by_id(gen_id):
    """Retrieve a single generation by primary key."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM generations WHERE id = ?", (gen_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def delete_generation(gen_id):
    """Delete a generation record and return its filename for cleanup."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT filename FROM generations WHERE id = ?", (gen_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return None
        
    filename = row['filename']
    cursor.execute("DELETE FROM generations WHERE id = ?", (gen_id,))
    conn.commit()
    conn.close()
    return filename

def clear_all_generations(generated_folder: str = None) -> int:
    """Delete all records from generations table and remove image files."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT filename FROM generations")
    rows = cursor.fetchall()
    
    if generated_folder and os.path.exists(generated_folder):
        for row in rows:
            fpath = os.path.join(generated_folder, row['filename'])
            if os.path.exists(fpath):
                try:
                    os.remove(fpath)
                except OSError:
                    pass
                    
    cursor.execute("DELETE FROM generations")
    conn.commit()
    count = len(rows)
    conn.close()
    return count

def get_stats():
    """Return summary statistics about generated artwork."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) as total FROM generations")
    total = cursor.fetchone()['total']
    
    cursor.execute("""
        SELECT style, COUNT(*) as count 
        FROM generations 
        GROUP BY style 
        ORDER BY count DESC 
        LIMIT 1
    """)
    top_style_row = cursor.fetchone()
    top_style = top_style_row['style'] if top_style_row else 'None'
    
    conn.close()
    return {
        'total': total,
        'top_style': top_style
    }
