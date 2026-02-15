import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, RefreshCw } from "lucide-react";

interface GameState {
  game_id: string;
  word: string;
  word_full: string;
  word_binary: string;
  positions: number[];
  guessed: string[];
  wrong: number;
  max_wrong: number;
  status: string;
  player: string;
  mode: string;
}

// Convert char to binary
function charToBinary(char: string): string {
  return char.charCodeAt(0).toString(2).padStart(8, '0');
}

export default function Game() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [guess, setGuess] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [playerName, setPlayerName] = useState("Player");
  const [selectedMode, setSelectedMode] = useState("words");
  const [showModeSelect, setShowModeSelect] = useState(true);
  const [lastGuessBinary, setLastGuessBinary] = useState("");

  const startNewGame = async () => {
    if (!playerName.trim()) {
      setMessage("Please enter your name!");
      return;
    }
    setLoading(true);
    setMessage("");
    setLastGuessBinary("");
    
    try {
      const res = await fetch("http://localhost:5000/api/game/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: playerName, mode: selectedMode }),
      });
      
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      setGameState(data);
      setMessage("");
      setShowModeSelect(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setMessage(`Error: ${errorMessage}`);
    }
    setLoading(false);
  };

  const makeGuess = async () => {
    if (!guess.trim() || !gameState) return;
    
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/game/${gameState.game_id}/guess`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guess }),
      });
      const data = await res.json();
      
      // Check for validation errors
      if (data.error) {
        setMessage(`Error: ${data.error}`);
        setLoading(false);
        return;
      }
      
      // Get updated state
      const stateRes = await fetch(`http://localhost:5000/api/game/${gameState.game_id}/state`);
      const newState = await stateRes.json();
      setGameState(newState);
      
      // Show binary that was guessed
      if (data.guess_binary) {
        setLastGuessBinary(data.guess_binary);
      } else if (guess.length === 8 && /^[01]+$/.test(guess)) {
        setLastGuessBinary(guess);
      } else {
        setLastGuessBinary(charToBinary(guess.toUpperCase()));
      }
      
      setMessage(data.message || "");
      
      if (data.status === "won" || data.status === "lost") {
        setShowModeSelect(true);
      }
    } catch (err) {
      setMessage("Error making guess");
    }
    setGuess("");
    setLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) {
      if (!gameState || gameState.status !== "playing") {
        startNewGame();
      } else {
        makeGuess();
      }
    }
  };

  // Render word with letters and binary
  const renderWordDisplay = () => {
    if (!gameState) return null;
    
    const wordFull = gameState.word_full || gameState.word;
    const positions = gameState.positions || [];
    // word_binary is space-separated: "01000001 01000010 ..."
    const binaryArray = (gameState.word_binary || "").split(" ");
    
    return (
      <div className="flex flex-wrap justify-center gap-3 md:gap-4">
        {wordFull.split('').map((char, idx) => {
          const isRevealed = positions.includes(idx);
          const binary = binaryArray[idx] || "????????";
          
          return (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center"
            >
              {/* The Letter - appears when guessed */}
              <div className={`
                w-10 h-14 md:w-14 md:h-20 flex items-center justify-center 
                border-b-4 text-2xl md:text-4xl font-bold font-mono
                ${isRevealed 
                  ? 'border-green-500 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.3)]' 
                  : 'border-gray-600 text-transparent'}
              `}>
                {char}
              </div>
              
              {/* Binary - always visible for learning! */}
              <div className={`
                text-[8px] md:text-xs font-mono tracking-widest mt-1
                ${isRevealed ? 'text-green-400' : 'text-cyan-400/70'}
              `}>
                {binary}
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  };

  // Render hangman SVG
  const renderHangman = (wrong: number) => {
    const showHead = wrong >= 1;
    const showBody = wrong >= 2;
    const showLeftArm = wrong >= 3;
    const showRightArm = wrong >= 4;
    const showLeftLeg = wrong >= 5;
    const showRightLeg = wrong >= 6;
    
    return (
      <svg viewBox="0 0 200 220" className="w-40 h-44">
        {/* Base */}
        <line x1="20" y1="210" x2="100" y2="210" stroke="#22c55e" strokeWidth="4" />
        {/* Pole */}
        <line x1="60" y1="210" x2="60" y2="20" stroke="#22c55e" strokeWidth="4" />
        {/* Top bar */}
        <line x1="60" y1="20" x2="150" y2="20" stroke="#22c55e" strokeWidth="4" />
        {/* Rope */}
        <line x1="150" y1="20" x2="150" y2="50" stroke="#22c55e" strokeWidth="3" />
        
        {/* Head */}
        {showHead && (
          <circle cx="150" cy="70" r="20" stroke="#ef4444" strokeWidth="4" fill="none" />
        )}
        {/* Body */}
        {showBody && (
          <line x1="150" y1="90" x2="150" y2="140" stroke="#ef4444" strokeWidth="4" />
        )}
        {/* Left Arm */}
        {showLeftArm && (
          <line x1="150" y1="100" x2="120" y2="130" stroke="#ef4444" strokeWidth="4" />
        )}
        {/* Right Arm */}
        {showRightArm && (
          <line x1="150" y1="100" x2="180" y2="130" stroke="#ef4444" strokeWidth="4" />
        )}
        {/* Left Leg */}
        {showLeftLeg && (
          <line x1="150" y1="140" x2="125" y2="180" stroke="#ef4444" strokeWidth="4" />
        )}
        {/* Right Leg */}
        {showRightLeg && (
          <line x1="150" y1="140" x2="175" y2="180" stroke="#ef4444" strokeWidth="4" />
        )}
        
        {/* Game over text */}
        {wrong >= 6 && (
          <text x="100" y="30" textAnchor="middle" fill="#ef4444" fontSize="14" fontWeight="bold" className="font-mono">
            GAME OVER
          </text>
        )}
      </svg>
    );
  };

  return (
    <div className="min-h-screen p-4" style={{ 
      backgroundColor: "#0a0a0a",
      backgroundImage: `linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.03), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.03))`,
      backgroundSize: '100% 2px, 3px 100%'
    }}>
      <div className="scanline" />
      
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-green-500 hover:text-green-400 font-mono mb-6 block">
          <ArrowLeft className="w-4 h-4" />
          RETURN_TO_ROOT
        </Link>

        <div className="bg-gray-900/80 border border-green-500/30 rounded-xl p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-green-500 font-mono">
              BINARY_HANGMAN
            </h1>
            <div className="text-sm font-mono text-red-500">
              ERRORS: {gameState?.wrong || 0}/{gameState?.max_wrong || 6}
            </div>
          </div>

          {/* Mode selection */}
          {(!gameState || showModeSelect) && (
            <div className="mb-6 space-y-4">
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value.slice(0, 10))}
                onKeyDown={handleKeyPress}
                placeholder="Enter your name..."
                className="w-full bg-gray-800 border border-green-500/50 rounded-lg px-4 py-3 text-green-500 font-mono placeholder:text-gray-600 focus:outline-none focus:border-green-500"
              />
              
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'words', name: 'WORDS', desc: 'Words' },
                  { id: 'numbers', name: 'NUMBERS', desc: '00-99' },
                  { id: 'special', name: 'SPECIAL', desc: '!@#$' },
                  { id: 'random', name: 'RANDOM', desc: 'Mix' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setSelectedMode(mode.id)}
                    className={`p-3 rounded-lg border text-center transition-all ${
                      selectedMode === mode.id
                        ? "border-green-500 bg-green-500/20 text-green-500"
                        : "border-green-500/30 text-gray-400 hover:border-green-500/50"
                    }`}
                  >
                    <div className="font-mono font-bold text-sm">{mode.name}</div>
                    <div className="text-xs opacity-70">{mode.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Game Area */}
          {gameState && (
            <div className="space-y-8">
              {/* Hangman + Word side by side */}
              <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                {/* Hangman */}
                {renderHangman(gameState.wrong)}
                
                {/* Word Display */}
                {renderWordDisplay()}
              </div>

              {/* Guessed letters */}
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="text-sm text-gray-400 font-mono mb-2">GUESSED:</div>
                <div className="flex flex-wrap gap-2">
                  {(gameState.guessed || []).map((g: string) => (
                    <span key={g} className="w-8 h-8 flex items-center justify-center border border-green-500/50 bg-green-500/10 text-green-400 font-mono font-bold rounded">
                      {g}
                    </span>
                  ))}
                  {(!gameState.guessed || gameState.guessed.length === 0) && (
                    <span className="text-gray-600 font-mono text-sm">None yet</span>
                  )}
                </div>
              </div>

              {/* Last guess binary */}
              {lastGuessBinary && (
                <div className="bg-cyan-900/30 border border-cyan-500/50 rounded-lg p-4">
                  <div className="text-sm text-cyan-400 font-mono mb-1">LAST GUESS:</div>
                  <div className="text-2xl font-mono text-cyan-300 tracking-wider">
                    {lastGuessBinary}
                  </div>
                </div>
              )}

              {/* Input */}
              {gameState.status === "playing" && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={guess}
                    onChange={(e) => setGuess(e.target.value.toUpperCase().slice(0, 8))}
                    onKeyDown={handleKeyPress}
                    placeholder="A or 01000001"
                    className="flex-1 bg-gray-800 border border-green-500/50 rounded-lg px-4 py-3 text-green-500 font-mono placeholder:text-gray-600 focus:outline-none focus:border-green-500"
                  />
                  <button
                    onClick={makeGuess}
                    disabled={loading || !guess.trim()}
                    className="px-6 py-3 bg-green-500/20 border border-green-500 text-green-500 rounded-lg font-mono font-bold hover:bg-green-500/30 disabled:opacity-50"
                  >
                    GUESS
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Message */}
          {message && (
            <div className={`mt-6 p-4 rounded-lg font-mono text-sm ${
              message.includes("WON") ? "bg-green-500/20 border border-green-500 text-green-400" :
              message.includes("GAME OVER") ? "bg-red-500/20 border border-red-500 text-red-400" :
              message.includes("correct") ? "bg-cyan-500/20 border border-cyan-500 text-cyan-400" :
              message.includes("Error") ? "bg-red-500/20 border border-red-500 text-red-400" :
              "bg-green-500/10 border border-green-500/30 text-green-500"
            }`}>
              {message}
            </div>
          )}

          {/* Start button */}
          <div className="mt-6">
            <button
              onClick={gameState?.status === "playing" ? makeGuess : startNewGame}
              disabled={loading}
              className="w-full px-6 py-3 bg-green-500/20 border border-green-500 text-green-500 rounded-lg font-mono font-bold uppercase tracking-wider hover:bg-green-500/30 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              {gameState && gameState.status === "playing" ? "GUESS" : "START_GAME"}
            </button>
          </div>

          <div className="mt-4 text-xs text-gray-600 font-mono text-center">
            Enter a letter (A-Z) or 8-bit binary (e.g., 01000001 = A)
          </div>
        </div>
      </div>
    </div>
  );
}
