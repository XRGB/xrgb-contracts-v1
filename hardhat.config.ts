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
    bnb: {
      chainId: 56,
      url: process.env.BNB_RPC_URL || '',
      accounts: [deployer],
    },
    linea: {
      chainId: 59144,
      url: process.env.LINEA_RPC_URL || '',
      accounts: [deployer],
    },
    baseMain: {
      chainId: 8453,
      url: process.env.BASE_MAIN_RPC_URL || '',
      accounts: [deployer],
      gasPrice: 1000000000,
    },
    baseGoerli: {
      chainId: 84531,
      url: process.env.BASE_TEST_RPC_URL || '',
      accounts: [deployer],
      gasPrice: 1000000000,
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
      linea: LINEA_BLOCK_EXPLORER_KEY,
      bnb:BNB_BLOCK_EXPLORER_KEY,
      ethMain: ETHEREUM_BLOCK_EXPLORER_KEY
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
