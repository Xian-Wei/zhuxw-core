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

        const zhuDeployment = await deployments.get("Zhu");
        zhu = (await ethers.getContractAt("Zhu", zhuDeployment.address)) as Zhu;

        const zhubaDeployment = await deployments.get("Zhuba");
        zhuba = (await ethers.getContractAt("Zhuba", zhubaDeployment.address)) as Zhuba;

        const vrfCoordinatorV2MockDeployment = await deployments.get("VRFCoordinatorV2Mock");
        vrfCoordinatorV2Mock = (await ethers.getContractAt(
          "VRFCoordinatorV2Mock",
          vrfCoordinatorV2MockDeployment.address
        )) as VRFCoordinatorV2Mock;

        const transactionResponse = await vrfCoordinatorV2Mock.createSubscription();
        const transactionReceipt = await transactionResponse.wait();
        const subscriptionId = transactionReceipt.events[0].args.subId;
        await vrfCoordinatorV2Mock.addConsumer(subscriptionId, zhuba.address);
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
        // it("emits an event and kicks off a random word request", async function () {
        //   const fee = await zhuba.getMintFee();
        //   await zhu._approve(zhuba.address, fee);
        //   await expect(zhuba.requestNft()).to.emit(zhuba, "NftRequested");
        // });
      });

      // describe("fulfillRandomWords", function () {
      //   it("mints NFT after random number returned", async function () {
      //     await new Promise<void>(async (resolve, reject) => {
      //       zhuba.once("NftMinted", async () => {
      //         try {
      //           const tokenUri = await zhuba.tokenURI(0);
      //           const tokenCounter = await zhuba.getTokenCounter();
      //           assert.equal(tokenUri.toString().includes("ipfs://"), true);
      //           assert.equal(tokenCounter.toString(), "1");
      //           resolve();
      //         } catch (e) {
      //           console.log(e);
      //           reject(e);
      //         }
      //       });
      //       try {
      //         const fee = await zhuba.getMintFee();
      //         await zhu._approve(zhuba.address, fee);

      //         const requestNftResponse = await zhuba.requestNft();
      //         const requestNftReceipt = await requestNftResponse.wait(1);

      //         await vrfCoordinatorV2Mock.fulfillRandomWords(
      //           requestNftReceipt.events![1].args!.requestId,
      //           zhuba.address
      //         );
      //       } catch (e) {
      //         console.log(e);
      //         reject(e);
      //       }
      //     });
      //   });
      //});
    });
