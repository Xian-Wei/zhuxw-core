// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "hardhat/console.sol";

error Zhuba__AlreadyInitialized();
error Zhuba__NeedMoreETHSent();
error Zhuba__RangeOutOfBounds();
error Zhuba__TransferFailed();

contract Zhuba is ERC721URIStorage, VRFConsumerBaseV2, Ownable {
    // Types
    enum ZhubaType {
        ULTRARARE,
        SUPERRARE,
        RARE,
        UNCOMMON,
        COMMON
    }

    // Chainlink VRF Variables
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    uint64 private immutable i_subscriptionId;
    bytes32 private immutable i_gasLane;
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;

    // NFT Variables
    uint256 private immutable i_mintFee;
    uint256 private s_tokenCounter;
    uint256 internal constant MAX_CHANCE_VALUE = 100;
    string[] internal s_zhubaTokenUris;
    bool private s_initialized;

    // VRF Helpers
    mapping(uint256 => address) public s_requestIdToSender;

    // Events
    event NftRequested(uint256 indexed requestId, address requester);
    event NftMinted(ZhubaType zhubaType, address minter);

    constructor(
        address vrfCoordinatorV2,
        uint64 subscriptionId,
        bytes32 gasLane, // keyHash
        uint256 mintFee,
        uint32 callbackGasLimit,
        string[5] memory zhubaTokenUris
    ) VRFConsumerBaseV2(vrfCoordinatorV2) ERC721("Zhuba", "ZHUBA") {
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_gasLane = gasLane;
        i_subscriptionId = subscriptionId;
        i_mintFee = mintFee;
        i_callbackGasLimit = callbackGasLimit;
        _initializeContract(zhubaTokenUris);
        s_tokenCounter = 0;
    }

    function requestNft() public payable returns (uint256 requestId) {
        if (msg.value < i_mintFee) {
            revert Zhuba__NeedMoreETHSent();
        }
        requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane,
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );

        s_requestIdToSender[requestId] = msg.sender;
        emit NftRequested(requestId, msg.sender);
    }

    function fulfillRandomWords(
        uint256 requestId,
        uint256[] memory randomWords
    ) internal override {
        address zhubaOwner = s_requestIdToSender[requestId];
        uint256 newItemId = s_tokenCounter;
        s_tokenCounter = s_tokenCounter + 1;
        uint256 moddedRng = randomWords[0] % MAX_CHANCE_VALUE;
        ZhubaType zhubaType = getTypeFromModdedRng(moddedRng);
        _safeMint(zhubaOwner, newItemId);
        _setTokenURI(newItemId, s_zhubaTokenUris[uint256(zhubaType)]);
        emit NftMinted(zhubaType, zhubaOwner);
    }

    function getChanceArray() public pure returns (uint8[5] memory) {
        return [5, 15, 30, 60, 100];
    }

    function _initializeContract(string[5] memory zhubaTokenUris) private {
        if (s_initialized) {
            revert Zhuba__AlreadyInitialized();
        }
        s_zhubaTokenUris = zhubaTokenUris;
        s_initialized = true;
    }

    function getTypeFromModdedRng(
        uint256 moddedRng
    ) public pure returns (ZhubaType) {
        uint256 cumulativeSum = 0;
        uint8[5] memory chanceArray = getChanceArray();
        for (uint256 i = 0; i < chanceArray.length; i++) {
            // UR = 0 - 4  (5%)
            // SR = 5 - 14  (10%)
            // R = 15 = 29 (15%)
            // U = 30 = 59 (30%)
            // C = 60 = 99 (40%)
            if (moddedRng >= cumulativeSum && moddedRng < chanceArray[i]) {
                return ZhubaType(i);
            }
            cumulativeSum = chanceArray[i];
        }
        revert Zhuba__RangeOutOfBounds();
    }

    function withdraw() public onlyOwner {
        uint256 amount = address(this).balance;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        if (!success) {
            revert Zhuba__TransferFailed();
        }
    }

    function getMintFee() public view returns (uint256) {
        return i_mintFee;
    }

    function getZhubaTokenUris(
        uint256 index
    ) public view returns (string memory) {
        return s_zhubaTokenUris[index];
    }

    function getInitialized() public view returns (bool) {
        return s_initialized;
    }

    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }
}
