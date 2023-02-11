import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { assert, expect } from "chai";
import { ethers } from "hardhat";
import { INITIAL_SUPPLY } from "../helper-hardhat-config";
import { Zhu, ZhuExchange } from "../typechain-types";

describe("ZHU Exchange", function () {
  let zhu: Zhu;
  let zhuExchange: ZhuExchange;
  let deployer: SignerWithAddress;
  let user1: SignerWithAddress;
  const supply = INITIAL_SUPPLY;
  let decimals: number;
  const amount = 45600;

  beforeEach(async () => {
    const accounts = await ethers.getSigners();
    deployer = accounts[0];
    user1 = accounts[1];

    const Zhu = await ethers.getContractFactory("Zhu");
    zhu = await Zhu.deploy(supply);
    decimals = await zhu.decimals();
    const ZhuExchange = await ethers.getContractFactory("ZhuExchange");
    zhuExchange = await ZhuExchange.deploy(zhu.address);
  });

  it(`Should have shorted and sent ${amount} ZHU to contract`, async () => {
    let balanceBefore = await zhu.balanceOf(deployer.address);

    await zhu._approve(zhuExchange.address, amount);
    await zhuExchange.short(amount, 500);

    let balanceAfter = await zhu.balanceOf(deployer.address);

    const diff = balanceBefore.sub(balanceAfter);

    assert.equal(diff.toString(), amount + "0".repeat(decimals));
  });

  it(`Should have longed and sent ${amount} ZHU to contract`, async () => {
    let balanceBefore = await zhu.balanceOf(deployer.address);

    await zhu._approve(zhuExchange.address, amount);
    await zhuExchange.long(amount, 500);

    let balanceAfter = await zhu.balanceOf(deployer.address);

    const diff = balanceBefore.sub(balanceAfter);

    assert.equal(diff.toString(), amount + "0".repeat(decimals));
  });

  it(`Should have shorted and won the trade`, async () => {
    const snapshot = 819;
    const finalWeight = 789;

    let balanceBefore = await ethers.utils.formatEther(
      await zhu.balanceOf(deployer.address)
    );

    await zhu._approve(zhuExchange.address, amount);
    await zhuExchange.short(amount, snapshot);
    await zhuExchange.executeTrades(finalWeight);

    let balanceAfter = await ethers.utils.formatEther(
      await zhu.balanceOf(deployer.address)
    );

    expect(Number(balanceAfter)).to.be.above(Number(balanceBefore));
  });

  it(`Should have shorted and lost the trade`, async () => {
    const snapshot = 789;
    const finalWeight = 819;

    let balanceBefore = await ethers.utils.formatEther(
      await zhu.balanceOf(deployer.address)
    );

    await zhu._approve(zhuExchange.address, amount);
    await zhuExchange.short(amount, snapshot);
    await zhuExchange.executeTrades(finalWeight);

    let balanceAfter = await ethers.utils.formatEther(
      await zhu.balanceOf(deployer.address)
    );

    expect(Number(balanceAfter)).to.be.below(Number(balanceBefore));
  });

  it(`Should have longed and won the trade`, async () => {
    const snapshot = 789;
    const finalWeight = 819;

    let balanceBefore = await ethers.utils.formatEther(
      await zhu.balanceOf(deployer.address)
    );

    await zhu._approve(zhuExchange.address, amount);
    await zhuExchange.long(amount, snapshot);
    await zhuExchange.executeTrades(finalWeight);

    let balanceAfter = await ethers.utils.formatEther(
      await zhu.balanceOf(deployer.address)
    );

    expect(Number(balanceAfter)).to.be.above(Number(balanceBefore));
  });

  it(`Should have longed and lost the trade`, async () => {
    const snapshot = 819;
    const finalWeight = 789;

    let balanceBefore = await ethers.utils.formatEther(
      await zhu.balanceOf(deployer.address)
    );

    await zhu._approve(zhuExchange.address, amount);
    await zhuExchange.long(amount, snapshot);
    await zhuExchange.executeTrades(finalWeight);

    let balanceAfter = await ethers.utils.formatEther(
      await zhu.balanceOf(deployer.address)
    );

    expect(Number(balanceAfter)).to.be.below(Number(balanceBefore));
  });
});
