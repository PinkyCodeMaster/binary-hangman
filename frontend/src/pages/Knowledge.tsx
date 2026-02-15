import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Search } from "lucide-react";

interface KnowledgeData {
  letters: { char: string; binary: string; decimal: number }[];
  numbers: { char: string; binary: string; decimal: number }[];
  special: { char: string; binary: string; decimal: number }[];
}

export default function Knowledge() {
  const [data, setData] = useState<KnowledgeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"letters" | "numbers" | "special">("letters");

  useEffect(() => {
    fetch("http://localhost:5000/api/knowledge")
      .then(res => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const currentData = data?.[activeTab] || [];
  
  const filtered = search 
    ? currentData.filter(item => 
        item.char.toLowerCase().includes(search.toLowerCase()) ||
        item.binary.includes(search) ||
        item.decimal.toString().includes(search)
      )
    : currentData;

  return (
    <div className="min-h-screen p-4 relative" style={{ 
      backgroundImage: `linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))`,
      backgroundSize: '100% 2px, 3px 100%'
    }}>
      <div className="scanline" />
      
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="z-10">
          <Link href="/">
            
              <ArrowLeft className="w-4 h-4" />
              RETURN_TO_ROOT
            
          </Link>

          <div className="bg-card border border-primary/30 rounded-xl p-8">
            <div className="flex items-center gap-4 mb-8">
              <BookOpen className="w-10 h-10 text-primary" />
              <h1 className="text-3xl font-bold text-primary glitch" data-text="KNOWLEDGE_BASE">
                KNOWLEDGE_BASE
              </h1>
            </div>

            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by char, binary, or decimal..."
                  className="w-full bg-background border border-primary/50 rounded-lg pl-10 pr-4 py-3 text-primary font-mono placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              {(["letters", "numbers", "special"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg font-mono text-sm uppercase transition-all ${
                    activeTab === tab
                      ? "bg-primary/20 border border-primary text-primary"
                      : "border border-primary/30 text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  {tab === "letters" && "A-Z Letters (8-bit)"}
                  {tab === "numbers" && "00-99 Numbers (8-bit)"}
                  {tab === "special" && "Special Chars (8-bit)"}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="text-center py-12 text-muted-foreground font-mono">
                Loading knowledge base...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full font-mono text-sm">
                  <thead>
                    <tr className="border-b border-primary/30">
                      <th className="text-left py-3 px-4 text-primary">CHAR</th>
                      <th className="text-left py-3 px-4 text-secondary">BINARY</th>
                      <th className="text-left py-3 px-4 text-muted-foreground">DECIMAL</th>
                      <th className="text-left py-3 px-4 text-muted-foreground">7-BIT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((item, idx) => (
                      <tr 
                        key={idx} 
                        className="border-b border-primary/10 hover:bg-primary/5 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <span className="text-2xl font-bold text-primary">{item.char}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-secondary font-bold tracking-wider">{item.binary}</span>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">{item.decimal}</td>
                        <td className="py-3 px-4">
                          <span className="text-xs text-muted-foreground/50">
                            {item.binary.padStart(8, '0')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {filtered.length === 0 && !loading && (
              <div className="text-center py-12 text-muted-foreground font-mono">
                No results found.
              </div>
            )}

            <div className="mt-8 text-xs text-muted-foreground font-mono opacity-50">
              // Use this data to decode binary strings and guess characters in the game
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
