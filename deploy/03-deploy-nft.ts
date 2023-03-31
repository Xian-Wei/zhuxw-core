import {
  developmentChains,
  networkConfig,
  VERIFICATION_BLOCK_CONFIRMATIONS,
} from "../helper-hardhat-config";
import verify from "../utils/verify";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const FUND_AMOUNT = "1000000000000000000000";
1;

let tokenUris = [
  "ipfs://QmZYGS1SPxUqSg6uFetAydRzWvkXEP9shFGM75MPr2LXsw",
  "ipfs://QmNnVfkG8Qqecs9ELk3S1aEvy3c4ft5fqT9RTkUvseSviE",
  "ipfs://QmVUh9QL6U4Bz2AEPT8wgVvgPSkqVpB1FagP9YocqyK9Ue",
  "ipfs://Qmb1DhA2ahxUADeBjy68YHSxBRVKLVFsZSyePRUAfATnvu",
  "ipfs://QmUSPewEVu9Wkc7rY2vRkHhF5GrhXKGAASRYY84faHAWdu",
];

const deployNft: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { deployments, getNamedAccounts, network, ethers } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId!;
  let vrfCoordinatorV2Address, subscriptionId;

  if (chainId == 31337) {
    // create VRFV2 Subscription
    const vrfCoordinatorV2Mock = await ethers.getContract(
      "VRFCoordinatorV2Mock"
    );
    vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address;
    const transactionResponse = await vrfCoordinatorV2Mock.createSubscription();
    const transactionReceipt = await transactionResponse.wait();
    subscriptionId = transactionReceipt.events[0].args.subId;
    // Fund the subscription
    // Our mock makes it so we don't actually have to worry about sending fund
    await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, FUND_AMOUNT);
  } else {
    vrfCoordinatorV2Address = networkConfig[chainId].vrfCoordinatorV2;
    subscriptionId = networkConfig[chainId].subscriptionId;
  }

  const waitBlockConfirmations = developmentChains.includes(network.name)
    ? 1
    : VERIFICATION_BLOCK_CONFIRMATIONS;

  const args = [
    vrfCoordinatorV2Address,
    subscriptionId,
    networkConfig[chainId]["gasLane"],
    networkConfig[chainId]["mintFee"],
    networkConfig[chainId]["callbackGasLimit"],
    tokenUris,
  ];
  const zhuba = await deploy("Zhuba", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: waitBlockConfirmations || 1,
  });

  // Verify the deployment
  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    log("Verifying...");
    await verify(zhuba.address, args);
  }

  log("----------------------------------------------------");
};

export default deployNft;
deployNft.tags = ["all", "nft"];
