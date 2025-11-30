import { useNavigate } from "react-router-dom";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, User, Coins, Trophy, TrendingUp, Share2, Copy } from "lucide-react";
import { motion } from "framer-motion";
import { useSortToEarn, useLevelCreator } from "@/hooks/useContract";
import { formatAddress, formatCurrency, copyToClipboard, shareOnTwitter } from "@/lib/utils";
import toast from "react-hot-toast";

export function Profile() {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const { playerStats, cusdBalance } = useSortToEarn();
  const { creatorStats } = useLevelCreator();

  if (!isConnected || !address) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-celo-green/10 to-white flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Connect Wallet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Please connect your wallet to view your profile.
            </p>
            <Button onClick={() => navigate("/")} className="w-full">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = {
    totalEarned: playerStats?.[0] || 0n,
    levelsCompleted: playerStats?.[1] || 0n,
    gaslessUsed: playerStats?.[2] || 0n,
    balance: cusdBalance || 0n,
    levelsCreated: creatorStats?.[0] || 0n,
    creatorEarnings: creatorStats?.[1] || 0n,
  };

  const handleCopyAddress = () => {
    copyToClipboard(address);
    toast.success("Address copied to clipboard!");
  };

  const handleShare = () => {
    const text = `I've earned ${formatCurrency(stats.totalEarned)} cUSD playing SortToEarn on @Celo! 🎮💰\n\nJoin me and start earning while playing: `;
    shareOnTwitter(text);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-celo-green/10 to-white pb-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="outline" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Home
          </Button>
          <div className="flex items-center gap-2">
            <User className="w-6 h-6 text-celo-green" />
            <h1 className="text-2xl font-bold">Profile</h1>
          </div>
          <div className="w-24" />
        </div>

        {/* Address Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-r from-celo-green to-celo-gold text-white">
            <CardContent className="py-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm opacity-90 mb-1">Wallet Address</div>
                  <div className="font-mono text-lg font-semibold">
                    {formatAddress(address)}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyAddress}
                    className="bg-white/20 border-white/40 hover:bg-white/30"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleShare}
                    className="bg-white/20 border-white/40 hover:bg-white/30"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid md:grid-cols-2 gap-6 mb-8"
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Coins className="w-5 h-5 text-celo-gold" />
                Total Earned
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-celo-green">
                {formatCurrency(stats.totalEarned)} cUSD
              </div>
              <div className="text-sm text-gray-500 mt-2">From playing levels</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Trophy className="w-5 h-5 text-celo-gold" />
                Levels Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">
                {Number(stats.levelsCompleted)}
              </div>
              <div className="text-sm text-gray-500 mt-2">Out of 220 total levels</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Coins className="w-5 h-5 text-celo-green" />
                Current Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">
                {formatCurrency(stats.balance)}
              </div>
              <div className="text-sm text-gray-500 mt-2">cUSD in wallet</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                Gasless Plays Used
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">
                {Number(stats.gaslessUsed)} / 20
              </div>
              <div className="text-sm text-gray-500 mt-2">Free gasless transactions</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Creator Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Level Creator Stats</span>
                <Button onClick={() => navigate("/create")}>
                  Create Level
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="text-sm text-gray-500">Levels Created</div>
                  <div className="text-3xl font-bold mt-1">
                    {Number(stats.levelsCreated)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Royalties Earned</div>
                  <div className="text-3xl font-bold mt-1 text-celo-green">
                    {formatCurrency(stats.creatorEarnings)} cUSD
                  </div>
                </div>
              </div>
              {Number(stats.levelsCreated) === 0 && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-gray-600">
                    Create your first level and earn 20% royalties when others play it!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Achievement Badges (Future Feature) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <Card>
            <CardHeader>
              <CardTitle>Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                {Number(stats.levelsCompleted) >= 10 && (
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-br from-celo-green to-celo-gold rounded-full flex items-center justify-center mb-2">
                      <Trophy className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-xs font-semibold">10 Levels</div>
                  </div>
                )}
                {Number(stats.levelsCompleted) >= 50 && (
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-2">
                      <Trophy className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-xs font-semibold">50 Levels</div>
                  </div>
                )}
                {Number(stats.levelsCompleted) >= 100 && (
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mb-2">
                      <Trophy className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-xs font-semibold">100 Levels</div>
                  </div>
                )}
              </div>
              {Number(stats.levelsCompleted) === 0 && (
                <div className="text-center text-gray-500 py-8">
                  Complete levels to unlock achievements!
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
