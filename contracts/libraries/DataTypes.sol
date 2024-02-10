// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

/**
 * @title DataTypes
 * @author Tomo Protocol
 *
 * @notice A standard library of data types used throughout the XRGB.
 */
library DataTypes {
    struct CreateBRC404Parameters {
        string name;
        string symbol;
        uint256 decimals;
        uint256 maxSupply;
        uint256 nftUnit;
    }
}
