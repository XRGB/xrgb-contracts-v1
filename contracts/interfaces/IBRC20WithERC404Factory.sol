// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

interface IBRC20WithERC404Factory {
    function _parameters()
        external
        view
        returns (
            string memory name,
            string memory symbol,
            uint8 decimals,
            uint256 maxERC20Supply,
            uint256 nftUnit
        );
}
