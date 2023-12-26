// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

library Errors {
    error LengthError();
    error AlreadyMint();
    error OnlyCallByFactory();
    error AlreadyExpired();
    error InvalidSignature();
    error InvalidETH();
    error InvalidChainId();
    error InvalidEVMAddress();
    error InvalidBTCAddress();
    error ExceedMaxSupply();
    error InvalidTicker();
}
