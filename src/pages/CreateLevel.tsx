import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Plus, Trash2, Save, Star } from "lucide-react";
import { motion } from "framer-motion";
import { useLevelCreator } from "@/hooks/useContract";
import { COLORS } from "@/lib/levels";
import toast from "react-hot-toast";

export function CreateLevel() {
  const navigate = useNavigate();
  const { isConnected } = useAccount();
  const { createLevel } = useLevelCreator();

  const [tubes, setTubes] = useState<number[][]>([[], [], [], []]);
  const [difficulty, setDifficulty] = useState<number>(1);
  const [selectedColor, setSelectedColor] = useState<number>(1);
  const [isCreating, setIsCreating] = useState(false);

  const addTube = () => {
    if (tubes.length >= 12) {
      toast.error("Maximum 12 tubes allowed");
      return;
    }
    setTubes([...tubes, []]);
  };

  const removeTube = (index: number) => {
    if (tubes.length <= 2) {
      toast.error("Minimum 2 tubes required");
      return;
    }
    setTubes(tubes.filter((_, i) => i !== index));
  };

  const addBallToTube = (tubeIndex: number) => {
    if (tubes[tubeIndex].length >= 4) {
      toast.error("Tube is full (max 4 balls)");
      return;
    }
    const newTubes = [...tubes];
    newTubes[tubeIndex] = [...newTubes[tubeIndex], selectedColor];
    setTubes(newTubes);
  };

  const removeBallFromTube = (tubeIndex: number) => {
    if (tubes[tubeIndex].length === 0) return;
    const newTubes = [...tubes];
    newTubes[tubeIndex] = newTubes[tubeIndex].slice(0, -1);
    setTubes(newTubes);
  };

  const clearAll = () => {
    setTubes([[], [], [], []]);
  };

  const validateLevel = (): string | null => {
    const ballCounts: Record<number, number> = {};
    let totalBalls = 0;

    tubes.forEach((tube) => {
      tube.forEach((ball) => {
        ballCounts[ball] = (ballCounts[ball] || 0) + 1;
        totalBalls++;
      });
    });

    if (totalBalls === 0) return "Level is empty";
    if (totalBalls < 8) return "Level too simple (min 8 balls)";

    // Check if each color has exactly 4 balls
    for (const count of Object.values(ballCounts)) {
      if (count !== 4) {
        return "Each color must have exactly 4 balls";
      }
    }

    return null;
  };

  const handleCreateLevel = async () => {
    if (!isConnected) {
      toast.error("Connect wallet to create level");
      return;
    }

    const validationError = validateLevel();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      setIsCreating(true);
      toast.loading("Creating level...", { id: "create" });

      // In production, upload to IPFS
      // For demo, create a simple hash
      const levelData = JSON.stringify({ tubes, difficulty });
      const ipfsHash = `Qm${btoa(levelData).substring(0, 44)}`;

      await createLevel(ipfsHash, difficulty);

      toast.success("Level created successfully!", { id: "create" });
      toast.success("You'll earn 20% royalties when others play it!");

      // Navigate to profile
      setTimeout(() => navigate("/profile"), 2000);
    } catch (error: any) {
      toast.error(error.message || "Failed to create level", { id: "create" });
    } finally {
      setIsCreating(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-celo-green/10 to-white flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Connect Wallet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Please connect your wallet to create levels.
            </p>
            <Button onClick={() => navigate("/")} className="w-full">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-500/10 to-white pb-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="outline" onClick={() => navigate("/profile")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Profile
          </Button>
          <h1 className="text-2xl font-bold">Create Level</h1>
          <div className="w-24" />
        </div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <CardHeader>
              <CardTitle>Earn Royalties</CardTitle>
              <CardDescription className="text-white/90">
                Create custom levels and earn 20% royalties every time someone plays them!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">0.1 cUSD</div>
                  <div className="text-sm opacity-90">Creation Fee</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">20%</div>
                  <div className="text-sm opacity-90">Royalty Rate</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">∞</div>
                  <div className="text-sm opacity-90">Earn Forever</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Editor */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Level Editor</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Color Picker */}
                <div className="mb-6">
                  <div className="text-sm font-semibold mb-2">Selected Color:</div>
                  <div className="flex flex-wrap gap-2">
                    {COLORS.map((color, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedColor(index + 1)}
                        className={`w-10 h-10 rounded-full transition-all ${
                          selectedColor === index + 1
                            ? "ring-4 ring-celo-green scale-110"
                            : "hover:scale-105"
                        }`}
                        style={{
                          backgroundColor: color,
                          boxShadow: `0 4px 8px ${color}40`,
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Tubes */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-semibold">Tubes:</div>
                    <Button onClick={addTube} size="sm">
                      <Plus className="w-4 h-4 mr-1" />
                      Add Tube
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    {tubes.map((tube, tubeIndex) => (
                      <div key={tubeIndex} className="flex flex-col items-center gap-2">
                        <div
                          className="relative flex flex-col-reverse items-center justify-start p-2 pb-4 gap-1 rounded-2xl border-4 border-gray-300 bg-gradient-to-b from-gray-50 to-gray-100 min-h-[180px] w-[60px] cursor-pointer hover:border-celo-green transition-colors"
                          onClick={() => addBallToTube(tubeIndex)}
                        >
                          {tube.map((color, ballIndex) => (
                            <div
                              key={ballIndex}
                              className="w-full aspect-square rounded-full shadow-lg"
                              style={{
                                backgroundColor: COLORS[color - 1],
                                boxShadow: `0 4px 8px ${COLORS[color - 1]}40`,
                              }}
                            />
                          ))}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeBallFromTube(tubeIndex);
                            }}
                            disabled={tube.length === 0}
                          >
                            -
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeTube(tubeIndex);
                            }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Difficulty */}
                <div className="mb-6">
                  <div className="text-sm font-semibold mb-2">Difficulty:</div>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <button
                        key={level}
                        onClick={() => setDifficulty(level)}
                        className={`w-12 h-12 rounded-lg border-2 transition-all ${
                          difficulty >= level
                            ? "bg-celo-gold border-celo-gold"
                            : "border-gray-300 hover:border-celo-gold"
                        }`}
                      >
                        <Star
                          className={`w-6 h-6 mx-auto ${
                            difficulty >= level ? "text-white fill-white" : "text-gray-400"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button onClick={clearAll} variant="outline" className="flex-1">
                    Clear All
                  </Button>
                  <Button
                    onClick={handleCreateLevel}
                    disabled={isCreating}
                    className="flex-1"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isCreating ? "Creating..." : "Create Level"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Instructions */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>How to Create</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="font-semibold mb-1">1. Select a Color</div>
                  <p className="text-sm text-gray-600">
                    Click a color from the palette to select it for placing balls.
                  </p>
                </div>

                <div>
                  <div className="font-semibold mb-1">2. Add Balls to Tubes</div>
                  <p className="text-sm text-gray-600">
                    Click on a tube to add the selected color ball. Each tube can hold up to 4
                    balls.
                  </p>
                </div>

                <div>
                  <div className="font-semibold mb-1">3. Add/Remove Tubes</div>
                  <p className="text-sm text-gray-600">
                    Use the "Add Tube" button or trash icon to manage tubes. Leave some empty
                    for the puzzle!
                  </p>
                </div>

                <div>
                  <div className="font-semibold mb-1">4. Set Difficulty</div>
                  <p className="text-sm text-gray-600">
                    Rate your level from 1 to 5 stars based on complexity.
                  </p>
                </div>

                <div>
                  <div className="font-semibold mb-1">5. Create & Earn</div>
                  <p className="text-sm text-gray-600">
                    Pay 0.1 cUSD creation fee and start earning 20% royalties!
                  </p>
                </div>

                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="font-semibold text-yellow-800 mb-1">Requirements:</div>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Each color must have exactly 4 balls</li>
                    <li>• Minimum 2 colors (8 balls total)</li>
                    <li>• Leave 1-2 empty tubes for solving</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
