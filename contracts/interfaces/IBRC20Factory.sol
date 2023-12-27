// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

interface IBRC20Factory {
    function _parameters()
        external
        view
        returns (
            string memory name,
            string memory symbol,
            uint256 decimals,
            uint256 supply
        );
}
