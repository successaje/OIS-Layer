import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, arbitrum, base, optimism, polygon, sepolia } from 'wagmi/chains';

// Get WalletConnect project ID from environment or use a default for development
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo-project-id';

export const config = getDefaultConfig({
  appName: 'Omnichain Intent Settlement Layer',
  projectId,
  chains: [mainnet, arbitrum, base, optimism, polygon, sepolia],
  ssr: true,
});

