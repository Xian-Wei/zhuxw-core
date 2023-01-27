import { ethers } from "hardhat";
import { INITIAL_SUPPLY } from "../helper-hardhat-config";

async function main() {
  const Zhu = await ethers.getContractFactory("Zhu");
  const zhu = await Zhu.deploy(INITIAL_SUPPLY);

  await zhu.deployed();

  console.log(`Deployed to ${zhu.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
