import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Play, Trophy, Coins, Users, Sparkles, Calendar } from "lucide-react";
import { useSortToEarn } from "@/hooks/useContract";
import { formatCurrency } from "@/lib/utils";
import { useAccount } from "wagmi";

export function Home() {
  const navigate = useNavigate();
  const { playerStats, cusdBalance } = useSortToEarn();
  const { isConnected, address } = useAccount();

  const stats = {
    totalEarned: playerStats?.[0] || 0n,
    levelsCompleted: playerStats?.[1] || 0n,
    balance: cusdBalance || 0n,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-celo-green/10 to-white pb-20">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-celo-green to-celo-gold py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto text-center text-white"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            SortToEarn
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Play Ball Sort Puzzle • Earn Real cUSD • Compete Globally
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate("/play")}
              className="bg-white text-celo-green hover:bg-gray-100 text-lg px-8"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Playing
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/daily")}
              className="border-white text-white hover:bg-white/20 text-lg px-8"
            >
              <Calendar className="w-5 h-5 mr-2" />
              Daily Challenge
            </Button>
          </div>
        </motion.div>

        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-16 h-16 rounded-full bg-white/10"
              initial={{ x: Math.random() * window.innerWidth, y: -50 }}
              animate={{
                y: window.innerHeight + 50,
                x: Math.random() * window.innerWidth,
              }}
              transition={{
                duration: 10 + Math.random() * 10,
                repeat: Infinity,
                delay: Math.random() * 5,
              }}
            />
          ))}
        </div>
      </div>

      {/* Stats Section */}
      {isConnected && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-4xl mx-auto px-4 -mt-10"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-white shadow-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-gray-500">Total Earned</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Coins className="w-6 h-6 text-celo-gold" />
                  <span className="text-3xl font-bold text-celo-green">
                    {formatCurrency(stats.totalEarned)} cUSD
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-gray-500">Levels Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-celo-gold" />
                  <span className="text-3xl font-bold">
                    {Number(stats.levelsCompleted)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-gray-500">cUSD Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Coins className="w-6 h-6 text-celo-green" />
                  <span className="text-3xl font-bold">
                    {formatCurrency(stats.balance)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}

      {/* Features */}
      <div className="max-w-6xl mx-auto px-4 mt-16">
        <h2 className="text-3xl font-bold text-center mb-8">Why Play SortToEarn?</h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <Coins className="w-12 h-12 text-celo-gold mb-2" />
              <CardTitle>Earn Real Money</CardTitle>
              <CardDescription>
                Solve puzzles and earn cUSD instantly. Better performance = higher rewards!
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Sparkles className="w-12 h-12 text-celo-green mb-2" />
              <CardTitle>200+ Levels</CardTitle>
              <CardDescription>
                Progressive difficulty from beginner to expert. Always a new challenge!
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Calendar className="w-12 h-12 text-blue-500 mb-2" />
              <CardTitle>Daily Challenges</CardTitle>
              <CardDescription>
                Compete with players worldwide on the same puzzle. Top performers win big!
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Trophy className="w-12 h-12 text-celo-gold mb-2" />
              <CardTitle>Leaderboard</CardTitle>
              <CardDescription>
                Climb the ranks and show off your skills. Weekly prizes for top players!
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Users className="w-12 h-12 text-purple-500 mb-2" />
              <CardTitle>Create & Share</CardTitle>
              <CardDescription>
                Design your own levels and earn royalties when others play them!
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Play className="w-12 h-12 text-celo-green mb-2" />
              <CardTitle>Gasless Gaming</CardTitle>
              <CardDescription>
                First 20 levels are completely free. No gas fees, just fun!
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-4xl mx-auto px-4 mt-16 text-center">
        <Card className="bg-gradient-to-r from-celo-green to-celo-gold text-white">
          <CardHeader>
            <CardTitle className="text-3xl">Ready to Start Earning?</CardTitle>
            <CardDescription className="text-white/90 text-lg">
              Connect your Valora or MiniPay wallet and start solving puzzles now!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              size="lg"
              onClick={() => navigate("/play")}
              className="bg-white text-celo-green hover:bg-gray-100 text-xl px-12 py-6"
            >
              <Play className="w-6 h-6 mr-2" />
              Play Now
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
