// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Zhu is ERC20 {
    constructor(uint256 initialSupply) ERC20("Zhu", "ZHU") {
        _mint(msg.sender, initialSupply * (10**decimals()));
    }
}
