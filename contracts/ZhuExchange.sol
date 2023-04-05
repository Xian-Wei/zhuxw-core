// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./Zhu.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/* Errors */
error ZhuExchange__NotEnoughAllowance();

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

    function mintTokenTo(address to, uint256 amount) external;
}

contract ZhuExchange {
    /* Type declarations */
    enum PositionType {
        SHORT,
        LONG
    }

    struct Position {
        uint32 id;
        PositionType positionType;
        uint256 amount;
        uint16 weightSnapshot;
    }

    /* State variables */
    ZhuInterface i_zhuContract;
    address payable[] private s_users;
    mapping(address => Position[]) public s_positions;

    /* Events */
    event PositionAdded();
    event TradesExecuted();

    constructor(address zhuContractAddress) {
        i_zhuContract = ZhuInterface(zhuContractAddress);
    }

    function short(uint256 amount, uint16 weight) public {
        if (
            i_zhuContract.allowance(msg.sender, address(this)) <
            amount * (10 ** 18)
        ) {
            revert ZhuExchange__NotEnoughAllowance();
        }
        i_zhuContract.transferFrom(
            msg.sender,
            address(this),
            amount * (10 ** 18)
        );
        s_users.push(payable(msg.sender));
        s_positions[msg.sender].push(
            Position({
                id: uint32(s_positions[msg.sender].length),
                positionType: PositionType.SHORT,
                amount: amount,
                weightSnapshot: weight
            })
        );
        emit PositionAdded();
    }

    function long(uint256 amount, uint16 weight) public {
        if (
            i_zhuContract.allowance(msg.sender, address(this)) <
            amount * (10 ** 18)
        ) {
            revert ZhuExchange__NotEnoughAllowance();
        }
        i_zhuContract.transferFrom(
            msg.sender,
            address(this),
            amount * (10 ** 18)
        );
        s_users.push(payable(msg.sender));
        s_positions[msg.sender].push(
            Position({
                id: uint32(s_positions[msg.sender].length),
                positionType: PositionType.LONG,
                amount: amount,
                weightSnapshot: weight
            })
        );
        emit PositionAdded();
    }

    function closeTrade(uint256 finalWeight, uint256 id) public {
        int256 amount = int256(s_positions[msg.sender][id].amount);
        int256 weightSnapshot = int16(
            s_positions[msg.sender][id].weightSnapshot
        );
        int256 percentageDifference = int256(
            ((int256(finalWeight) - weightSnapshot) * 10000) / weightSnapshot
        );
        int256 gainLoss = ((amount) * percentageDifference) / 500;

        if (s_positions[msg.sender][id].positionType == PositionType.SHORT) {
            if (gainLoss < amount) {
                i_zhuContract.mintTokenTo(
                    msg.sender,
                    uint256(amount - gainLoss) * (10 ** 18)
                );
            }
        } else if (
            s_positions[msg.sender][id].positionType == PositionType.LONG
        ) {
            if (-gainLoss < amount) {
                i_zhuContract.mintTokenTo(
                    msg.sender,
                    uint256(amount + gainLoss) * (10 ** 18)
                );
            }
        }
        delete s_positions[msg.sender][id];
        emit TradesExecuted();
    }

    function executeTrades(uint256 finalWeight) public {
        for (uint256 i = 0; i < s_users.length; i++) {
            for (uint256 j = 0; j < s_positions[s_users[i]].length; j++) {
                int256 amount = int256(s_positions[s_users[i]][j].amount);
                int256 weightSnapshot = int16(
                    s_positions[s_users[i]][j].weightSnapshot
                );
                int256 percentageDifference = int256(
                    ((int256(finalWeight) - weightSnapshot) * 10000) /
                        weightSnapshot
                );
                int256 gainLoss = ((amount) * percentageDifference) / 500;

                if (
                    s_positions[s_users[i]][j].positionType ==
                    PositionType.SHORT
                ) {
                    if (gainLoss < amount) {
                        i_zhuContract.mintTokenTo(
                            s_users[i],
                            uint256(amount - gainLoss) * (10 ** 18)
                        );
                    }
                } else if (
                    s_positions[s_users[i]][j].positionType == PositionType.LONG
                ) {
                    if (-gainLoss < amount) {
                        i_zhuContract.mintTokenTo(
                            s_users[i],
                            uint256(amount + gainLoss) * (10 ** 18)
                        );
                    }
                }
            }
            delete s_positions[s_users[i]];
        }
        delete s_users;
        emit TradesExecuted();
    }

    function getUsers() public view returns (address payable[] memory) {
        return s_users;
    }

    function getPositions() public view returns (Position[] memory) {
        return s_positions[msg.sender];
    }

    function getPositionsOf(
        address _address
    ) public view returns (Position[] memory) {
        return s_positions[_address];
    }
}
