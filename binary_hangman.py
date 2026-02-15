#!/usr/bin/env python3
"""Binary Hangman - With Scoreboard & Enhanced UI"""

import random
import sqlite3
import os
from datetime import datetime

DB_PATH = os.path.expanduser("~/.binary_hangman_scores.db")

# Word list
WORDS = ["ALICE", "GHOST", "BINARY", "PYTHON", "ROBOT", "CODING", "DIGITAL", "SYSTEM", "MEMORY", "NETWORK", "HACKER", "SCRIPT", "SERVER", "KERNEL", "BUFFER", "SOCKET", "PACKET", "DOMAIN", "CLIENT", "CLOUD"]

# Colours (ANSI)
class Col:
    RED = '\033[91m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    MAGENTA = '\033[95m'
    CYAN = '\033[96m'
    BOLD = '\033[1m'
    END = '\033[0m'

def init_db():
    """Create the scores table if it doesn't exist"""
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS scores
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  name TEXT,
                  word TEXT,
                  wrong INT,
                  max_wrong INT,
                  won BOOLEAN,
                  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)''')
    conn.commit()
    conn.close()

def save_score(name, word, wrong, max_wrong, won):
    """Save a game to the database"""
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("INSERT INTO scores (name, word, wrong, max_wrong, won) VALUES (?, ?, ?, ?, ?)",
              (name, word, wrong, max_wrong, won))
    conn.commit()
    conn.close()

def get_top_scores(limit=10):
    """Get top scores (fewest wrong guesses = best)"""
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''SELECT name, word, wrong, max_wrong, timestamp, won
                 FROM scores WHERE won=1 ORDER BY wrong ASC LIMIT ?''', (limit,))
    results = c.fetchall()
    conn.close()
    return results

def get_stats():
    """Get overall stats"""
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT COUNT(*) FROM scores WHERE won=1")
    games_won = c.fetchone()[0]
    c.execute("SELECT COUNT(*) FROM scores WHERE won=0")
    games_lost = c.fetchone()[0]
    c.execute("SELECT AVG(wrong) FROM scores WHERE won=1")
    avg_wrong = c.fetchone()[0] or 0
    conn.close()
    return games_won, games_lost, avg_wrong

# Binary helpers
def char_to_bin(char):
    return bin(ord(char))[2:].zfill(7)

def word_to_bin(word):
    return " ".join(char_to_bin(c) for c in word)

# UI Functions
def clear():
    os.system('clear' if os.name == 'posix' else 'cls')

def draw_hangman(stage):
    stages = [
        f"""
 {Col.GREEN}╔═══════╗{Col.END}
 {Col.GREEN}║       ║{Col.END}
 {Col.GREEN}║     👻 {Col.END}
 {Col.GREEN}║    /|)\\{Col.END}
 {Col.GREEN}║    / \\ {Col.END}
 {Col.GREEN}╚═══════╝{Col.END}
        """,
        f"""
 {Col.YELLOW}╔═══════╗{Col.END}
 {Col.YELLOW}║       ║{Col.END}
 {Col.YELLOW}║     👻 {Col.END}
 {Col.YELLOW}║    /|)\\{Col.END}
 {Col.YELLOW}║    /   {Col.END}
 {Col.YELLOW}╚═══════╝{Col.END}
        """,
        f"""
 {Col.YELLOW}╔═══════╗{Col.END}
 {Col.YELLOW}║       ║{Col.END}
 {Col.YELLOW}║     👻 {Col.END}
 {Col.YELLOW}║    /|)\\{Col.END}
 {Col.YELLOW}║       {Col.END}
 {Col.YELLOW}╚═══════╝{Col.END}
        """,
        f"""
 {Col.YELLOW}╔═══════╗{Col.END}
 {Col.YELLOW}║       ║{Col.END}
 {Col.YELLOW}║     👻 {Col.END}
 {Col.YELLOW}║    /|  {Col.END}
 {Col.YELLOW}║       {Col.END}
 {Col.YELLOW}╚═══════╝{Col.END}
        """,
        f"""
 {Col.YELLOW}╔═══════╗{Col.END}
 {Col.YELLOW}║       ║{Col.END}
 {Col.YELLOW}║     👻 {Col.END}
 {Col.YELLOW}║     |  {Col.END}
 {Col.YELLOW}║       {Col.END}
 {Col.YELLOW}╚═══════╝{Col.END}
        """,
        f"""
 {Col.RED}╔═══════╗{Col.END}
 {Col.RED}║       ║{Col.END}
 {Col.RED}║     👻 {Col.END}
 {Col.RED}║       {Col.END}
 {Col.RED}║       {Col.END}
 {Col.RED}╚═══════╝{Col.END}
        """,
        f"""
 {Col.RED}╔═══════╗{Col.END}
 {Col.RED}║       ║{Col.END}
 {Col.RED}║       {Col.END}
 {Col.RED}║       {Col.END}
 {Col.RED}║       {Col.END}
 {Col.RED}╚═══════╝{Col.END}
        """,
    ]
    return stages[stage]

def show_letters(guessed, target):
    result = []
    for c in target:
        if c in guessed:
            result.append(f"{Col.GREEN}{c}{Col.END}")
        else:
            result.append(f"{Col.RED}?{Col.END}")
    return " ".join(result)

def show_binary(guessed, target):
    result = []
    for c in target:
        if c in guessed:
            result.append(f"{Col.CYAN}{char_to_bin(c)}{Col.END}")
        else:
            result.append(f"{Col.RED}{'?'*7}{Col.END}")
    return " ".join(result)

def print_header():
    clear()
    print(f"{Col.MAGENTA}{Col.BOLD}")
    print("╔═══════════════════════════════════════╗")
    print("║       🎮 BINARY HANGMAN 🎮              ║")
    print("║   Decode binary to save the ghost!     ║")
    print("╚═══════════════════════════════════════╝")
    print(f"{Col.END}")

def print_menu():
    print_header()
    print(f"  {Col.CYAN}1.{Col.END} 🎮  Play Game")
    print(f"  {Col.CYAN}2.{Col.END} 🏆  Leaderboard")
    print(f"  {Col.CYAN}3.{Col.END} 📊  Stats")
    print(f"  {Col.CYAN}4.{Col.END} ❌  Quit")
    print()

def print_leaderboard():
    print_header()
    print(f"{Col.BOLD}🏆 TOP SCORES{Col.END}\n")
    scores = get_top_scores()
    if scores:
        print(f"{Col.BOLD}{'#':<3} {'Name':<10} {'Word':<8} {'Wrong':<6} {'Date':<12}{Col.END}")
        print("-" * 45)
        for i, (name, word, wrong, _, timestamp, _) in enumerate(scores, 1):
            date = timestamp[:10]
            print(f"{i:<3} {name:<10} {word:<8} {wrong}/6      {date}")
    else:
        print(f"{Col.YELLOW}No scores yet! Be the first!{Col.END}")
    print()

def print_stats():
    print_header()
    print(f"{Col.BOLD}📊 OVERALL STATS{Col.END}\n")
    won, lost, avg = get_stats()
    total = won + lost
    print(f"  Games Won:    {Col.GREEN}{won}{Col.END}")
    print(f"  Games Lost:   {Col.RED}{lost}{Col.END}")
    print(f"  Total Games:  {total}")
    print(f"  Win Rate:     {Col.CYAN}{(won/total*100) if total > 0 else 0:.1f}%{Col.END}")
    print(f"  Avg Wrong:    {avg:.1f}")
    print()

def get_player_name():
    print_header()
    name = input(f"  {Col.CYAN}Enter your name:{Col.END} ").strip()[:10]
    return name or "Player"

def play_game(name):
    word = random.choice(WORDS).upper()
    guessed = set()
    wrong = 0
    max_wrong = 6
    
    print_header()
    print(f"  {Col.BOLD}Decoding the binary to save the ghost!{Col.END}")
    print(f"  Word: {show_binary(guessed, word)}\n")
    
    while wrong < max_wrong:
        print(draw_hangman(wrong))
        print(f"\n  Word:  {show_letters(guessed, word)}")
        print(f"  Binary: {show_binary(guessed, word)}")
        print(f"  {Col.YELLOW}Guessed:{Col.END} {', '.join(sorted(guessed)) if guessed else 'None'}")
        print(f"  Wrong: {wrong}/{max_wrong}")
        
        if all(c in guessed for c in word):
            print(f"\n{Col.GREEN}{'🎉'*20}")
            print(f"  YOU SAVED HIM! The word was: {Col.BOLD}{word}{Col.END}")
            print(f"  Binary: {word_to_bin(word)}")
            print(f"  Wrong guesses: {wrong}")
            print(f"{'🎉'*20}{Col.END}\n")
            save_score(name, word, wrong, max_wrong, True)
            input(f"  {Col.CYAN}Press Enter to continue...{Col.END}")
            return
    
    # Lost - save the game too
    save_score(name, word, wrong, max_wrong, False)
        
        guess = input(f"\n  {Col.CYAN}Letter (or binary):{Col.END} ").strip().upper()
        
        if not guess:
            continue
        
        # Handle binary input
        if set(guess) <= {'0', '1'}:
            if len(guess) == 7:
                try:
                    letter = chr(int(guess, 2))
                    if letter.isalpha():
                        guess = letter.upper()
                    else:
                        print(f"  {Col.RED}❌ Not a letter!{Col.END}")
                        continue
                except:
                    print(f"  {Col.RED}❌ Invalid binary!{Col.END}")
                    continue
            else:
                print(f"  {Col.RED}❌ Enter 7-bit binary (e.g., 1000001 for A){Col.END}")
                continue
        
        if len(guess) == 1 and guess.isalpha():
            if guess in guessed:
                print(f"  {Col.YELLOW}⚠ Already guessed {guess}!{Col.END}")
                continue
            guessed.add(guess)
            if guess not in word:
                wrong += 1
                print(f"  {Col.RED}❌ {guess} is not in the word!{Col.END}")
        else:
            print(f"  {Col.RED}❌ Enter a single letter OR 7-bit binary!{Col.END}")
    
    print(draw_hangman(max_wrong))
    print(f"\n{Col.RED}{'💀'*20}")
    print(f"  GAME OVER! The word was: {Col.BOLD}{word}{Col.END}")
    print(f"  Binary: {word_to_bin(word)}")
    print(f"{'💀'*20}{Col.END}\n")
    save_score(name, word, wrong, max_wrong, False)
    input(f"  {Col.CYAN}Press Enter to continue...{Col.END}")

def main():
    init_db()
    
    while True:
        print_menu()
        choice = input(f"  {Col.CYAN}Choose:{Col.END} ").strip()
        
        if choice == "1":
            name = get_player_name()
            play_game(name)
        elif choice == "2":
            print_leaderboard()
            input(f"  {Col.CYAN}Press Enter to continue...{Col.END}")
        elif choice == "3":
            print_stats()
            input(f"  {Col.CYAN}Press Enter to continue...{Col.END}")
        elif choice == "4" or choice.lower() in ["q", "quit", "exit"]:
            print(f"\n  {Col.MAGENTA}Thanks for playing! 👻{Col.END}\n")
            break
        else:
            print(f"  {Col.RED}Invalid choice!{Col.END}")

if __name__ == "__main__":
    main()
