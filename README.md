# CryptoRPG

Welcome to **CryptoRPG**, the ultimate blockchain-powered role-playing game that combines the thrill of dungeon crawling with the innovation of decentralized technology. Whether you're a casual gamer or a hardcore adventurer, CryptoRPG offers an immersive experience that bridges the gap between gaming and blockchain.

## 🚀 Features

- **Story Mode**: Embark on a captivating narrative journey filled with lore, challenges, and epic battles.
- **Endless Mode**: Test your skills in procedurally generated dungeons where no two runs are the same.
- **Blockchain Integration**: Secure and transparent gameplay powered by Ethereum smart contracts.
- **CRPG Token Rewards**: Earn CRPG tokens as you play, which can be traded, staked, or used in-game.
- **Customizable Characters**: Tailor your character's abilities, equipment, and playstyle.
- **Dynamic Environments**: Explore beautifully crafted maps with diverse terrains, traps, and treasures.
- **Community-Driven**: Participate in governance and shape the future of CryptoRPG.

## 🎮 Gameplay Mechanics

### CRPG Token Reward Formula

The CRPG token reward system is designed to incentivize skillful gameplay and exploration. Here's how the reward is calculated:

1. **Base Components**:
   - **Gold**: The amount of gold collected in the chest.
   - **Experience (EXP)**: The experience points earned during gameplay.

2. **Random Bonus**:
   - A random bonus between 1 and 20 is added to ensure variability and excitement.

3. **Scaling Factor**:
   - A scaling factor of `0.01` is applied to balance the economy and ensure fair rewards.

4. **Formula**:
   ```
   Reward = (Gold + EXP) * Scaling Factor + Random Bonus
   ```

5. **Example Calculation**:
   - Gold: 500
   - EXP: 300
   - Random Bonus: 15
   - Scaling Factor: 0.01

   **Reward**:
   ```
   Reward = (500 + 300) * 0.01 + 15 = 8 + 15 = 23 CRPG Tokens
   ```

This formula ensures that rewards are proportional to effort while maintaining an element of surprise.

## 🛠️ Technologies Used

- **React**: For building a dynamic and responsive user interface.
- **Redux**: For state management across the application.
- **Ethers.js**: For seamless blockchain interactions.
- **Vite**: For fast and efficient development.
- **Solidity**: For writing secure and efficient smart contracts.

## 📖 Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/cryptorpg.git
   ```
2. Navigate to the project directory:
   ```bash
   cd cryptorpg
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to `http://localhost:3000` to start your adventure!

## 🔗 Blockchain Integration

CryptoRPG leverages Ethereum smart contracts to ensure secure and transparent gameplay. The CRPG token is an ERC-20 token with the following features:

- **Minting**: Tokens are minted as rewards for in-game achievements.
- **Staking**: Stake your tokens to earn additional rewards.
- **Trading**: Trade CRPG tokens on decentralized exchanges.

## Token Contract Address

The CRPG token is deployed on the Optimism Sepolia testnet. You can view the token details on Blockscout:

[CRPG Token on Blockscout](https://optimism-sepolia.blockscout.com/token/0x1ce14fD9dd6678fC3d192f02207d6ff999B04037)

## 🤝 Contributing

We welcome contributions from the community! If you'd like to contribute, please fork the repository and submit a pull request. For major changes, please open an issue first to discuss what you would like to change.

## 📜 License

This project is licensed under the MIT License. See the `LICENSE` file for details.

## 📧 Contact

For inquiries or support, please contact us at [support@cryptorpg.com](mailto:support@cryptorpg.com).

## 🌟 Join the Adventure

Embark on your CryptoRPG journey today and become a legend in the blockchain gaming world. Collect treasures, defeat monsters, and earn CRPG tokens in a game where your skills and strategy truly matter. The dungeon awaits—are you ready?
