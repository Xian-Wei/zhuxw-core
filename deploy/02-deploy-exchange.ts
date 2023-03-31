import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { developmentChains } from "../helper-hardhat-config";
import verify from "../utils/verify";

const deployExchange: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { getNamedAccounts, deployments, network, ethers } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  const zhu = await ethers.getContract("Zhu");

  const zhuExchange = await deploy("ZhuExchange", {
    from: deployer,
    args: [zhu.address],
    log: true,
  });
  await zhu.grantMinterRole(zhuExchange.address);

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    log("Verifying...");
    await verify(zhuExchange.address, [zhu.address]);
  }
  log("----------------------------------");
};

export default deployExchange;
deployExchange.tags = ["all"];
