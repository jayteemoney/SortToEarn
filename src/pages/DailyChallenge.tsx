import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GameBoard } from "@/components/GameBoard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar, Trophy, Users } from "lucide-react";
import { getDailyChallengeLevel } from "@/lib/levels";
import { useSortToEarn } from "@/hooks/useContract";
import { formatCurrency } from "@/lib/utils";
import { motion } from "framer-motion";
import { useAccount } from "wagmi";
import toast from "react-hot-toast";

export function DailyChallenge() {
  const navigate = useNavigate();
  const { isConnected } = useAccount();
  const { currentDayId, claimDailyChallenge } = useSortToEarn();
  const [dailyLevel, setDailyLevel] = useState(getDailyChallengeLevel());
  const [hasClaimed, setHasClaimed] = useState(false);

  useEffect(() => {
    setDailyLevel(getDailyChallengeLevel());
  }, []);

  const handleComplete = async (moves: number) => {
    if (!isConnected) {
      toast.error("Connect wallet to claim daily challenge reward");
      return;
    }

    try {
      toast.loading("Claiming daily challenge reward...", { id: "daily" });
      await claimDailyChallenge(moves);
      setHasClaimed(true);
      toast.success("Daily challenge reward claimed!", { id: "daily" });
    } catch (error: any) {
      if (error.message.includes("Already claimed")) {
        toast.error("You already claimed today's challenge!", { id: "daily" });
        setHasClaimed(true);
      } else {
        toast.error(error.message || "Failed to claim reward", { id: "daily" });
      }
    }
  };

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-500/10 to-white pb-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="outline" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Home
          </Button>
          <div className="flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-500" />
            <h1 className="text-2xl font-bold">Daily Challenge</h1>
          </div>
          <div className="w-24" />
        </div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Trophy className="w-8 h-8" />
                {today}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-3xl font-bold">0.5 cUSD</div>
                  <div className="text-sm opacity-90">Reward Pool</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">{dailyLevel.difficulty}/5</div>
                  <div className="text-sm opacity-90">Difficulty</div>
                </div>
                <div>
                  <div className="text-3xl font-bold flex items-center justify-center gap-2">
                    <Users className="w-6 h-6" />
                    ???
                  </div>
                  <div className="text-sm opacity-90">Players Today</div>
                </div>
              </div>

              {hasClaimed && (
                <div className="mt-4 p-3 bg-white/20 rounded-lg text-center">
                  You've already completed today's challenge!
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Game Board */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GameBoard levelId={999} onComplete={handleComplete} />
        </motion.div>

        {/* Rules */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <Card>
            <CardHeader>
              <CardTitle>Daily Challenge Rules</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-gray-600">
              <p>• New challenge every 24 hours</p>
              <p>• Everyone plays the same level</p>
              <p>• Complete once per day to earn 0.5 cUSD</p>
              <p>• Better performance = higher leaderboard ranking</p>
              <p>• Top 10 daily players get bonus rewards!</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
