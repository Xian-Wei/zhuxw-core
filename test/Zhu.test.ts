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
  const faucetAmount = 10000;

  beforeEach(async () => {
    const accounts = await ethers.getSigners();
    deployer = accounts[0];
    user1 = accounts[1];

    const Zhu = await ethers.getContractFactory("Zhu");
    zhu = await Zhu.deploy(supply, faucetAmount);
  });

  it("Should have a total supply of INITIAL_SUPPLY", async () => {
    const totalSupply: number = Number(
      ethers.utils.formatEther(await zhu.totalSupply())
    );
    assert.equal(totalSupply, supply);
  });

  it("Should be able to transfer tokens to an address", async () => {
    const tokensToSend = ethers.utils.parseEther("100");
    await zhu.transfer(user1.address, tokensToSend);
    expect(await zhu.balanceOf(user1.address)).to.equal(tokensToSend);
  });

  it("Should be able to use faucet to mint tokens", async () => {
    const totalSupplyBefore = Number(
      ethers.utils.formatEther(await zhu.totalSupply())
    );
    const faucetAmount = await zhu.getFaucetAmount();

    await zhu.faucet();

    const totalSupplyAfter = Number(
      ethers.utils.formatEther(await zhu.totalSupply())
    );

    expect(Number(totalSupplyAfter) - Number(totalSupplyBefore)).to.equal(
      faucetAmount
    );
  });

  it("Shouldn't be able to use faucet consecutively", async () => {
    await zhu.faucet();

    await expect(zhu.faucet()).to.be.revertedWithCustomError(
      zhu,
      `Zhu__LockTimeNotReached`
    );
  });
});
