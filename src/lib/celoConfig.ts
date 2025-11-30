import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "viem";
import { defineChain } from "viem";

// Define Celo Sepolia Testnet
export const celoSepolia = defineChain({
  id: 44787,
  name: 'Celo Alfajores Testnet',
  network: 'celo-alfajores',
  nativeCurrency: {
    decimals: 18,
    name: 'CELO',
    symbol: 'CELO',
  },
  rpcUrls: {
    default: {
      http: ['https://alfajores-forno.celo-testnet.org'],
    },
    public: {
      http: ['https://alfajores-forno.celo-testnet.org'],
    },
  },
  blockExplorers: {
    default: { name: 'Celoscan', url: 'https://alfajores.celoscan.io' },
  },
  testnet: true,
});

export const config = getDefaultConfig({
  appName: "SortToEarn",
  projectId: (import.meta as any).env?.VITE_WALLETCONNECT_PROJECT_ID || "demo",
  chains: [celoSepolia],
  transports: {
    [celoSepolia.id]: http(),
  },
  ssr: false,
});

// Contract addresses
export const SORTTOEARN_CONTRACT = ((import.meta as any).env?.VITE_SORTTOEARN_CONTRACT || "0x029dF2c1C69CEFe9Ce762B6a8d3D04b309Fc07D8") as `0x${string}`;
export const LEVELCREATOR_CONTRACT = ((import.meta as any).env?.VITE_LEVELCREATOR_CONTRACT || "0x7F3974B5503c99A184122a6a4C1CF884F5c64Fb6") as `0x${string}`;
export const CUSD_TOKEN = ((import.meta as any).env?.VITE_CUSD_TOKEN || "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1") as `0x${string}`;

// Chain config
export const CHAIN_ID = 44787;
