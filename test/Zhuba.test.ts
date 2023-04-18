import { assert, expect } from "chai";
import { network, deployments, ethers } from "hardhat";
import { developmentChains } from "../helper-hardhat-config";
import { VRFCoordinatorV2Mock, Zhu, Zhuba } from "../typechain-types";

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Zhuba NFT Unit Tests", function () {
      let zhu: Zhu;
      let zhuba: Zhuba,
        deployer: any,
        vrfCoordinatorV2Mock: VRFCoordinatorV2Mock;

      beforeEach(async () => {
        const accounts = await ethers.getSigners();
        deployer = accounts[0];
        await deployments.fixture(["mocks", "all"]);
        zhu = await ethers.getContract("Zhu");
        zhuba = await ethers.getContract("Zhuba");
        vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock");
      });

      describe("constructor", function () {
        it("sets starting values correctly", async function () {
          const dogZhubaUriZero = await zhuba.getZhubaTokenUris(0);
          const isInitialized = await zhuba.getInitialized();
          assert(dogZhubaUriZero.includes("ipfs://"));
          assert.equal(isInitialized, true);
        });
      });

      describe("requestNft", function () {
        it("fails if mint fee is not approved", async function () {
          await expect(zhuba.requestNft()).to.be.revertedWithCustomError(
            zhuba,
            "Zhuba__NotEnoughAllowance"
          );
        });
        it("emits and event and kicks off a random word request", async function () {
          const fee = await zhuba.getMintFee();
          await zhu._approve(zhuba.address, fee);
          await expect(zhuba.requestNft()).to.emit(zhuba, "NftRequested");
        });
      });

      describe("fulfillRandomWords", function () {
        it("mints NFT after random number returned", async function () {
          await new Promise<void>(async (resolve, reject) => {
            zhuba.once("NftMinted", async () => {
              try {
                const tokenUri = await zhuba.tokenURI(0);
                const tokenCounter = await zhuba.getTokenCounter();
                assert.equal(tokenUri.toString().includes("ipfs://"), true);
                assert.equal(tokenCounter.toString(), "1");
                resolve();
              } catch (e) {
                console.log(e);
                reject(e);
              }
            });
            try {
              const fee = await zhuba.getMintFee();
              await zhu._approve(zhuba.address, fee);

              const requestNftResponse = await zhuba.requestNft();
              const requestNftReceipt = await requestNftResponse.wait(1);

              await vrfCoordinatorV2Mock.fulfillRandomWords(
                requestNftReceipt.events![1].args!.requestId,
                zhuba.address
              );
            } catch (e) {
              console.log(e);
              reject(e);
            }
          });
        });
      });
    });
