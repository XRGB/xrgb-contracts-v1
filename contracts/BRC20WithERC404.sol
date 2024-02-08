// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import {ERC404} from "./interfaces/ERC404.sol";
import {IBRC20WithERC404Factory} from "./interfaces/IBRC20WithERC404Factory.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {Errors} from "./libraries/Errors.sol";
import {Events} from "./libraries/Events.sol";

contract BRC20WithERC404 is ERC404 {
    string public dataURI;
    string public baseTokenURI;
    uint256 maxERC20Supply;
    address public immutable factory;

    modifier onlyFactory() {
        if (msg.sender != factory) {
            revert Errors.OnlyCallByFactory();
        }
        _;
    }

    constructor() ERC404(msg.sender) {
        (
            name,
            symbol,
            decimals,
            maxERC20Supply,
            nftUnit
        ) = IBRC20WithERC404Factory(msg.sender)._parameters();

        factory = msg.sender;
    }

    /**************Only Call By Factory Function **********/

    function setTokenURI(string memory _tokenURI) public onlyFactory {
        baseTokenURI = _tokenURI;
    }

    function setDataURI(string memory _dataURI) public onlyFactory {
        dataURI = _dataURI;
    }

    function tokenURI(uint256 id) public view override returns (string memory) {
        return string.concat(baseTokenURI, Strings.toString(id));
    }

    function mintBRC20(address to, uint256 amount) external onlyFactory {
        _mintBRC20(to, amount);
    }

    function burnBRC20(address from, uint256 amount) external onlyFactory {
        _burnBRC20(from, amount);
    }

    /**************Internal Function **********/

    function _mintBRC20(address to, uint256 amount) internal {
        totalSupply += amount;
        if (totalSupply > maxERC20Supply) {
            revert Errors.ExceedMaxSupply();
        }

        unchecked {
            balanceOf[to] += amount;
        }

        uint256 unit = _getUnit();
        uint256 tokens_to_mint = (amount / unit);
        for (uint256 i = 0; i < tokens_to_mint; i++) {
            _mint(to);
        }

        emit Events.ERC20Transfer(address(0), to, amount);
    }

    function _burnBRC20(address from, uint256 amount) internal {
        balanceOf[from] -= amount;

        unchecked {
            totalSupply -= amount;
        }

        uint256 unit = _getUnit();
        uint256 tokens_to_mint = (amount / unit);
        for (uint256 i = 0; i < tokens_to_mint; i++) {
            _burn(from);
        }

        emit Events.ERC20Transfer(from, address(0), amount);
    }
}
