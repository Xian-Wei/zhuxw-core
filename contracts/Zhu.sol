// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/* Errors */
error Zhu__LockTimeNotReached();

contract Zhu is ERC20 {
    mapping(address => uint16) public faucetUseCount;
    mapping(address => uint256) public lockTime;

    constructor(uint256 initialSupply) ERC20("Zhu", "ZHU") {
        _mint(msg.sender, initialSupply * (10**decimals()));
    }

    function faucet() public {
        if (block.timestamp > lockTime[msg.sender]) {
            revert Zhu__LockTimeNotReached();
        }

        _mint(msg.sender, 10000);
        faucetUseCount[msg.sender] = faucetUseCount[msg.sender] + 1;
        lockTime[msg.sender] = block.timestamp + 5 minutes;
    }

    function getLockTimeOf(address _address) public view returns (uint256) {
        return lockTime[_address];
    }

    function getFaucetCountOf(address _address) public view returns (uint16) {
        return faucetUseCount[_address];
    }
}
