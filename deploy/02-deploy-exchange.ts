import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployExchange: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { getNamedAccounts, deployments, ethers } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  const zhu = await ethers.getContract("Zhu");

  const ZhuExchange = await deploy("ZhuExchange", {
    from: deployer,
    args: [zhu.address],
    log: true,
  });
  await zhu.grantMinterRole(ZhuExchange.address);
};

export default deployExchange;
deployExchange.tags = ["all"];
