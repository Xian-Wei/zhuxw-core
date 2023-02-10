// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./Zhu.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "hardhat/console.sol";

/* Errors */
error ZhuExchange__NotEnoughBalance();

interface ZhuInterface is IERC20 {
    function faucet() external;

    function getLockTimeOf(address _address) external view returns (uint256);

    function getFaucetCountOf(address _address) external view returns (uint16);

    function approve(address spender, uint256 amount) external returns (bool);

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool);
}

contract ZhuExchange {
    enum PositionType {
        SHORT,
        LONG
    }

    struct Position {
        PositionType positionType;
        uint256 amount;
        uint16 weightSnapshot;
    }

    ZhuInterface i_zhuContract;
    address payable[] private s_users;
    mapping(address => Position[]) public s_positions;

    constructor(address zhuContractAddress) {
        i_zhuContract = ZhuInterface(zhuContractAddress);
    }

    function short(uint256 amount, uint16 weight) public {
        if (
            i_zhuContract.allowance(msg.sender, address(this)) <
            amount * (10**18)
        ) {
            revert ZhuExchange__NotEnoughBalance();
        }
        i_zhuContract.transferFrom(
            msg.sender,
            address(this),
            amount * (10**18)
        );
        s_users.push(payable(msg.sender));
        s_positions[msg.sender].push(
            Position({
                positionType: PositionType.SHORT,
                amount: amount,
                weightSnapshot: weight
            })
        );
    }

    function long(uint256 amount, uint16 weight) public {
        if (
            i_zhuContract.allowance(msg.sender, address(this)) <
            amount * (10**18)
        ) {
            revert ZhuExchange__NotEnoughBalance();
        }
        i_zhuContract.transferFrom(
            msg.sender,
            address(this),
            amount * (10**18)
        );
        s_users.push(payable(msg.sender));
        s_positions[msg.sender].push(
            Position({
                positionType: PositionType.LONG,
                amount: amount,
                weightSnapshot: weight
            })
        );
    }

    function executeTrades(uint256 finalWeight) public {}

    function getUsers() public view returns (address payable[] memory) {
        return s_users;
    }

    function getPositions() public view returns (Position[] memory) {
        return s_positions[msg.sender];
    }

    function getPositionsOf(address _address)
        public
        view
        returns (Position[] memory)
    {
        return s_positions[_address];
    }
}
