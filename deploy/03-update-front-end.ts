import {
  frontEndAbiFolder,
  frontEndContractsFile,
} from "../helper-hardhat-config";
import fs from "fs";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const updateUI: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { network, ethers } = hre;
  const chainId = "31337";

  if (process.env.UPDATE_FRONT_END == "true") {
    console.log("Writing to front end...");
    const zhu = await ethers.getContract("Zhu");
    const zhuExchange = await ethers.getContract("ZhuExchange");
    const contractAddresses = JSON.parse(
      fs.readFileSync(frontEndContractsFile, "utf8")
    );
    if (chainId in contractAddresses) {
      if (!contractAddresses[network.config.chainId!].includes(zhu.address)) {
        contractAddresses[network.config.chainId!].push(zhu.address);
      }

      if (
        !contractAddresses[network.config.chainId!].includes(
          zhuExchange.address
        )
      ) {
        contractAddresses[network.config.chainId!].push(zhuExchange.address);
      }
    } else {
      contractAddresses[network.config.chainId!] = [zhu.address];
    }
    fs.writeFileSync(frontEndContractsFile, JSON.stringify(contractAddresses));

    if (fs.existsSync("./artifacts")) {
      if (fs.existsSync("./artifacts/contracts/Zhu.sol")) {
        const json = JSON.parse(
          await fs.readFileSync(
            "./artifacts/contracts/Zhu.sol/Zhu.json",
            "utf8"
          )
        );
        fs.writeFileSync(
          `${frontEndAbiFolder}/Zhu.json`,
          JSON.stringify(json.abi)
        );
        console.log(
          "Zhu contract ABI has successfully been copied to destination"
        );
      }
      if (fs.existsSync("./artifacts/contracts/Zhu.sol")) {
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
    console.log("Front end written!");
  }
};

export default updateUI;
updateUI.tags = ["all", "frontend"];
