// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {BRC20FactoryStorage} from "./storage/BRC20FactoryStorage.sol";
import {DataTypes} from "./libraries/DataTypes.sol";
import {BRC20} from "./BRC20.sol";
import {Events} from "./libraries/Events.sol";
import {Errors} from "./libraries/Errors.sol";

contract BRC20Factory is BRC20FactoryStorage, ReentrancyGuard, Ownable {
    uint256 internal immutable _chainId;

    struct Parameters {
        string name;
        string symbol;
        uint256 decimals;
        uint256 maxSupply;
    }

    constructor() {
        uint256 chainId;
        assembly {
            chainId := chainid()
        }
        _chainId = chainId;
        _supportChain[chainId] = true;
        _supportChain[type(uint256).max] = true;
        _fee = 0.001 ether;
    }

    function createBRC20(
        string memory name,
        string memory symbol,
        uint256 decimals,
        uint256 maxSupply
    ) external onlyOwner returns (address brc20) {
        _parameters = DataTypes.CreateBRC20Parameters({
            name: name,
            symbol: symbol,
            decimals: decimals,
            maxSupply: maxSupply
        });
        brc20 = address(
            new BRC20{salt: keccak256(abi.encode(name, symbol, decimals))}()
        );
        _ticker[name] = brc20;
        delete _parameters;
        emit Events.BRC20Created(brc20, decimals, maxSupply, name, symbol);
    }

    function mint(
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
        BRC20(_ticker[ticker]).mint(to, amount);

        emit Events.BRC20Minted(to, amount, ticker, txid);
    }

    function burn(
        string memory ticker,
        uint256 amount,
        uint256 chainId,
        string calldata receiver
    ) external payable nonReentrant {
        if (_ticker[ticker] == address(0x0)) {
            revert Errors.InvalidTicker();
        }
        if (msg.value < _fee) {
            revert Errors.InvalidETH();
        }
        if (!_supportChain[chainId] || _chainId == chainId) {
            revert Errors.InvalidChainId();
        }

        BRC20(_ticker[ticker]).transferFrom(msg.sender, address(this), amount);
        BRC20(_ticker[ticker]).burn(amount);

        emit Events.BRC20Burned(
            msg.sender,
            amount,
            _fee,
            chainId,
            ticker,
            receiver
        );
    }

    function withdraw(address to) external onlyOwner {
        uint256 balance = address(this).balance;
        payable(to).transfer(balance);
    }

    function setSupportChain(uint256 chainId) external onlyOwner {
        _supportChain[chainId] = true;
    }

    function disableSupportChain(uint256 chainId) external onlyOwner {
        _supportChain[chainId] = false;
    }

    function setFee(uint256 newfee) external onlyOwner {
        emit Events.FeeChanged(_fee, newfee);
        _fee = newfee;
    }
}
