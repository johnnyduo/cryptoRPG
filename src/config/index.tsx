// src/config/index.tsx
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { mainnet, arbitrum, sepolia } from '@reown/appkit/networks';
import type { AppKitNetwork } from '@reown/appkit/networks';

// Get projectId
export const projectId = '093238f49c9c27106bd6b7c0246641e0';

export const metadata = {
  name: 'React RPG',
  description: 'A Web3-enabled RPG game',
  url: window.location.origin,
  icons: ['https://avatars.githubusercontent.com/u/179229932']
};

// Define OP Sepolia network
const opSepolia: AppKitNetwork = {
  id: 11155420,
  name: 'OP Sepolia',
  network: 'op-sepolia',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ['https://sepolia.optimism.io']
    },
    public: {
      http: ['https://sepolia.optimism.io']
    }
  },
  blockExplorers: {
    default: {
      name: 'Optimistic Etherscan',
      url: 'https://sepolia-optimistic.etherscan.io'
    }
  },
  testnet: true
};

// Define networks to support with proper TypeScript typing
export const networks = [opSepolia, mainnet, arbitrum, sepolia] as [AppKitNetwork, ...AppKitNetwork[]];
// Create Wagmi adapter with specific connector configuration
export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks,
  ssr: false,
  // Configure connectors to avoid COOP errors
  connectorOptions: {
    coinbaseWallet: false, // Disable Coinbase Wallet which often causes COOP errors
    walletConnect: true,
    injected: true
  }
});

// Export wagmi config for convenience
export const wagmiConfig = wagmiAdapter.wagmiConfig;