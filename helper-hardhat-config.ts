export interface networkConfigItem {
  name?: string;
  subscriptionId?: string;
  keepersUpdateInterval?: string;
  raffleEntranceFee?: string;
  callbackGasLimit?: string;
  vrfCoordinatorV2?: string;
  gasLane?: string;
  ethUsdPriceFeed?: string;
  mintFee?: string;
}

export interface networkConfigInfo {
  [key: number]: networkConfigItem;
}

export const networkConfig: networkConfigInfo = {
  31337: {
    name: "localhost",
    gasLane:
      "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc", // 30 gwei
    mintFee: "1000000000000000", // 0.001 ETH
    callbackGasLimit: "500000", // 500,000 gas
  },
  11155111: {
    name: "sepolia",
    vrfCoordinatorV2: "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625",
    gasLane:
      "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c",
    callbackGasLimit: "500000", // 500,000 gas
    mintFee: "1000000000000000", // 0.001 ETH
    subscriptionId: "850",
  },
  80001: {
    name: "mumbai",
    vrfCoordinatorV2: "0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed",
    gasLane:
      "0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f", // 500 gwei
    callbackGasLimit: "500000", // 500,000 gas
    mintFee: "1000000000000000", // 0.001 MATIC
    subscriptionId: "3933",
  },
};

// Zhu & ZhuExchange contracts
export const INITIAL_SUPPLY = 1000000;
export const FAUCET_AMOUNT = 10000;
export const frontEndContractsFile =
  "../zhuxw/data/artifacts/contractAddresses.json";
export const frontEndAbiFolder = "../zhuxw/data/artifacts/";

// Chainlink mocks
export const DECIMALS = "18";
export const INITIAL_PRICE = "200000000000000000000";

export const developmentChains = ["hardhat", "localhost"];
export const VERIFICATION_BLOCK_CONFIRMATIONS = 6;
