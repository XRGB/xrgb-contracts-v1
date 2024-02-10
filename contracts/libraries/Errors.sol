// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

library Errors {
    error LengthError();
    error AlreadyMint();
    error OnlyCallByFactory();
    error AlreadyExpired();
    error InvalidSignature();
    error InvalidFee();
    error InvalidChainId();
    error InvalidEVMAddress();
    error InvalidBTCAddress();
    error ExceedMaxSupply();
    error InvalidTicker();
    error TickerAlreadyExist();
    error Unauthorized();

    error NotFound();
    error AlreadyExists();
    error InvalidRecipient();
    error InvalidSender();
    error UnsafeRecipient();
}
