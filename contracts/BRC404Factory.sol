// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {BRC404FactoryStorage} from "./storage/BRC404FactoryStorage.sol";
import {DataTypes} from "./libraries/DataTypes.sol";
import {BRC404} from "./BRC404.sol";
import {Events} from "./libraries/Events.sol";
import {Errors} from "./libraries/Errors.sol";

contract BRC404Factory is ReentrancyGuard, Ownable, BRC404FactoryStorage {
    uint256 internal immutable _chainId;

    constructor(address owner) Ownable(owner) {
        uint256 chainId;
        assembly {
            chainId := chainid()
        }
        _chainId = chainId;
        _supportChain[type(uint256).max] = true;
        _fee = 0.02 ether;
    }

    function createBRC404(
        string memory name,
        string memory symbol,
        uint8 decimals,
        uint256 maxSupply,
        uint256 nftUnit
    ) external onlyOwner returns (address brc404) {
        if (_ticker[name] != address(0x0)) {
            revert Errors.TickerAlreadyExist();
        }
        if (nftUnit > maxSupply || maxSupply % nftUnit != 0) {
            revert Errors.InvalidParams();
        }
        _parameters = DataTypes.CreateBRC404Parameters({
            name: name,
            symbol: symbol,
            decimals: decimals,
            maxSupply: maxSupply,
            nftUnit: nftUnit
        });
        brc404 = address(
            new BRC404{salt: keccak256(abi.encode(name, symbol, decimals))}()
        );
        _ticker[name] = brc404;
        delete _parameters;
        emit Events.BRC404Created(
            brc404,
            decimals,
            maxSupply,
            nftUnit,
            name,
            symbol
        );
    }

    function mintBRC404(
        string memory ticker,
        address to,
        uint256 amount,
        string memory txid
    ) external onlyOwner nonReentrant {
        if (_ticker[ticker] == address(0x0)) {
            revert Errors.InvalidTicker();
        }
        bytes32 txHash = keccak256(abi.encode(txid));
        if (_usedTxid[txHash]) {
            revert Errors.AlreadyMint();
        }
        _usedTxid[txHash] = true;
        BRC404(_ticker[ticker]).mintBRC404(to, amount);

        emit Events.BRC404Minted(to, amount, ticker, txid);
    }

    function burnBRC404(
        string memory ticker,
        uint256 amount,
        uint256 chainId,
        string calldata receiver
    ) external payable nonReentrant {
        if (_ticker[ticker] == address(0x0)) {
            revert Errors.InvalidTicker();
        }
        if (msg.value < _fee) {
            revert Errors.InvalidFee();
        }
        if (!_supportChain[chainId] || _chainId == chainId) {
            revert Errors.InvalidChainId();
        }

        BRC404(_ticker[ticker]).burnBRC404(msg.sender, amount);

        emit Events.BRC404Burned(
            msg.sender,
            amount,
            _fee,
            chainId,
            ticker,
            receiver
        );
    }

    function setTokenURI(
        string memory ticker,
        string memory _tokenURI
    ) public onlyOwner {
        if (_ticker[ticker] == address(0x0)) {
            revert Errors.InvalidTicker();
        }
        BRC404(_ticker[ticker]).setTokenURI(_tokenURI);
    }

    function withdraw(address to) external onlyOwner {
        uint256 balance = address(this).balance;
        payable(to).transfer(balance);
    }

    function setSupportChain(uint256 chainId, bool bSet) external onlyOwner {
        _supportChain[chainId] = bSet;
    }

    function setFee(uint256 newfee) external onlyOwner {
        emit Events.FeeChanged(_fee, newfee);
        _fee = newfee;
    }

    function setWhitelist(
        string memory ticker,
        address target,
        bool state
    ) public onlyOwner {
        if (_ticker[ticker] == address(0x0)) {
            revert Errors.InvalidTicker();
        }
        BRC404(_ticker[ticker]).setWhitelist(target, state);
    }
}
