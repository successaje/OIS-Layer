require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");

const {
  PRIVATE_KEY,
  INFURA_API_KEY,
  ALCHEMY_API_KEY,
  ETHERSCAN_API_KEY,
  ARBISCAN_API_KEY,
  BASESCAN_API_KEY,
  POLYGONSCAN_API_KEY,
  SNOWTRACE_API_KEY,
  BSCSCAN_API_KEY,
  OPTIMISTIC_ETHERSCAN_API_KEY,
} = process.env;

module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: { enabled: true, runs: 200 },
      viaIR: true,
    },
  },

  networks: {
    hardhat: { chainId: 31337 },

    sepolia: {
      url: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 11155111,
    },

    arbitrumSepolia: {
      url: `https://arb-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 421614,
    },

    baseSepolia: {
      url: `https://base-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 84532,
    },

    fuji: {
      url: "https://api.avax-test.network/ext/bc/C/rpc",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 43113,
    },
  },

  etherscan: {
    apiKey: {
      sepolia: ETHERSCAN_API_KEY,
      arbitrumSepolia: ARBISCAN_API_KEY,
      baseSepolia: BASESCAN_API_KEY,
      polygonMumbai: POLYGONSCAN_API_KEY,
      fuji: SNOWTRACE_API_KEY,
    },

    customChains: [
      {
        network: "arbitrumSepolia",
        chainId: 421614,
        urls: {
          apiURL: "https://api-sepolia.arbiscan.io/api/v2",
          browserURL: "https://sepolia.arbiscan.io",
        },
      },
      {
        network: "baseSepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api/v2",
          browserURL: "https://sepolia.basescan.org",
        },
      },
      {
        network: "fuji",
        chainId: 43113,
        urls: {
          apiURL: "https://api-testnet.snowtrace.io/api/v2",
          browserURL: "https://testnet.snowtrace.io",
        },
      },
    ],
  },
};
