// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

/**
 * @title SortToEarn
 * @dev Main game contract for Ball Sort Puzzle Play-to-Earn on Celo
 * @notice Players earn cUSD by solving levels efficiently
 */
contract SortToEarn is Ownable, ReentrancyGuard {
    // ============ State Variables ============

    IERC20 public immutable cUSD;

    // Reward structure
    uint256 public constant MAX_LEVELS = 200;
    uint256 public baseReward = 0.05 ether; // 0.05 cUSD base reward
    uint256 public hintCost = 0.02 ether;
    uint256 public undoCost = 0.01 ether;

    // Daily challenge
    uint256 public dailyChallengePool = 1 ether;
    uint256 public dailyChallengeReward = 0.5 ether;
    mapping(uint256 => mapping(address => bool)) public dailyChallengeClaimed;

    // Leaderboard
    struct LeaderboardEntry {
        address player;
        uint256 totalEarned;
        uint256 levelsCompleted;
        uint256 bestMoves;
    }

    mapping(address => uint256) public playerTotalEarned;
    mapping(address => uint256) public playerLevelsCompleted;
    mapping(address => mapping(uint256 => uint256)) public playerLevelBestMoves;
    mapping(address => mapping(uint256 => bool)) public levelCompleted;

    // Gasless transactions for first 20 levels
    mapping(address => uint256) public gaslessLevelsUsed;
    uint256 public constant GASLESS_LEVEL_LIMIT = 20;

    // Treasury
    uint256 public treasuryBalance;

    // Events
    event LevelCompleted(
        address indexed player,
        uint256 indexed levelId,
        uint256 moveCount,
        uint256 reward,
        uint256 timestamp
    );

    event DailyChallengeCompleted(
        address indexed player,
        uint256 indexed dayId,
        uint256 reward,
        uint256 timestamp
    );

    event HintPurchased(address indexed player, uint256 amount);
    event UndoPurchased(address indexed player, uint256 amount);
    event TreasuryFunded(address indexed funder, uint256 amount);
    event RewardClaimed(address indexed player, uint256 amount);

    // ============ Constructor ============

    constructor(address _cUSDAddress) Ownable(msg.sender) {
        require(_cUSDAddress != address(0), "Invalid cUSD address");
        cUSD = IERC20(_cUSDAddress);
    }

    // ============ Main Game Functions ============

    /**
     * @notice Claim reward for completing a level
     * @param levelId The level completed (1-200)
     * @param moveCount Number of moves used
     */
    function claimReward(
        uint256 levelId,
        uint256 moveCount
    ) external nonReentrant {
        require(levelId > 0 && levelId <= MAX_LEVELS, "Invalid level ID");
        require(moveCount > 0, "Invalid move count");

        // Calculate reward based on efficiency
        uint256 reward = calculateReward(levelId, moveCount);
        require(treasuryBalance >= reward, "Insufficient treasury");

        // Update player stats
        if (!levelCompleted[msg.sender][levelId]) {
            playerLevelsCompleted[msg.sender]++;
            levelCompleted[msg.sender][levelId] = true;
        }

        // Update best score if better
        if (
            playerLevelBestMoves[msg.sender][levelId] == 0 ||
            moveCount < playerLevelBestMoves[msg.sender][levelId]
        ) {
            playerLevelBestMoves[msg.sender][levelId] = moveCount;
        }

        // Update total earned
        playerTotalEarned[msg.sender] += reward;
        treasuryBalance -= reward;

        // Transfer reward
        require(cUSD.transfer(msg.sender, reward), "Transfer failed");

        emit LevelCompleted(msg.sender, levelId, moveCount, reward, block.timestamp);
    }

    /**
     * @notice Complete daily challenge and claim reward
     * @param dayId The day identifier (block.timestamp / 86400)
     * @param moveCount Number of moves used
     */
    function claimDailyChallenge(
        uint256 dayId,
        uint256 moveCount
    ) external nonReentrant {
        require(dayId == block.timestamp / 86400, "Invalid day");
        require(!dailyChallengeClaimed[dayId][msg.sender], "Already claimed");
        require(moveCount > 0, "Invalid move count");
        require(treasuryBalance >= dailyChallengeReward, "Insufficient treasury");

        dailyChallengeClaimed[dayId][msg.sender] = true;
        playerTotalEarned[msg.sender] += dailyChallengeReward;
        treasuryBalance -= dailyChallengeReward;

        require(cUSD.transfer(msg.sender, dailyChallengeReward), "Transfer failed");

        emit DailyChallengeCompleted(msg.sender, dayId, dailyChallengeReward, block.timestamp);
    }

    /**
     * @notice Purchase a hint
     */
    function purchaseHint() external nonReentrant {
        require(cUSD.transferFrom(msg.sender, address(this), hintCost), "Payment failed");
        treasuryBalance += hintCost;
        emit HintPurchased(msg.sender, hintCost);
    }

    /**
     * @notice Purchase an undo (after first free undo)
     */
    function purchaseUndo() external nonReentrant {
        require(cUSD.transferFrom(msg.sender, address(this), undoCost), "Payment failed");
        treasuryBalance += undoCost;
        emit UndoPurchased(msg.sender, undoCost);
    }

    // ============ View Functions ============

    /**
     * @notice Calculate reward based on level difficulty and efficiency
     * @param levelId The level ID
     * @param moveCount Moves used by player
     * @return reward The cUSD reward amount
     */
    function calculateReward(
        uint256 levelId,
        uint256 moveCount
    ) public view returns (uint256 reward) {
        // Base reward increases with level difficulty
        uint256 difficultyMultiplier = 1 + (levelId / 20); // Increases every 20 levels
        uint256 levelReward = baseReward * difficultyMultiplier;

        // Efficiency bonus (fewer moves = higher reward)
        // Optimal moves estimation: levelId + 5
        uint256 optimalMoves = levelId + 5;

        if (moveCount <= optimalMoves) {
            // Perfect score: 150% reward
            reward = (levelReward * 150) / 100;
        } else if (moveCount <= optimalMoves + 5) {
            // Good score: 125% reward
            reward = (levelReward * 125) / 100;
        } else if (moveCount <= optimalMoves + 10) {
            // Average score: 100% reward
            reward = levelReward;
        } else {
            // Below average: 75% reward
            reward = (levelReward * 75) / 100;
        }

        return reward;
    }

    /**
     * @notice Get top 10 players by total earned
     * @return players Top 10 player addresses
     * @return earnings Player total earnings
     * @return levelsCompleted Number of levels completed
     */
    function getLeaderboard() external view returns (
        address[] memory players,
        uint256[] memory earnings,
        uint256[] memory levelsCompleted
    ) {
        // Note: This is a simplified version. In production, maintain sorted array
        // or use off-chain indexing for gas efficiency
        players = new address[](10);
        earnings = new uint256[](10);
        levelsCompleted = new uint256[](10);

        // This would need to be implemented with proper sorting
        // For hackathon, recommend using The Graph for leaderboard queries
    }

    /**
     * @notice Get player statistics
     */
    function getPlayerStats(address player) external view returns (
        uint256 totalEarned,
        uint256 levelsCompleted,
        uint256 gaslessUsed
    ) {
        return (
            playerTotalEarned[player],
            playerLevelsCompleted[player],
            gaslessLevelsUsed[player]
        );
    }

    /**
     * @notice Check if player has completed a level
     */
    function hasCompletedLevel(address player, uint256 levelId) external view returns (bool) {
        return levelCompleted[player][levelId];
    }

    /**
     * @notice Get current day ID for daily challenge
     */
    function getCurrentDayId() external view returns (uint256) {
        return block.timestamp / 86400;
    }

    /**
     * @notice Check if player has claimed today's challenge
     */
    function hasClaimedDailyChallenge(address player) external view returns (bool) {
        uint256 today = block.timestamp / 86400;
        return dailyChallengeClaimed[today][player];
    }

    // ============ Admin Functions ============

    /**
     * @notice Fund the treasury with cUSD
     */
    function fundTreasury(uint256 amount) external {
        require(amount > 0, "Amount must be > 0");
        require(cUSD.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        treasuryBalance += amount;
        emit TreasuryFunded(msg.sender, amount);
    }

    /**
     * @notice Update reward parameters (owner only)
     */
    function updateRewardParams(
        uint256 _baseReward,
        uint256 _hintCost,
        uint256 _undoCost,
        uint256 _dailyChallengeReward
    ) external onlyOwner {
        baseReward = _baseReward;
        hintCost = _hintCost;
        undoCost = _undoCost;
        dailyChallengeReward = _dailyChallengeReward;
    }

    /**
     * @notice Emergency withdraw (owner only)
     */
    function emergencyWithdraw(uint256 amount) external onlyOwner {
        require(amount <= treasuryBalance, "Insufficient balance");
        treasuryBalance -= amount;
        require(cUSD.transfer(owner(), amount), "Transfer failed");
    }

    /**
     * @notice Get contract balance
     */
    function getContractBalance() external view returns (uint256) {
        return cUSD.balanceOf(address(this));
    }
}
