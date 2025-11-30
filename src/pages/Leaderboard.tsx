import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Trophy, Coins, Medal } from "lucide-react";
import { motion } from "framer-motion";
import { formatAddress, formatCurrency } from "@/lib/utils";

// Mock leaderboard data - in production, fetch from The Graph or contract events
const mockLeaderboard = [
  { rank: 1, address: "0x1234567890123456789012345678901234567890", earned: 125.5, levels: 85 },
  { rank: 2, address: "0x2345678901234567890123456789012345678901", earned: 98.3, levels: 72 },
  { rank: 3, address: "0x3456789012345678901234567890123456789012", earned: 87.2, levels: 68 },
  { rank: 4, address: "0x4567890123456789012345678901234567890123", earned: 76.1, levels: 61 },
  { rank: 5, address: "0x5678901234567890123456789012345678901234", earned: 65.4, levels: 55 },
  { rank: 6, address: "0x6789012345678901234567890123456789012345", earned: 54.2, levels: 48 },
  { rank: 7, address: "0x7890123456789012345678901234567890123456", earned: 43.8, levels: 42 },
  { rank: 8, address: "0x8901234567890123456789012345678901234567", earned: 35.6, levels: 38 },
  { rank: 9, address: "0x9012345678901234567890123456789012345678", earned: 28.4, levels: 32 },
  { rank: 10, address: "0x0123456789012345678901234567890123456789", earned: 22.1, levels: 28 },
];

export function Leaderboard() {
  const navigate = useNavigate();

  const getMedalColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "text-yellow-500";
      case 2:
        return "text-gray-400";
      case 3:
        return "text-orange-600";
      default:
        return "text-gray-600";
    }
  };

  const getMedalIcon = (rank: number) => {
    if (rank <= 3) {
      return <Medal className={`w-6 h-6 ${getMedalColor(rank)}`} />;
    }
    return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-celo-gold/10 to-white pb-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="outline" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Home
          </Button>
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-celo-gold" />
            <h1 className="text-2xl font-bold">Leaderboard</h1>
          </div>
          <div className="w-24" />
        </div>

        {/* Prize Pool */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-r from-celo-green to-celo-gold text-white">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Weekly Prize Pool</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-5xl font-bold mb-2">500 cUSD</div>
                <div className="text-lg opacity-90">Distributed to Top 10 Players</div>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-6 text-center text-sm">
                <div>
                  <div className="text-2xl font-bold">200</div>
                  <div className="opacity-90">1st Place</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">150</div>
                  <div className="opacity-90">2nd Place</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">100</div>
                  <div className="opacity-90">3rd Place</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Leaderboard Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Top Players This Week</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {mockLeaderboard.map((player, index) => (
                  <motion.div
                    key={player.address}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${
                      player.rank <= 3 ? "bg-gradient-to-r from-yellow-50 to-transparent" : ""
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 flex items-center justify-center">
                        {getMedalIcon(player.rank)}
                      </div>
                      <div className="flex-1">
                        <div className="font-mono font-semibold">
                          {formatAddress(player.address)}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Trophy className="w-3 h-3" />
                            {player.levels} levels
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-celo-green flex items-center gap-1">
                        <Coins className="w-4 h-4" />
                        {player.earned} cUSD
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center text-gray-500"
        >
          <p className="mb-2">Leaderboard updates in real-time</p>
          <p className="text-sm">
            Prize distribution happens every Sunday at 23:59 UTC
          </p>
        </motion.div>
      </div>
    </div>
  );
}
