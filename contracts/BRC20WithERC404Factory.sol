// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {BRC20WithERC404FactoryStorage} from "./storage/BRC20WithERC404FactoryStorage.sol";
import {DataTypes} from "./libraries/DataTypes.sol";
import {BRC20WithERC404} from "./BRC20WithERC404.sol";
import {Events} from "./libraries/Events.sol";
import {Errors} from "./libraries/Errors.sol";

contract BRC20WithERC404Factory is
    ReentrancyGuard,
    Ownable,
    BRC20WithERC404FactoryStorage
{
    uint256 internal immutable _chainId;

    struct Parameters {
        string name;
        string symbol;
        uint8 decimals;
        uint256 maxSupply;
    }

    constructor() Ownable(msg.sender) {
        uint256 chainId;
        assembly {
            chainId := chainid()
        }
        _chainId = chainId;
        _supportChain[type(uint256).max] = true;
        _fee = 0.03 ether;
    }

    function createBRC20WithERC404(
        string memory name,
        string memory symbol,
        uint8 decimals,
        uint256 maxERC20Supply,
        uint256 nftUnit
    ) external onlyOwner returns (address brc20) {
        if (_ticker[name] != address(0x0)) {
            revert Errors.TickerAlreadyExist();
        }
        _parameters = DataTypes.CreateBRC20WithERC404Parameters({
            name: name,
            symbol: symbol,
            decimals: decimals,
            maxERC20Supply: maxERC20Supply,
            nftUnit: nftUnit
        });
        brc20 = address(
            new BRC20WithERC404{
                salt: keccak256(abi.encode(name, symbol, decimals))
            }()
        );
        _ticker[name] = brc20;
        delete _parameters;
        emit Events.BRC20WithERC404Created(
            brc20,
            decimals,
            maxERC20Supply,
            nftUnit,
            name,
            symbol
        );
    }

    function mintBRC20(
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
        BRC20WithERC404(_ticker[ticker]).mintBRC20(to, amount);

        emit Events.BRC20Minted(to, amount, ticker, txid);
    }

    function burnBRC20(
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

        BRC20WithERC404(_ticker[ticker]).burnBRC20(msg.sender, amount);

        emit Events.BRC20Burned(
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
        BRC20WithERC404(_ticker[ticker]).setTokenURI(_tokenURI);
    }

    function setDataURI(
        string memory ticker,
        string memory _dataURI
    ) public onlyOwner {
        if (_ticker[ticker] == address(0x0)) {
            revert Errors.InvalidTicker();
        }
        BRC20WithERC404(_ticker[ticker]).setTokenURI(_dataURI);
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
        BRC20WithERC404(_ticker[ticker]).setWhitelist(target, state);
    }
}
