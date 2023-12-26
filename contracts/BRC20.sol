// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {BRC20Storage} from "./storage/BRC20Storage.sol";
import {IBRC20Factory} from "./interfaces/IBRC20Factory.sol";
import {Events} from "./libraries/Events.sol";
import {Errors} from "./libraries/Errors.sol";

contract BRC20 is BRC20Storage {
    uint256 public immutable decimals;
    uint256 public maxSupply;
    address public immutable factory;

    constructor() {
        (name, symbol, decimals, maxSupply) = IBRC20Factory(msg.sender)
            ._parameters();

        factory = msg.sender;

        uint256 chainId;
        assembly {
            chainId := chainid()
        }
        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                DOMAIN_TYPEHASH,
                keccak256(bytes(name)),
                keccak256(bytes("1")),
                chainId,
                address(this)
            )
        );
    }

    modifier onlyFactory() {
        if (msg.sender != factory) {
            revert Errors.OnlyCallByFactory();
        }
        _;
    }

    function mint(address to, uint256 amount) external onlyFactory {
        _mint(to, amount);
    }

    function burn(uint256 amount) external onlyFactory {
        _burn(msg.sender, amount);
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Events.Approval(msg.sender, spender, amount);
        return true;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        balanceOf[msg.sender] -= amount;

        unchecked {
            balanceOf[to] += amount;
        }

        emit Events.Transfer(msg.sender, to, amount);
        return true;
    }

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool) {
        uint256 allowed = allowance[from][msg.sender];

        if (allowed != type(uint256).max)
            allowance[from][msg.sender] = allowed - amount;

        balanceOf[from] -= amount;

        unchecked {
            balanceOf[to] += amount;
        }

        emit Events.Transfer(from, to, amount);
        return true;
    }

    function permit(
        address owner,
        address spender,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external {
        if (deadline <= block.timestamp) {
            revert Errors.AlreadyExpired();
        }
        unchecked {
            bytes32 digest = keccak256(
                abi.encodePacked(
                    "\x19\x01",
                    DOMAIN_SEPARATOR,
                    keccak256(
                        abi.encode(
                            PERMIT_TYPEHASH,
                            owner,
                            spender,
                            value,
                            nonces[owner]++,
                            deadline
                        )
                    )
                )
            );
            address recoveredAddress = ecrecover(digest, v, r, s);
            if (recoveredAddress == address(0x0) || recoveredAddress != owner) {
                revert Errors.InvalidSignature();
            }
            allowance[recoveredAddress][spender] = value;
        }
        emit Events.Approval(owner, spender, value);
    }

    function _mint(address to, uint256 amount) internal {
        totalSupply += amount;
        if (totalSupply > maxSupply) {
            revert Errors.ExceedMaxSupply();
        }

        unchecked {
            balanceOf[to] += amount;
        }

        emit Events.Transfer(address(0), to, amount);
    }

    function _burn(address from, uint256 amount) internal {
        balanceOf[from] -= amount;

        unchecked {
            totalSupply -= amount;
        }

        emit Events.Transfer(from, address(0), amount);
    }
}
