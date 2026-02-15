#!/usr/bin/env python3
"""Binary Hangman API Server"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import random
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Word lists
WORDS = []
NUMBERS = []
SPECIAL_CHARS = []
ALL_CHARS = []

def load_words():
    """Load words from system dictionary"""
    global WORDS, NUMBERS, SPECIAL_CHARS, ALL_CHARS
    dict_paths = [
        '/usr/share/dict/words',
        '/usr/share/dictionaries-common/words',
    ]
    
    # Load words from dictionary
    for path in dict_paths:
        if os.path.exists(path):
            try:
                with open(path, 'r') as f:
                    words = []
                    for word in f:
                        word = word.strip()
                        # Hangman words: 4-8 letters, letters only
                        if 4 <= len(word) <= 8 and word.isalpha():
                            words.append(word.upper())
                    if words:
                        WORDS = words
                        print(f"Loaded {len(WORDS)} hangman words from {path}")
                        break
            except Exception as e:
                print(f"Error loading dict: {e}")
    
    if not WORDS:
        WORDS = [
            "PYTHON", "BINARY", "GHOST", "SYSTEM", "CODING", "HACKER", "MEMORY",
            "NETWORK", "SERVER", "CLIENT", "PROTOCOL", "ENCRYPT", "DECRYPT",
            "PASSWORD", "SECRET", "VIRTUAL", "DIGITAL", "PACKET", "ROUTER",
            "DATABASE", "SESSION", "KEYBOARD", "MONITOR", "TERMINAL", "SHELL",
            "ALGORITHM", "DEBUG", "COMPILER", "FUNCTION", "VARIABLE", "ARRAY",
            "STRING", "INTEGER", "BOOLEAN", "OBJECT", "CLASS", "METHOD"
        ]
        print(f"Using fallback word list: {len(WORDS)} words")
    
    # Numbers 0-99
    NUMBERS = [str(i).zfill(2) for i in range(100)]
    
    # Special characters
    SPECIAL_CHARS = [
        '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '-', '_', '=', '+',
        '[', ']', '{', '}', '|', '\\', ';', ':', "'", '"', ',', '.', '<', '>',
        '/', '?', '~', '`'
    ]
    
    # All for random mode
    ALL_CHARS = WORDS + NUMBERS + SPECIAL_CHARS
    print(f"Total - Words: {len(WORDS)}, Numbers: {len(NUMBERS)}, Special: {len(SPECIAL_CHARS)}, Random: {len(ALL_CHARS)}")

def char_to_binary(char):
    """Convert character to 8-bit binary"""
    return format(ord(char), '08b')

def word_to_binary(word):
    """Convert word to binary string"""
    return ' '.join(char_to_binary(c) for c in word)

def binary_to_char(binary):
    """Convert binary to character"""
    try:
        decimal = int(binary, 2)
        if 0 <= decimal <= 255:
            return chr(decimal)
    except:
        pass
    return None

@app.route('/api/modes', methods=['GET'])
def get_modes():
    """Get available game modes"""
    return jsonify([
        {'id': 'words', 'name': 'WORDS', 'description': 'Dictionary words (4-8 letters)'},
        {'id': 'numbers', 'name': 'NUMBERS', 'description': 'Two-digit numbers (00-99)'},
        {'id': 'special', 'name': 'SPECIAL', 'description': 'Special characters (!@#$%^&*)'},
        {'id': 'random', 'name': 'RANDOM', 'description': 'Mix of all categories'},
    ])

@app.route('/api/knowledge', methods=['GET'])
def get_knowledge():
    """Get binary conversion table"""
    # Letters A-Z
    letters = [{'char': chr(i), 'binary': char_to_binary(chr(i)), 'decimal': i} for i in range(65, 91)]
    # Numbers 00-99
    numbers = [{'char': str(i).zfill(2), 'binary': char_to_binary(chr(48 + i // 10)) + ' ' + char_to_binary(chr(48 + i % 10)), 'decimal': i} for i in range(100)]
    # Special characters
    special = [{'char': c, 'binary': char_to_binary(c), 'decimal': ord(c)} for c in SPECIAL_CHARS]
    return jsonify({'letters': letters, 'numbers': numbers, 'special': special})

@app.route('/api/game/new', methods=['POST'])
def new_game():
    """Start a new game"""
    data = request.get_json() or {}
    player_name = data.get('name', 'Player')[:10]
    mode = data.get('mode', 'words')
    
    # Select word list based on mode
    if mode == 'numbers':
        word = random.choice(NUMBERS)
    elif mode == 'special':
        word = random.choice(SPECIAL_CHARS)
    elif mode == 'random':
        word = random.choice(ALL_CHARS)
    else:
        word = random.choice(WORDS)
    
    game_id = f"{player_name}_{int(datetime.now().timestamp())}"
    
    games[game_id] = {
        'word': word,
        'guessed': [],
        'wrong': 0,
        'max_wrong': 6,
        'player': player_name,
        'status': 'playing',
        'mode': mode
    }
    
    # Return word in binary for learning!
    return jsonify({
        'game_id': game_id,
        'word': '?' * len(word),
        'word_full': word,  # Full word for binary display
        'positions': [],  # No positions revealed yet
        'word_binary': word_to_binary(word),
        'word_length': len(word),
        'player': player_name,
        'mode': mode,
        'guessed': [],
        'wrong': 0,
        'max_wrong': 6,
        'status': 'playing'
    })

@app.route('/api/game/<game_id>/guess', methods=['POST'])
def make_guess(game_id):
    """Make a guess"""
    if game_id not in games:
        return jsonify({'error': 'Game not found'}), 404
    
    game = games[game_id]
    if game['status'] != 'playing':
        return jsonify({'error': 'Game already over'}), 400
    
    data = request.get_json() or {}
    guess = data.get('guess', '').strip()
    
    if not guess:
        return jsonify({'error': 'No guess provided'}), 400
    
    original_guess = guess
    guess_binary = ""
    
    # Handle binary input
    guess_upper = guess.upper()
    if set(guess_upper) <= {'0', '1'} and len(guess_upper) == 8:
        guess_binary = guess_upper
        char = binary_to_char(guess_upper)
        if char:
            guess = char.upper()
    
    guess = guess.upper()
    
    # Validate based on mode
    mode = game.get('mode', 'words')
    if mode == 'words':
        if len(guess) != 1 or not guess.isalpha():
            return jsonify({'error': 'Enter a single letter (A-Z) or 8-bit binary'}), 400
    elif mode == 'numbers':
        if len(guess) != 1 or not guess.isdigit():
            return jsonify({'error': 'Enter a single digit (0-9) or 8-bit binary'}), 400
    elif mode == 'special':
        if len(guess) != 1 or guess.isalnum():
            return jsonify({'error': 'Enter a special character or 8-bit binary'}), 400
    
    # Already guessed?
    if guess in game['guessed']:
        return jsonify({
            'status': 'already_guessed',
            'guess': guess,
            'guess_binary': guess_binary,
            'message': f'{guess} already guessed'
        })
    
    game['guessed'].append(guess)
    
    word = game['word']
    
    # Check if guess is in word
    if guess in word:
        # Check win
        revealed = all(c in game['guessed'] or (c.isdigit() and c in game['guessed']) for c in word)
        if revealed:
            game['status'] = 'won'
            return jsonify({
                'status': 'won',
                'guess': guess,
                'guess_binary': guess_binary,
                'word': word,
                'word_binary': word_to_binary(word),
                'wrong': game['wrong'],
                'message': f'YOU WON! The answer was {word} ({word_to_binary(word)})'
            })
        
        # Show which positions
        positions = [i for i, c in enumerate(word) if c == guess]
        return jsonify({
            'status': 'correct',
            'guess': guess,
            'guess_binary': guess_binary,
            'positions': positions,
            'wrong': game['wrong'],
            'message': f'{guess} is in the word! Binary: {guess_binary if guess_binary else char_to_binary(guess)}'
        })
    else:
        game['wrong'] += 1
        
        if game['wrong'] >= game['max_wrong']:
            game['status'] = 'lost'
            return jsonify({
                'status': 'lost',
                'guess': guess,
                'guess_binary': guess_binary,
                'word': word,
                'word_binary': word_to_binary(word),
                'wrong': game['wrong'],
                'message': f'GAME OVER! The answer was {word} ({word_to_binary(word)})'
            })
        
        return jsonify({
            'status': 'wrong',
            'guess': guess,
            'guess_binary': guess_binary,
            'wrong': game['wrong'],
            'max_wrong': game['max_wrong'],
            'message': f'{guess} is NOT in the word! Binary: {guess_binary if guess_binary else char_to_binary(guess)}'
        })

@app.route('/api/game/<game_id>/state', methods=['GET'])
def get_state(game_id):
    """Get current game state"""
    if game_id not in games:
        return jsonify({'error': 'Game not found'}), 404
    
    game = games[game_id]
    word = game['word']
    guessed = game.get('guessed', [])
    
    # Build revealed word and positions
    revealed = []
    positions = []
    for i, c in enumerate(word):
        if c in guessed:
            revealed.append(c)
            positions.append(i)
        else:
            revealed.append('?')
    
    return jsonify({
        'game_id': game_id,
        'word': ''.join(revealed),
        'word_full': word,  # Full word for binary display
        'word_binary': word_to_binary(word),  # Binary for each letter
        'positions': positions,  # Which positions are revealed
        'guessed': guessed,
        'wrong': game['wrong'],
        'max_wrong': game['max_wrong'],
        'status': game['status'],
        'player': game['player'],
        'mode': game.get('mode', 'words')
    })

@app.route('/api/leaderboard', methods=['GET'])
def get_leaderboard():
    return jsonify([
        {'rank': 1, 'name': 'HACKER_01', 'word': 'PYTHON', 'wrong': 1, 'date': '2026-02-14'},
        {'rank': 2, 'name': 'GHOST_BREAKER', 'word': 'BINARY', 'wrong': 2, 'date': '2026-02-13'},
        {'rank': 3, 'name': 'DECRYPTOR', 'word': 'SYSTEM', 'wrong': 3, 'date': '2026-02-12'},
    ])

@app.route('/api/stats', methods=['GET'])
def get_stats():
    return jsonify({'total_games': 42, 'wins': 28, 'losses': 14, 'avg_wrong': 2.3})

games = {}

if __name__ == '__main__':
    print("🎮 Binary Hangman API Server")
    print("========================================")
    load_words()
    print("\nStarting server on http://localhost:5000\n")
    app.run(host='0.0.0.0', port=5000, debug=True)
