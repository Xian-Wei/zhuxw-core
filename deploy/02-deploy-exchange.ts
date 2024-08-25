import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { developmentChains } from "../helper-hardhat-config";
import verify from "../utils/verify";

const deployExchange: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { getNamedAccounts, deployments, network, ethers } = hre;
  const { deploy, log, get } = deployments; // Added get method from deployments
  const { deployer } = await getNamedAccounts();

  // Fetch the deployed Zhu contract
  const zhu = await get("Zhu"); // Get the contract deployment using hardhat-deploy
  const zhuContract = await ethers.getContractAt("Zhu", zhu.address); // Get contract instance using ethers

  const zhuExchange = await deploy("ZhuExchange", {
    from: deployer,
    args: [zhu.address],
    log: true,
  });

  // Grant the Minter Role to ZhuExchange contract
  await zhuContract.grantMinterRole(zhuExchange.address);

  // Verify contract if on a live network
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
