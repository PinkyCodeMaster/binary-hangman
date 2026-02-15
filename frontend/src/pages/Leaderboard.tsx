import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Trophy } from "lucide-react";

interface Score {
  rank: number;
  name: string;
  word: string;
  wrong: number;
  date: string;
}

export default function Leaderboard() {
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/leaderboard")
      .then(res => res.json())
      .then(data => setScores(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen p-4 relative" style={{ 
      backgroundImage: `linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))`,
      backgroundSize: '100% 2px, 3px 100%'
    }}>
      <div className="scanline" />
      
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="z-10">
                    <Link href="/" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-mono mb-8">
            
              <ArrowLeft className="w-4 h-4" />
              RETURN_TO_ROOT
            
          </Link>

          <div className="bg-card border border-secondary/30 rounded-xl p-8">
            <div className="flex items-center gap-4 mb-8">
              <Trophy className="w-10 h-10 text-secondary" />
              <h1 className="text-3xl font-bold text-secondary glitch" data-text="LEADERBOARD_DB">
                LEADERBOARD_DB
              </h1>
            </div>

            {loading ? (
              <div className="text-center py-12 text-muted-foreground font-mono">
                Loading database...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full font-mono text-sm">
                  <thead>
                    <tr className="border-b border-secondary/30">
                      <th className="text-left py-3 px-4 text-secondary">RANK</th>
                      <th className="text-left py-3 px-4 text-secondary">OPERATOR</th>
                      <th className="text-left py-3 px-4 text-secondary">TARGET_WORD</th>
                      <th className="text-left py-3 px-4 text-secondary">ERRORS</th>
                      <th className="text-left py-3 px-4 text-secondary">TIMESTAMP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scores.map((score) => (
                      <tr 
                        key={score.rank} 
                        className="border-b border-primary/10 hover:bg-primary/5 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <span className={
                            score.rank === 1 ? "text-yellow-400" :
                            score.rank === 2 ? "text-gray-400" :
                            score.rank === 3 ? "text-amber-600" : "text-muted-foreground"
                          }>
                            #{score.rank}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-primary">{score.name}</td>
                        <td className="py-3 px-4 text-foreground">{score.word}</td>
                        <td className="py-3 px-4">
                          <span className={score.wrong <= 2 ? "text-primary" : score.wrong <= 4 ? "text-yellow-400" : "text-red-500"}>
                            {score.wrong}/6
                          </span>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">{score.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {scores.length === 0 && !loading && (
              <div className="text-center py-12 text-muted-foreground font-mono">
                No data in database. Be the first to hack in!
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
