// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

library Events {
    event BRC20Created(
        address indexed brc20Addr,
        uint256 decimals,
        uint256 maxSupply,
        string name,
        string symbol
    );

    event BRC20Minted(
        address indexed to,
        uint256 indexed amount,
        string ticker,
        string txId
    );

    event BRC20Burned(
        address indexed burner,
        uint256 amount,
        uint256 fee,
        uint256 chainid,
        string ticker,
        string receiver
    );

    event FeeChanged(uint256 oldFee, uint256 newFee);

    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );
    event Transfer(address indexed from, address indexed to, uint256 value);
}
