import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from 'dotenv'
import 'hardhat-deploy'
dotenv.config()

const deployer = process.env.DEPLOY_PRIVATE_KEY || '0x' + '11'.repeat(32)
const BASE_BLOCK_EXPLORER_KEY = process.env.BASE_BLOCK_EXPLORER_KEY || '';
const ETHEREUM_BLOCK_EXPLORER_KEY = process.env.ETHEREUM_BLOCK_EXPLORER_KEY || '';

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: '0.8.17',
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
    mumbai: {
      chainId: 80001,
      url: process.env.MUMBAI_RPC_URL || '',
      accounts: [deployer],
      gas: 16000000,
    },
    sepolia: {
      chainId: 11155111,
      url: process.env.SEPOLIA_RPC_URL || '',
      accounts: [deployer],
    },
    goerli: {
      chainId: 5,
      url: process.env.GOERLI_RPC_URL || '',
      accounts: [deployer],
    },
    baseGoerli: {
      chainId: 84531,
      url: process.env.BASE_TEST_RPC_URL || '',
      accounts: [deployer],
      gasPrice: 1000000000,
    },
    baseMain: {
      chainId: 8453,
      url: process.env.BASE_MAIN_RPC_URL || '',
      accounts: [deployer],
      gasPrice: 1000000000,
    },
    jolnir: {
      chainId: 167007,
      url: process.env.TAIKO_TESTNET_URL || '',
      accounts: [deployer],
      gasPrice: 1000000000,
    },
    ethMain: {
      chainId: 1,
      url: process.env.ETHMAIN_RPC_URL || '',
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
      baseGoerli: BASE_BLOCK_EXPLORER_KEY,
      baseMainnet: BASE_BLOCK_EXPLORER_KEY,
      sepolia: ETHEREUM_BLOCK_EXPLORER_KEY,
      goerli: ETHEREUM_BLOCK_EXPLORER_KEY
    },
    customChains: [
      {
        network: "baseGoerli",
        chainId: 84531,
        urls: {
         apiURL: "https://api-goerli.basescan.org/api",
         browserURL: "https://goerli.basescan.org"
        }
      },
      {
        network: "baseMainnet",
        chainId: 8453,
        urls: {
         apiURL: "https://api.basescan.org/api",
         browserURL: "https://basescan.org"
        }
      }
    ]
  }
};

export default config;
