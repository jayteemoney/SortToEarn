// Simplified ABIs for the frontend
export const SORTTOEARN_ABI = [
  "function claimReward(uint256 levelId, uint256 moveCount) external",
  "function claimDailyChallenge(uint256 dayId, uint256 moveCount) external",
  "function purchaseHint() external",
  "function purchaseUndo() external",
  "function calculateReward(uint256 levelId, uint256 moveCount) view returns (uint256)",
  "function getPlayerStats(address player) view returns (uint256 totalEarned, uint256 levelsCompleted, uint256 gaslessUsed)",
  "function hasCompletedLevel(address player, uint256 levelId) view returns (bool)",
  "function getCurrentDayId() view returns (uint256)",
  "function hasClaimedDailyChallenge(address player) view returns (bool)",
  "function playerTotalEarned(address) view returns (uint256)",
  "function playerLevelsCompleted(address) view returns (uint256)",
  "function baseReward() view returns (uint256)",
  "function hintCost() view returns (uint256)",
  "function undoCost() view returns (uint256)",
  "function dailyChallengeReward() view returns (uint256)",
  "event LevelCompleted(address indexed player, uint256 indexed levelId, uint256 moveCount, uint256 reward, uint256 timestamp)",
  "event DailyChallengeCompleted(address indexed player, uint256 indexed dayId, uint256 reward, uint256 timestamp)",
] as const;

export const LEVELCREATOR_ABI = [
  "function createLevel(string calldata ipfsHash, uint256 difficulty) external returns (uint256)",
  "function playCustomLevel(uint256 levelId, uint256 moveCount) external",
  "function getLevel(uint256 levelId) view returns (address creator, string memory ipfsHash, uint256 plays, uint256 creatorEarnings, uint256 difficulty, bool isActive, uint256 createdAt)",
  "function getCreatorLevels(address creator) view returns (uint256[] memory)",
  "function getCreatorStats(address creator) view returns (uint256 levelsCreated, uint256 totalEarnings)",
  "function getRecentLevels() view returns (uint256[] memory)",
  "function calculatePlayerReward(uint256 difficulty, uint256 moveCount) view returns (uint256)",
  "event LevelCreated(uint256 indexed levelId, address indexed creator, string ipfsHash, uint256 difficulty, uint256 timestamp)",
  "event LevelPlayed(uint256 indexed levelId, address indexed player, address indexed creator, uint256 moveCount, uint256 playerReward, uint256 creatorRoyalty, uint256 timestamp)",
] as const;

export const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
] as const;
