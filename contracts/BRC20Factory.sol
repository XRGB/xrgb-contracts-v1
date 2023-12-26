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
        uint256 supply;
    }

    constructor() {
        uint256 chainId;
        assembly {
            chainId := chainid()
        }
        _chainId = chainId;
        _supportChain[chainId] = true;
        _fee = 0.001 ether;
    }

    function createBRC20(
        string memory name,
        string memory symbol,
        uint256 decimals,
        uint256 supply
    ) external onlyOwner returns (address brc20) {
        _parameters = DataTypes.CreateBRC20Parameters({
            name: name,
            symbol: symbol,
            decimals: decimals,
            supply: supply
        });
        brc20 = address(
            new BRC20{salt: keccak256(abi.encode(name, symbol, decimals))}()
        );
        delete _parameters;
        emit Events.BRC20Created(brc20, name, symbol, decimals, supply);
    }

    function mint(
        address token,
        address to,
        uint256 amount,
        string memory txid
    ) external onlyOwner nonReentrant {
        bytes32 txHash = keccak256(abi.encode(txid));
        if (_usedTxid[txHash]) {
            revert Errors.AlreadyMint();
        }
        _usedTxid[txHash] = true;
        BRC20(token).mint(to, amount);

        emit Events.BRC20Minted(token, to, amount, txid);
    }

    function burn(
        address token,
        uint256 amount,
        uint256 chainId,
        string calldata receiver
    ) external payable nonReentrant {
        if (msg.value < _fee) {
            revert Errors.InvalidETH();
        }
        if (!_supportChain[chainId] || _chainId == chainId) {
            revert Errors.InvalidChainId();
        }
        if (chainId == type(uint256).max) {
            //testnet tb1p, mainnet bcp1
            if (!startWith(receiver, "tb1p")) {
                revert Errors.InvalidBTCAddress();
            }
        } else {
            bytes calldata addr = bytes(receiver);
            if (addr.length != 20) {
                revert Errors.InvalidEVMAddress();
            }
        }

        BRC20(token).transferFrom(msg.sender, address(this), amount);
        BRC20(token).burn(amount);

        emit Events.BRC20Burned(
            token,
            msg.sender,
            amount,
            _fee,
            chainId,
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

    function setFee(uint256 newfee) external onlyOwner {
        emit Events.FeeChanged(_fee, newfee);
        _fee = newfee;
    }

    function startWith(
        string memory str,
        string memory sub
    ) internal pure returns (bool found) {
        bytes memory strBytes = bytes(str);
        bytes memory subBytes = bytes(sub);

        found = true;
        for (uint i = 0; i <= subBytes.length; i++) {
            if (strBytes[i] != subBytes[i]) {
                found = false;
                break;
            }
        }
        return found;
    }
}
