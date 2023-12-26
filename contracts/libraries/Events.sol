// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

library Events {
    event BRC20Created(
        address indexed brc20Addr,
        string indexed name,
        string indexed symbol,
        uint8 decimals
    );

    event BRC20Minted(
        address indexed brc20Addr,
        address indexed to,
        uint256 amount,
        string btcTxId
    );

    event BRC20Burned(
        address indexed brc20Addr,
        address indexed burner,
        uint256 amount,
        uint256 fee,
        uint256 chainid,
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
