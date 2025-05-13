// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";

/**
 * @title CryptoRPGToken
 * @dev ERC20 Token for CryptoRPG project with a maximum supply cap
 */
contract CryptoRPGToken is ERC20, Ownable {
    // Events for better transparency
    event TokensMinted(address indexed to, uint256 amount);
    event TokensBurned(address indexed from, uint256 amount);
    
    // Track claimed game rewards
    mapping(bytes32 => bool) public claimedGames;
    event GameRewarded(bytes32 indexed gameId, address indexed player, uint256 amount);
    
    // Maximum supply: 200 million tokens with 18 decimals
    uint256 private constant MAX_SUPPLY = 200_000_000 * 10**18;
    
    /**
     * @dev Constructor that sets up the token with a max supply cap
     * @param initialMint The initial amount to mint to the deployer (can be 0)
     */
    constructor(uint256 initialMint) 
        ERC20("CryptoRPG", "CRPG") 
        Ownable(msg.sender) 
    {
        if (initialMint > 0) {
            require(initialMint <= MAX_SUPPLY, "Initial mint exceeds max supply");
            _mint(msg.sender, initialMint);
        }
    }

    /**
     * @dev Creates `amount` tokens and assigns them to `recipient`
     * @param recipient The address which will receive the minted tokens
     * @param amount The amount of tokens to mint
     */
    function mint(address recipient, uint256 amount) external onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "Mint would exceed max supply");
        _mint(recipient, amount);
        emit TokensMinted(recipient, amount);
    }

    /**
     * @dev Claim rewards for a specific game (prevents double claims)
     * @param gameId Unique identifier for the game session
     * @param player The player's address
     * @param amount The amount of tokens to reward
     */
    function claimGameReward(bytes32 gameId, address player, uint256 amount) external onlyOwner {
        require(!claimedGames[gameId], "Rewards already claimed for this game");
        require(totalSupply() + amount <= MAX_SUPPLY, "Mint would exceed max supply");
        
        claimedGames[gameId] = true;
        _mint(player, amount);
        
        emit TokensMinted(player, amount);
        emit GameRewarded(gameId, player, amount);
    }

    /**
     * @dev Destroys `amount` tokens from `account`
     * @param account The address from which to burn tokens
     * @param amount The amount of tokens to burn
     */
    function burn(address account, uint256 amount) external onlyOwner {
        _burn(account, amount);
        emit TokensBurned(account, amount);
    }

    /**
     * @dev Allows users to burn their own tokens
     * @param amount The amount of tokens to burn
     */
    function burnOwn(uint256 amount) external {
        _burn(msg.sender, amount);
        emit TokensBurned(msg.sender, amount);
    }

    /**
     * @dev Returns the chain ID of the current blockchain
     * @return The chain ID
     */
    function getChainId() external view returns (uint256) {
        return block.chainid;
    }
    
    /**
     * @dev Returns the maximum supply of tokens
     * @return The maximum supply
     */
    function maxSupply() external pure returns (uint256) {
        return MAX_SUPPLY;
    }
    
    /**
     * @dev Returns the remaining tokens that can be minted
     * @return The remaining mintable supply
     */
    function remainingMintableSupply() external view returns (uint256) {
        return MAX_SUPPLY - totalSupply();
    }
}
