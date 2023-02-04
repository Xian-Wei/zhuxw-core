import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { INITIAL_SUPPLY } from "../helper-hardhat-config";

const deployToken: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { getNamedAccounts, deployments } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  const zhuToken = await deploy("Zhu", {
    from: deployer,
    args: [INITIAL_SUPPLY],
    log: true,
  });
  log(`Zhu Token deployed at ${zhuToken.address}`);
};

export default deployToken;
deployToken.tags = ["all"];
