// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

/**
 * @title DataTypes
 * @author Tomo Protocol
 *
 * @notice A standard library of data types used throughout the TomoV2.
 */
library DataTypes {
    struct CreateBRC20Parameters {
        string name;
        string symbol;
        uint256 decimals;
        uint256 maxSupply;
    }
}
