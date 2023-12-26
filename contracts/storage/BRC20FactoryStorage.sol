// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
import {DataTypes} from "../libraries/DataTypes.sol";
import {EnumerableSet} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

abstract contract BRC20FactoryStorage {
    uint256 public _fee;
    DataTypes.CreateBRC20Parameters public _parameters;

    mapping(bytes32 => bool) public _usedTxid;
    mapping(uint256 => bool) public _supportChain;
}
