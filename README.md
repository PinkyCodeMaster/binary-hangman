# 🎮 Binary Hangman

A twist on classic hangman — decode binary ASCII to save the ghost!

## How to Play

1. **Run the game:**
   ```bash
   python3 binary_hangman.py
   ```

2. **Enter your name** when prompted

3. **Guess letters** to reveal the hidden word:
   - Type a letter (e.g., `A`)
   - OR type 7-bit binary (e.g., `1000001` for A) 🔥

4. **Save the ghost** before too many wrong guesses!

## Binary Cheat Sheet

| Letter | Binary | Letter | Binary |
|--------|--------|--------|--------|
| A      | 1000001| N      | 1001110|
| B      | 1000010| O      | 1001111|
| C      | 1000011| P      | 1010000|
| D      | 1000100| Q      | 1010001|
| E      | 1000101| R      | 1010010|
| F      | 1000110| S      | 1010011|
| G      | 1000111| T      | 1010100|
| H      | 1001000| U      | 1010101|
| I      | 1001001| V      | 1010110|
| J      | 1001010| W      | 1010111|
| K      | 1001011| X      | 1011000|
| L      | 1001100| Y      | 1011001|
| M      | 1001101| Z      | 1011010|

## Features

- 🎨 Colourful terminal UI
- 🏆 SQLite leaderboard (persists in `~/.binary_hangman_scores.db`)
- 📊 Win/loss stats tracking
- 👻 ASCII ghost that gets "destroyed" as you lose

## Menu

```
1. Play Game    - Start a new game
2. Leaderboard  - View top 10 scores
3. Stats        - See overall statistics
4. Quit         - Exit
```

## Requirements

- Python 3.6+
- No external dependencies (uses built-in `sqlite3`)

## License

MIT
