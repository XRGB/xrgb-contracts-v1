import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from 'dotenv'
import 'hardhat-deploy'
dotenv.config()

const deployer = process.env.DEPLOY_PRIVATE_KEY || '0x' + '11'.repeat(32)
const BASE_BLOCK_EXPLORER_KEY = process.env.BASE_BLOCK_EXPLORER_KEY || '';
const ETHEREUM_BLOCK_EXPLORER_KEY = process.env.ETHEREUM_BLOCK_EXPLORER_KEY || '';
const LINEA_BLOCK_EXPLORER_KEY = process.env.LINEA_BLOCK_EXPLORER_KEY || '';
const BNB_BLOCK_EXPLORER_KEY = process.env.BNB_BLOCK_EXPLORER_KEY || '';

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: '0.8.20',
        settings: {
          optimizer: {
            enabled: true,
            runs: 20,
            details: {
              yul: true,
            },
          },
        },
      },
    ],
  },
  networks: {
    hardhat: {
      gas: 16000000,
    },
    bsc_mainnet: {
      chainId: 56,
      url: process.env.BSC_MAINNET_RPC_URL || '',
      accounts: [deployer],
    },
    linea_mainnet: {
      chainId: 59144,
      url: process.env.LINEA_RPC_URL || '',
      accounts: [deployer],
    },
    linea_testnet: {
      chainId: 59140,
      url: process.env.LINEA_TESTNET_RPC_URL || '',
      accounts: [deployer],
    },
    baseMain: {
      chainId: 8453,
      url: process.env.BASE_MAIN_RPC_URL || '',
      accounts: [deployer],
    },
    baseGoerli: {
      chainId: 84531,
      url: process.env.BASE_TEST_RPC_URL || '',
      accounts: [deployer],
    },
    eth_mainnet: {
      chainId: 1,
      url: process.env.ETH_MAINNET_RPC_URL || '',
      accounts: [deployer],
    },
    goerli: {
      chainId: 5,
      url: process.env.GOERLI_RPC_URL || '',
      accounts: [deployer],
    },
    bscTestnet: {
      chainId: 97,
      url: process.env.BSC_TESETNET_RPC_URL || '',
      accounts: [deployer],
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
    }
  },
  etherscan: {
    apiKey: {
      goerli: ETHEREUM_BLOCK_EXPLORER_KEY,
      baseGoerli: BASE_BLOCK_EXPLORER_KEY,
      baseMainnet: BASE_BLOCK_EXPLORER_KEY,
      linea_mainnet: LINEA_BLOCK_EXPLORER_KEY,
      linea_tesetnet: LINEA_BLOCK_EXPLORER_KEY,
      bscTestnet: BNB_BLOCK_EXPLORER_KEY,
      mainnet: ETHEREUM_BLOCK_EXPLORER_KEY
    },
    customChains: [
      {
        network: "linea_mainnet",
        chainId: 59144,
        urls: {
         apiURL: "https://api.lineascan.build/api",
         browserURL: "https://lineascan.build/"
        }
      },
      {
        network: "linea_tesetnet",
        chainId: 59140,
        urls: {
         apiURL: "https://api-goerli.lineascan.build/api",
         browserURL: "https://goerli.lineascan.build/"
        }
      },
      {
        network: "baseMainnet",
        chainId: 8453,
        urls: {
         apiURL: "https://api.basescan.org/api",
         browserURL: "https://basescan.org"
        }
      },
      {
        network: "baseGoerli",
        chainId: 84531,
        urls: {
         apiURL: "https://api-goerli.basescan.org/api",
         browserURL: "https://goerli.basescan.org/"
        }
      }
    ]
  }
};

export default config;
