// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
import {DataTypes} from "../libraries/DataTypes.sol";
import {EnumerableSet} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

abstract contract BRC20FactoryStorage {
    bytes32 internal constant DOMAIN_NAME = keccak256("XRGB");
    bytes32 public constant DOMAIN_TYPEHASH =
        keccak256(
            "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
        );
    bytes32 public constant MINT_TYPEHASH =
        keccak256(
            abi.encodePacked(
                "Mint(address token,address to,uint256 amount,string txid)"
            )
        );
    bytes32 public DOMAIN_SEPARATOR;
    uint256 internal _fee;
    DataTypes.CreateBRC20Parameters public _parameters;

    EnumerableSet.AddressSet internal _signers;
    mapping(bytes32 => bool) public _usedTxid;
    mapping(uint256 => bool) public _supportChain;
}
