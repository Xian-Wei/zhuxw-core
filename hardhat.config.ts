import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy";
import "dotenv/config";
import "@nomiclabs/hardhat-ethers";

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const MAINNET_RPC_URL = process.env.MAINNET_RPC_URL;
const POLYGON_MAINNET_RPC_URL = process.env.GOERLI_RPC_URL;
const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL;

const config: HardhatUserConfig = {
  solidity: "0.8.17",
  networks: {
    hardhat: {
      // forking: {
      //   url: MAINNET_RPC_URL
      // }
      chainId: 31337,
    },
    localhost: {
      chainId: 31337,
    },
    mainnet: {
      url: MAINNET_RPC_URL,
      accounts: PRIVATE_KEY !== undefined ? [PRIVATE_KEY] : [],
      saveDeployments: true,
      chainId: 1,
    },
    polygon: {
      url: POLYGON_MAINNET_RPC_URL,
      accounts: PRIVATE_KEY !== undefined ? [PRIVATE_KEY] : [],
      saveDeployments: true,
      chainId: 137,
    },
    goerli: {
      url: GOERLI_RPC_URL,
      accounts: PRIVATE_KEY !== undefined ? [PRIVATE_KEY] : [],
      saveDeployments: true,
      chainId: 5,
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
      1: 0,
    },
  },
};

export default config;
