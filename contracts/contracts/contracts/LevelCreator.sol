// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title LevelCreator
 * @dev Allows players to create custom levels and earn royalties
 * @notice Creators earn 20% when others play their levels
 */
contract LevelCreator is Ownable, ReentrancyGuard {
    // ============ State Variables ============

    IERC20 public immutable cUSD;

    struct CustomLevel {
        address creator;
        string ipfsHash; // Level data stored on IPFS
        uint256 plays;
        uint256 creatorEarnings;
        uint256 difficulty; // 1-5 stars
        bool isActive;
        uint256 createdAt;
    }

    // Level storage
    mapping(uint256 => CustomLevel) public customLevels;
    uint256 public nextLevelId = 1;

    // Creator stats
    mapping(address => uint256[]) public creatorLevels;
    mapping(address => uint256) public creatorTotalEarnings;

    // Play tracking
    mapping(uint256 => mapping(address => bool)) public hasPlayedLevel;
    mapping(uint256 => mapping(address => uint256)) public levelBestScore;

    // Economics
    uint256 public creationFee = 0.1 ether; // 0.1 cUSD to create a level
    uint256 public playReward = 0.03 ether; // Reward for playing custom level
    uint256 public constant CREATOR_ROYALTY_PERCENT = 20; // 20% to creator

    uint256 public treasuryBalance;

    // Events
    event LevelCreated(
        uint256 indexed levelId,
        address indexed creator,
        string ipfsHash,
        uint256 difficulty,
        uint256 timestamp
    );

    event LevelPlayed(
        uint256 indexed levelId,
        address indexed player,
        address indexed creator,
        uint256 moveCount,
        uint256 playerReward,
        uint256 creatorRoyalty,
        uint256 timestamp
    );

    event LevelDeactivated(uint256 indexed levelId);
    event TreasuryFunded(address indexed funder, uint256 amount);

    // ============ Constructor ============

    constructor(address _cUSDAddress) Ownable(msg.sender) {
        require(_cUSDAddress != address(0), "Invalid cUSD address");
        cUSD = IERC20(_cUSDAddress);
    }

    // ============ Main Functions ============

    /**
     * @notice Create a new custom level
     * @param ipfsHash IPFS hash containing level configuration
     * @param difficulty Difficulty rating (1-5)
     */
    function createLevel(
        string calldata ipfsHash,
        uint256 difficulty
    ) external nonReentrant returns (uint256 levelId) {
        require(bytes(ipfsHash).length > 0, "IPFS hash required");
        require(difficulty >= 1 && difficulty <= 5, "Invalid difficulty");

        // Charge creation fee
        require(
            cUSD.transferFrom(msg.sender, address(this), creationFee),
            "Payment failed"
        );
        treasuryBalance += creationFee;

        // Create level
        levelId = nextLevelId++;
        customLevels[levelId] = CustomLevel({
            creator: msg.sender,
            ipfsHash: ipfsHash,
            plays: 0,
            creatorEarnings: 0,
            difficulty: difficulty,
            isActive: true,
            createdAt: block.timestamp
        });

        creatorLevels[msg.sender].push(levelId);

        emit LevelCreated(levelId, msg.sender, ipfsHash, difficulty, block.timestamp);

        return levelId;
    }

    /**
     * @notice Play a custom level and earn rewards
     * @param levelId The custom level ID
     * @param moveCount Number of moves used
     */
    function playCustomLevel(
        uint256 levelId,
        uint256 moveCount
    ) external nonReentrant {
        CustomLevel storage level = customLevels[levelId];
        require(level.isActive, "Level not active");
        require(level.creator != address(0), "Level does not exist");
        require(moveCount > 0, "Invalid move count");

        // Calculate rewards
        uint256 playerReward = calculatePlayerReward(level.difficulty, moveCount);
        uint256 creatorRoyalty = (playerReward * CREATOR_ROYALTY_PERCENT) / 100;
        uint256 totalCost = playerReward + creatorRoyalty;

        require(treasuryBalance >= totalCost, "Insufficient treasury");

        // Update stats
        if (!hasPlayedLevel[levelId][msg.sender]) {
            level.plays++;
            hasPlayedLevel[levelId][msg.sender] = true;
        }

        // Update best score
        if (
            levelBestScore[levelId][msg.sender] == 0 ||
            moveCount < levelBestScore[levelId][msg.sender]
        ) {
            levelBestScore[levelId][msg.sender] = moveCount;
        }

        // Update creator earnings
        level.creatorEarnings += creatorRoyalty;
        creatorTotalEarnings[level.creator] += creatorRoyalty;

        // Deduct from treasury
        treasuryBalance -= totalCost;

        // Transfer rewards
        require(cUSD.transfer(msg.sender, playerReward), "Player transfer failed");
        require(cUSD.transfer(level.creator, creatorRoyalty), "Creator transfer failed");

        emit LevelPlayed(
            levelId,
            msg.sender,
            level.creator,
            moveCount,
            playerReward,
            creatorRoyalty,
            block.timestamp
        );
    }

    /**
     * @notice Deactivate a level (creator or owner only)
     * @param levelId The level to deactivate
     */
    function deactivateLevel(uint256 levelId) external {
        CustomLevel storage level = customLevels[levelId];
        require(
            msg.sender == level.creator || msg.sender == owner(),
            "Not authorized"
        );
        require(level.isActive, "Already inactive");

        level.isActive = false;
        emit LevelDeactivated(levelId);
    }

    // ============ View Functions ============

    /**
     * @notice Calculate player reward based on difficulty and performance
     * @param difficulty Level difficulty (1-5)
     * @param moveCount Moves used
     * @return Player reward amount
     */
    function calculatePlayerReward(
        uint256 difficulty,
        uint256 moveCount
    ) public view returns (uint256) {
        uint256 baseAmount = playReward * difficulty;

        // Efficiency bonus
        uint256 optimalMoves = 10 + (difficulty * 5);

        if (moveCount <= optimalMoves) {
            return (baseAmount * 150) / 100; // 1.5x for perfect
        } else if (moveCount <= optimalMoves + 5) {
            return (baseAmount * 125) / 100; // 1.25x for good
        } else if (moveCount <= optimalMoves + 10) {
            return baseAmount; // 1x for average
        } else {
            return (baseAmount * 75) / 100; // 0.75x for below average
        }
    }

    /**
     * @notice Get level details
     */
    function getLevel(uint256 levelId) external view returns (
        address creator,
        string memory ipfsHash,
        uint256 plays,
        uint256 creatorEarnings,
        uint256 difficulty,
        bool isActive,
        uint256 createdAt
    ) {
        CustomLevel memory level = customLevels[levelId];
        return (
            level.creator,
            level.ipfsHash,
            level.plays,
            level.creatorEarnings,
            level.difficulty,
            level.isActive,
            level.createdAt
        );
    }

    /**
     * @notice Get all levels created by an address
     */
    function getCreatorLevels(address creator) external view returns (uint256[] memory) {
        return creatorLevels[creator];
    }

    /**
     * @notice Get creator stats
     */
    function getCreatorStats(address creator) external view returns (
        uint256 levelsCreated,
        uint256 totalEarnings
    ) {
        return (creatorLevels[creator].length, creatorTotalEarnings[creator]);
    }

    /**
     * @notice Get recent levels (last 20)
     */
    function getRecentLevels() external view returns (uint256[] memory) {
        uint256 count = nextLevelId - 1;
        uint256 returnCount = count > 20 ? 20 : count;
        uint256[] memory recent = new uint256[](returnCount);

        for (uint256 i = 0; i < returnCount; i++) {
            recent[i] = count - i;
        }

        return recent;
    }

    // ============ Admin Functions ============

    /**
     * @notice Fund the treasury
     */
    function fundTreasury(uint256 amount) external {
        require(amount > 0, "Amount must be > 0");
        require(cUSD.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        treasuryBalance += amount;
        emit TreasuryFunded(msg.sender, amount);
    }

    /**
     * @notice Update fees (owner only)
     */
    function updateFees(
        uint256 _creationFee,
        uint256 _playReward
    ) external onlyOwner {
        creationFee = _creationFee;
        playReward = _playReward;
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
