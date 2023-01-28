// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Zhu is ERC20 {
    mapping(address => uint16) public faucetUseCount;
    mapping(address => uint256) public lockTime;

    constructor(uint256 initialSupply) ERC20("Zhu", "ZHU") {
        _mint(msg.sender, initialSupply * (10**decimals()));
    }

    function faucet() public {
        require(block.timestamp > lockTime[msg.sender]);

        _mint(msg.sender, 10000);
        faucetUseCount[msg.sender] = faucetUseCount[msg.sender] + 1;
        lockTime[msg.sender] = block.timestamp + 1 days;
    }

    function getUserLockTime() public view returns (uint256) {
        return lockTime[msg.sender];
    }

    function getUserFaucetCount() public view returns (uint16) {
        return faucetUseCount[msg.sender];
    }
}
