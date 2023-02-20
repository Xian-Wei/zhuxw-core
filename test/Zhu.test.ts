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

    expect(totalSupplyAfter - totalSupplyBefore).to.equal(faucetAmount);
  });

  it("Should be able to set the faucet amount", async () => {
    const faucetAmount = Number(await zhu.getFaucetAmount());
    const newFaucetAmount = faucetAmount / 2;

    await zhu.setFaucetAmount(newFaucetAmount);

    expect(newFaucetAmount).to.equal(Number(await zhu.getFaucetAmount()));

    const totalSupplyBefore = Number(
      ethers.utils.formatEther(await zhu.totalSupply())
    );
    await zhu.faucet();
    const totalSupplyAfter = Number(
      ethers.utils.formatEther(await zhu.totalSupply())
    );

    expect(totalSupplyAfter - totalSupplyBefore).to.equal(newFaucetAmount);
  });

  it("Shouldn't be able to use faucet consecutively", async () => {
    await zhu.faucet();

    await expect(zhu.faucet()).to.be.revertedWithCustomError(
      zhu,
      `Zhu__LockTimeNotReached`
    );
  });

  it("Should be able to call Minter functions with role", async () => {
    const [addr1, addr2] = await ethers.getSigners();
    const mintAmount = 42000;

    await expect(
      zhu.connect(addr1).mintTokenTo(addr2.address, 42000)
    ).to.be.revertedWithCustomError(zhu, "Zhu__CallerNotGrantedPermission");

    await zhu.grantMinterRole(addr1.address);

    await zhu.connect(addr1).mintTokenTo(addr2.address, mintAmount);

    const addr2Balance = await zhu.balanceOf(addr2.address);

    expect(addr2Balance).to.equal(mintAmount);
  });
});
