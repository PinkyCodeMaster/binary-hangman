import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, BarChart3, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";

interface Stats {
  total_games: number;
  wins: number;
  losses: number;
  avg_wrong: number;
}

export default function Stats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/stats")
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const winRate = stats && stats.total_games > 0 
    ? ((stats.wins / stats.total_games) * 100).toFixed(1) 
    : "0";

  return (
    <div className="min-h-screen p-4 relative" style={{ 
      backgroundImage: `linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))`,
      backgroundSize: '100% 2px, 3px 100%'
    }}>
      <div className="scanline" />
      
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="z-10">
          <Link href="/">
            
              <ArrowLeft className="w-4 h-4" />
              RETURN_TO_ROOT
            
          </Link>

          <div className="bg-card border border-primary/30 rounded-xl p-8">
            <div className="flex items-center gap-4 mb-8">
              <BarChart3 className="w-10 h-10 text-primary" />
              <h1 className="text-3xl font-bold text-primary glitch" data-text="SYSTEM_ANALYTICS">
                SYSTEM_ANALYTICS
              </h1>
            </div>

            {loading ? (
              <div className="text-center py-12 text-muted-foreground font-mono">
                Loading analytics...
              </div>
            ) : stats && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-primary">{stats.total_games}</div>
                    <div className="text-xs text-muted-foreground font-mono mt-1">TOTAL_SESSIONS</div>
                  </div>
                  
                  <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-primary flex items-center justify-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      {stats.wins}
                    </div>
                    <div className="text-xs text-muted-foreground font-mono mt-1">SUCCESSFUL</div>
                  </div>
                  
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-red-500 flex items-center justify-center gap-2">
                      <TrendingDown className="w-5 h-5" />
                      {stats.losses}
                    </div>
                    <div className="text-xs text-muted-foreground font-mono mt-1">FAILED</div>
                  </div>
                  
                  <div className="bg-secondary/10 border border-secondary/30 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-secondary">{winRate}%</div>
                    <div className="text-xs text-muted-foreground font-mono mt-1">EFFICIENCY</div>
                  </div>
                </div>

                <div className="border border-primary/20 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-primary mb-4 font-mono">
                    &lt;DETAILED_ANALYTICS&gt;
                  </h3>
                  
                  <div className="space-y-4 font-mono text-sm">
                    <div className="flex justify-between items-center py-2 border-b border-primary/10">
                      <span className="text-muted-foreground">AVG_ERRORS_PER_SESSION:</span>
                      <span className="text-foreground">{stats.avg_wrong}</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2 border-b border-primary/10">
                      <span className="text-muted-foreground">BEST_PERFORMANCE:</span>
                      <span className="text-primary">0 ERRORS</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2 border-b border-primary/10">
                      <span className="text-muted-foreground">WORST_PERFORMANCE:</span>
                      <span className="text-red-500">6 ERRORS</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2">
                      <span className="text-muted-foreground">MOST_COMMON_FAIL:</span>
                      <span className="text-yellow-400 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        BINARY_MISREAD
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
