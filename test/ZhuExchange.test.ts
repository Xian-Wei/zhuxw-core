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
  const faucetAmount = 10000;
  const amount = 20000;

  beforeEach(async () => {
    const accounts = await ethers.getSigners();
    deployer = accounts[0];
    user1 = accounts[1];

    const Zhu = await ethers.getContractFactory("Zhu");
    zhu = await Zhu.deploy(supply, faucetAmount);
    const ZhuExchange = await ethers.getContractFactory("ZhuExchange");
    zhuExchange = await ZhuExchange.deploy(zhu.address);

    await zhu.grantMinterRole(zhuExchange.address);
  });

  it(`Should have shorted and won`, async () => {
    let balanceBefore = ethers.utils.formatEther(
      await zhu.balanceOf(deployer.address)
    );

    await zhu._approve(zhuExchange.address, amount);
    await zhuExchange.short(amount, 819);
    await zhuExchange.executeTrades(789);

    let balanceAfter = ethers.utils.formatEther(
      await zhu.balanceOf(deployer.address)
    );

    assert.isAbove(Number(balanceAfter), Number(balanceBefore));
  });

  it(`Should have shorted and lost`, async () => {
    let balanceBefore = ethers.utils.formatEther(
      await zhu.balanceOf(deployer.address)
    );

    await zhu._approve(zhuExchange.address, amount);
    await zhuExchange.short(amount, 789);
    await zhuExchange.executeTrades(819);

    let balanceAfter = ethers.utils.formatEther(
      await zhu.balanceOf(deployer.address)
    );

    assert.isBelow(Number(balanceAfter), Number(balanceBefore));
  });

  it(`Should have shorted and lost everything`, async () => {
    let balanceBefore = ethers.utils.formatEther(
      await zhu.balanceOf(deployer.address)
    );

    await zhu._approve(zhuExchange.address, amount);
    await zhuExchange.short(amount, 200);
    await zhuExchange.executeTrades(800);

    let balanceAfter = ethers.utils.formatEther(
      await zhu.balanceOf(deployer.address)
    );

    assert.equal(Number(balanceAfter), Number(balanceBefore) - amount);
  });

  it(`Should have longed and won`, async () => {
    let balanceBefore = ethers.utils.formatEther(
      await zhu.balanceOf(deployer.address)
    );

    await zhu._approve(zhuExchange.address, amount);
    await zhuExchange.long(amount, 789);
    await zhuExchange.executeTrades(819);

    let balanceAfter = ethers.utils.formatEther(
      await zhu.balanceOf(deployer.address)
    );

    assert.isAbove(Number(balanceAfter), Number(balanceBefore));
  });

  it(`Should have longed and lost`, async () => {
    let balanceBefore = ethers.utils.formatEther(
      await zhu.balanceOf(deployer.address)
    );

    await zhu._approve(zhuExchange.address, amount);
    await zhuExchange.long(amount, 819);
    await zhuExchange.executeTrades(789);

    let balanceAfter = ethers.utils.formatEther(
      await zhu.balanceOf(deployer.address)
    );

    assert.isBelow(Number(balanceAfter), Number(balanceBefore));
  });

  it(`Should have longed and lost everything`, async () => {
    let balanceBefore = ethers.utils.formatEther(
      await zhu.balanceOf(deployer.address)
    );

    await zhu._approve(zhuExchange.address, amount);
    await zhuExchange.long(amount, 800);
    await zhuExchange.executeTrades(200);

    let balanceAfter = ethers.utils.formatEther(
      await zhu.balanceOf(deployer.address)
    );

    assert.equal(Number(balanceAfter), Number(balanceBefore) - amount);
  });
});
