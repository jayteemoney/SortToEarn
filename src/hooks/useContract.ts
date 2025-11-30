import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { SORTTOEARN_CONTRACT, LEVELCREATOR_CONTRACT, CUSD_TOKEN } from "../lib/celoConfig";
import { SORTTOEARN_ABI, LEVELCREATOR_ABI, ERC20_ABI } from "../lib/abis";
import { parseEther } from "viem";

export function useSortToEarn() {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  // Read player stats
  const { data: playerStats, refetch: refetchStats } = useReadContract({
    address: SORTTOEARN_CONTRACT,
    abi: SORTTOEARN_ABI,
    functionName: "getPlayerStats",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Read current day ID
  const { data: currentDayId } = useReadContract({
    address: SORTTOEARN_CONTRACT,
    abi: SORTTOEARN_ABI,
    functionName: "getCurrentDayId",
  });

  // Read costs
  const { data: hintCost } = useReadContract({
    address: SORTTOEARN_CONTRACT,
    abi: SORTTOEARN_ABI,
    functionName: "hintCost",
  });

  const { data: undoCost } = useReadContract({
    address: SORTTOEARN_CONTRACT,
    abi: SORTTOEARN_ABI,
    functionName: "undoCost",
  });

  // Read cUSD balance
  const { data: cusdBalance, refetch: refetchBalance } = useReadContract({
    address: CUSD_TOKEN,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Claim reward for level
  const claimReward = async (levelId: number, moveCount: number) => {
    if (!address) throw new Error("Wallet not connected");

    const hash = await writeContractAsync({
      address: SORTTOEARN_CONTRACT,
      abi: SORTTOEARN_ABI,
      functionName: "claimReward",
      args: [BigInt(levelId), BigInt(moveCount)],
    });

    return hash;
  };

  // Claim daily challenge
  const claimDailyChallenge = async (moveCount: number) => {
    if (!address || !currentDayId) throw new Error("Not ready");

    const hash = await writeContractAsync({
      address: SORTTOEARN_CONTRACT,
      abi: SORTTOEARN_ABI,
      functionName: "claimDailyChallenge",
      args: [currentDayId, BigInt(moveCount)],
    });

    return hash;
  };

  // Purchase hint
  const purchaseHint = async () => {
    if (!address) throw new Error("Wallet not connected");

    // First approve
    await writeContractAsync({
      address: CUSD_TOKEN,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [SORTTOEARN_CONTRACT, hintCost || parseEther("0.02")],
    });

    // Then purchase
    const hash = await writeContractAsync({
      address: SORTTOEARN_CONTRACT,
      abi: SORTTOEARN_ABI,
      functionName: "purchaseHint",
    });

    return hash;
  };

  // Purchase undo
  const purchaseUndo = async () => {
    if (!address) throw new Error("Wallet not connected");

    // First approve
    await writeContractAsync({
      address: CUSD_TOKEN,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [SORTTOEARN_CONTRACT, undoCost || parseEther("0.01")],
    });

    // Then purchase
    const hash = await writeContractAsync({
      address: SORTTOEARN_CONTRACT,
      abi: SORTTOEARN_ABI,
      functionName: "purchaseUndo",
    });

    return hash;
  };

  return {
    playerStats,
    currentDayId,
    hintCost,
    undoCost,
    cusdBalance,
    claimReward,
    claimDailyChallenge,
    purchaseHint,
    purchaseUndo,
    refetchStats,
    refetchBalance,
  };
}

export function useLevelCreator() {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  // Get creator stats
  const { data: creatorStats, refetch: refetchCreatorStats } = useReadContract({
    address: LEVELCREATOR_CONTRACT,
    abi: LEVELCREATOR_ABI,
    functionName: "getCreatorStats",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Get recent levels
  const { data: recentLevels } = useReadContract({
    address: LEVELCREATOR_CONTRACT,
    abi: LEVELCREATOR_ABI,
    functionName: "getRecentLevels",
  });

  // Create level
  const createLevel = async (ipfsHash: string, difficulty: number) => {
    if (!address) throw new Error("Wallet not connected");

    // Approve creation fee (0.1 cUSD)
    await writeContractAsync({
      address: CUSD_TOKEN,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [LEVELCREATOR_CONTRACT, parseEther("0.1")],
    });

    // Create level
    const hash = await writeContractAsync({
      address: LEVELCREATOR_CONTRACT,
      abi: LEVELCREATOR_ABI,
      functionName: "createLevel",
      args: [ipfsHash, BigInt(difficulty)],
    });

    return hash;
  };

  // Play custom level
  const playCustomLevel = async (levelId: number, moveCount: number) => {
    if (!address) throw new Error("Wallet not connected");

    const hash = await writeContractAsync({
      address: LEVELCREATOR_CONTRACT,
      abi: LEVELCREATOR_ABI,
      functionName: "playCustomLevel",
      args: [BigInt(levelId), BigInt(moveCount)],
    });

    return hash;
  };

  return {
    creatorStats,
    recentLevels,
    createLevel,
    playCustomLevel,
    refetchCreatorStats,
  };
}
