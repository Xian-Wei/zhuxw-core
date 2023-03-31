import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import {
  developmentChains,
  FAUCET_AMOUNT,
  INITIAL_SUPPLY,
} from "../helper-hardhat-config";
import verify from "../utils/verify";

const deployToken: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { getNamedAccounts, deployments, network } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  const args: any[] = [INITIAL_SUPPLY, FAUCET_AMOUNT];
  const zhu = await deploy("Zhu", {
    from: deployer,
    args: args,
    log: true,
  });

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    log("Verifying...");
    await verify(zhu.address, args);
  }
  log("----------------------------------");
};

export default deployToken;
deployToken.tags = ["all"];
