import {
  frontEndAbiFolder,
  frontEndContractsFile,
} from "../helper-hardhat-config";
import fs from "fs";
import { network, ethers } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const updateFrontEnd: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  if (process.env.UPDATE_FRONT_END == "true") {
    console.log("Writing to front end...");
    await updateContractAddresses();
    await updateAbi();
    console.log("Front end written!");
  }
};

async function updateContractAddresses() {
  const zhu = await ethers.getContract("Zhu");
  const zhuExchange = await ethers.getContract("ZhuExchange");
  const chainId = network.config.chainId!.toString();

  if (!fs.existsSync(frontEndContractsFile)) {
    fs.writeFileSync(frontEndContractsFile, "{}");
  }

  const contractAddresses = JSON.parse(
    fs.readFileSync(frontEndContractsFile, "utf8")
  );

  if (chainId in contractAddresses) {
    if (!contractAddresses[chainId]["Zhu"].includes(zhu.address)) {
      contractAddresses[chainId]["Zhu"].push(zhu.address);
    }

    if (
      !contractAddresses[chainId]["ZhuExchange"].includes(zhuExchange.address)
    ) {
      contractAddresses[chainId]["ZhuExchange"].push(zhuExchange.address);
    }
  } else {
    contractAddresses[chainId] = {
      Zhu: [zhu.address],
      ZhuExchange: [zhuExchange.address],
    };
  }

  fs.writeFileSync(frontEndContractsFile, JSON.stringify(contractAddresses));
}

async function updateAbi() {
  if (fs.existsSync("./artifacts")) {
    if (fs.existsSync("./artifacts/contracts/Zhu.sol")) {
      const json = JSON.parse(
        await fs.readFileSync("./artifacts/contracts/Zhu.sol/Zhu.json", "utf8")
      );
      fs.writeFileSync(
        `${frontEndAbiFolder}/Zhu.json`,
        JSON.stringify(json.abi)
      );
      console.log(
        "Zhu contract ABI has successfully been copied to destination"
      );
    }
    if (fs.existsSync("./artifacts/contracts/ZhuExchange.sol")) {
      const json = JSON.parse(
        await fs.readFileSync(
          "./artifacts/contracts/ZhuExchange.sol/ZhuExchange.json",
          "utf8"
        )
      );
      fs.writeFileSync(
        `${frontEndAbiFolder}/ZhuExchange.json`,
        JSON.stringify(json.abi)
      );
      console.log(
        "Zhu Exchange contract ABI has successfully been copied to destination"
      );
    }
  }
}

export default updateFrontEnd;
updateFrontEnd.tags = ["all", "frontend"];
