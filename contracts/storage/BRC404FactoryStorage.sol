// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
import {DataTypes} from "../libraries/DataTypes.sol";

abstract contract BRC404FactoryStorage {
    uint256 public _fee;
    DataTypes.CreateBRC404Parameters public _parameters;

    mapping(bytes32 => bool) public _usedTxid;
    mapping(uint256 => bool) public _supportChain;
    mapping(string => address) public _ticker;
}
