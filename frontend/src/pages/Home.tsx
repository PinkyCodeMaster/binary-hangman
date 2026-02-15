import { Link } from "wouter";
import { CyberButton } from "@/components/CyberButton";
import { motion } from "framer-motion";
import { Terminal, Trophy, BarChart3, BookOpen } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="scanline" />
      
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="z-10 text-center space-y-8 max-w-4xl w-full"
      >
        <div className="space-y-2">
          {/* Ghost Logo */}
          <div className="text-8xl">👻</div>
          <h1 
            className="text-4xl md:text-7xl font-bold text-primary glitch tracking-tighter"
            data-text="BINARY_HANGMAN"
          >
            BINARY_HANGMAN
          </h1>
          <p className="text-secondary font-mono text-sm md:text-xl tracking-[0.2em] neon-text-secondary">
            SYSTEM.INIT(GAME_PROTOCOL)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full mt-12">
          
          <motion.div whileHover={{ scale: 1.05 }} className="w-full">
            <Link href="/game" className="block w-full h-full">
              <div className="bg-card border border-primary/20 p-6 rounded-xl h-full flex flex-col items-center justify-center gap-3 hover:border-primary/80 hover:shadow-[0_0_30px_rgba(34,197,94,0.2)] transition-all group cursor-pointer neon-border">
                <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Terminal className="w-10 h-10 text-primary group-hover:animate-pulse" />
                </div>
                <h2 className="text-xl font-bold text-foreground neon-text">START_GAME</h2>
                <p className="text-muted-foreground text-center text-xs">
                  Initialize. Decrypt binary. Save system.
                </p>
                <CyberButton className="mt-2 w-full text-xs py-2">EXECUTE</CyberButton>
              </div>
            </Link>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="w-full">
            <Link href="/knowledge" className="block w-full h-full">
              <div className="bg-card border border-secondary/20 p-6 rounded-xl h-full flex flex-col items-center justify-center gap-3 hover:border-secondary/80 hover:shadow-[0_0_30px_rgba(6,182,212,0.2)] transition-all group cursor-pointer">
                <div className="p-3 rounded-full bg-secondary/10 group-hover:bg-secondary/20 transition-colors">
                  <BookOpen className="w-10 h-10 text-secondary" />
                </div>
                <h2 className="text-xl font-bold text-secondary neon-text-secondary">KNOWLEDGE</h2>
                <p className="text-muted-foreground text-center text-xs">
                  Binary cheat sheet. All answers.
                </p>
                <CyberButton variant="secondary" className="mt-2 w-full text-xs py-2">ACCESS_DB</CyberButton>
              </div>
            </Link>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="w-full">
            <Link href="/leaderboard" className="block w-full h-full">
              <div className="bg-card border border-primary/20 p-6 rounded-xl h-full flex flex-col items-center justify-center gap-3 hover:border-primary/80 hover:shadow-[0_0_30px_rgba(34,197,94,0.2)] transition-all group cursor-pointer neon-border">
                <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Trophy className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-foreground neon-text">LEADERBOARD</h2>
                <p className="text-muted-foreground text-center text-xs">
                  Top scores. Elite hackers.
                </p>
                <CyberButton variant="outline" className="mt-2 w-full text-xs py-2">VIEW</CyberButton>
              </div>
            </Link>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="w-full">
            <Link href="/stats" className="block w-full h-full">
              <div className="bg-card border border-primary/20 p-6 rounded-xl h-full flex flex-col items-center justify-center gap-3 hover:border-primary/80 hover:shadow-[0_0_30px_rgba(34,197,94,0.2)] transition-all group cursor-pointer neon-border">
                <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <BarChart3 className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-foreground neon-text">STATS</h2>
                <p className="text-muted-foreground text-center text-xs">
                  Analytics. Win rates.
                </p>
                <CyberButton variant="outline" className="mt-2 w-full text-xs py-2">ANALYZE</CyberButton>
              </div>
            </Link>
          </motion.div>

        </div>

        <div className="absolute bottom-4 left-0 right-0 text-center opacity-30 text-[10px] font-mono">
          v1.0.4 | SECURE CONNECTION ESTABLISHED | PORT 8080
        </div>
      </motion.div>
    </div>
  );
}
