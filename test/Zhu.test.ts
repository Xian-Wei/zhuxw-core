import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { assert, expect } from "chai";
import { ethers } from "hardhat";
import { INITIAL_SUPPLY } from "../helper-hardhat-config";
import { Zhu } from "../typechain-types";

describe("ZHU Token", function () {
  let zhu: Zhu;
  let deployer: SignerWithAddress;
  let user1: SignerWithAddress;
  const supply = INITIAL_SUPPLY;
  let decimals: number;

  beforeEach(async () => {
    const accounts = await ethers.getSigners();
    deployer = accounts[0];
    user1 = accounts[1];

    const Zhu = await ethers.getContractFactory("Zhu");
    zhu = await Zhu.deploy(supply);
    decimals = await zhu.decimals();
  });

  it("Should have a total supply of INITIAL_SUPPLY", async () => {
    const totalSupply = await zhu.totalSupply();
    assert.equal(totalSupply.toString(), supply + "0".repeat(decimals));
  });

  it("Should be able to transfer tokens to an address", async () => {
    const tokensToSend = ethers.utils.parseEther("100");
    await zhu.transfer(user1.address, tokensToSend);
    expect(await zhu.balanceOf(user1.address)).to.equal(tokensToSend);
  });
});
