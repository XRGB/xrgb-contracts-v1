// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

library Events {
    event BRC404Created(
        address indexed addr,
        uint256 decimals,
        uint256 maxSupply,
        uint256 nftUnit,
        string name,
        string symbol
    );

    event BRC404Minted(
        address indexed to,
        uint256 indexed amount,
        string ticker,
        string txId
    );

    event BRC404Burned(
        address indexed burner,
        uint256 amount,
        uint256 fee,
        uint256 chainid,
        string ticker,
        string receiver
    );

    event FeeChanged(uint256 oldFee, uint256 newFee);

    // Events
    event ERC20Transfer(
        address indexed from,
        address indexed to,
        uint256 amount
    );
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 amount
    );
    event Transfer(
        address indexed from,
        address indexed to,
        uint256 indexed id
    );
    event ERC721Approval(
        address indexed owner,
        address indexed spender,
        uint256 indexed id
    );
    event ApprovalForAll(
        address indexed owner,
        address indexed operator,
        bool approved
    );
}
