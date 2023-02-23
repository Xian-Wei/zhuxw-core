import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { FAUCET_AMOUNT, INITIAL_SUPPLY } from "../helper-hardhat-config";

const deployToken: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { getNamedAccounts, deployments } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  await deploy("Zhu", {
    from: deployer,
    args: [INITIAL_SUPPLY, FAUCET_AMOUNT],
    log: true,
  });
};

export default deployToken;
deployToken.tags = ["all"];
