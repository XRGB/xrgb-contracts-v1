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

    function createBRC20(
        string memory name,
        string memory symbol,
        uint8 decimals
    ) external;

    function mint(
        address token,
        address to,
        uint256 amount,
        string memory txid,
        uint8[] memory v,
        bytes32[] memory r,
        bytes32[] memory s
    ) external;

    function burn(
        address token,
        uint256 amount,
        uint8 chainid,
        string memory receiver
    ) external;
}
