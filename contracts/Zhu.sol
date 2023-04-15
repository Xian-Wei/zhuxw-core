// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "hardhat/console.sol";

/* Errors */
error Zhu__LockTimeNotReached();
error Zhu__CallerNotGrantedPermission();

contract Zhu is ERC20, AccessControl {
    // Roles
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");

    // Faucet
    uint256 private faucetAmount;
    mapping(address => uint16) private faucetUseCount;
    mapping(address => uint256) private lockTime;

    constructor(
        uint256 initialSupply,
        uint256 _faucetAmount
    ) ERC20("Zhu", "ZHU") {
        _mint(msg.sender, initialSupply * (10 ** decimals()));
        faucetAmount = _faucetAmount;
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function grantMinterRole(address minter) public {
        if (!hasRole(DEFAULT_ADMIN_ROLE, msg.sender)) {
            revert Zhu__CallerNotGrantedPermission();
        }
        _setupRole(MINTER_ROLE, minter);
    }

    function faucet() public {
        if (block.timestamp < lockTime[msg.sender]) {
            revert Zhu__LockTimeNotReached();
        }

        _mint(msg.sender, faucetAmount * (10 ** 18));
        faucetUseCount[msg.sender] = faucetUseCount[msg.sender] + 1;
        lockTime[msg.sender] = block.timestamp + 5 minutes;
    }

    function _approve(address spender, uint256 amount) external returns (bool) {
        bool approved = approve(spender, amount * (10 ** decimals()));

        return approved;
    }

    function mintTokenTo(address to, uint256 amount) external {
        if (!hasRole(MINTER_ROLE, msg.sender)) {
            revert Zhu__CallerNotGrantedPermission();
        }
        _mint(to, amount);
    }

    function getFaucetAmount() public view returns (uint256) {
        return faucetAmount;
    }

    function setFaucetAmount(uint256 newAmount) public {
        if (!hasRole(DEFAULT_ADMIN_ROLE, msg.sender)) {
            revert Zhu__CallerNotGrantedPermission();
        }
        faucetAmount = newAmount;
    }

    function getLockTimeOf(address _address) public view returns (uint256) {
        return lockTime[_address];
    }

    function isFaucetLockedFor(address _address) public view returns (bool) {
        return block.timestamp < lockTime[_address];
    }

    function getFaucetCountOf(address _address) public view returns (uint16) {
        return faucetUseCount[_address];
    }
}
