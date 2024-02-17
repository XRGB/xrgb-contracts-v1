// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import {ERC404} from "./ERC404.sol";
import {IBRC404Factory} from "./interfaces/IBRC404Factory.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {Errors} from "./libraries/Errors.sol";

contract BRC404 is ERC404 {
    string public baseTokenURI;
    uint256 maxSupply;
    address public immutable factory;

    modifier onlyFactory() {
        if (msg.sender != factory) {
            revert Errors.OnlyCallByFactory();
        }
        _;
    }

    constructor() {
        (name, symbol, decimals, maxSupply, units) = IBRC404Factory(msg.sender)
            ._parameters();

        factory = msg.sender;
    }

    /**************Only Call By Factory Function **********/

    function setTokenURI(string memory _tokenURI) public onlyFactory {
        baseTokenURI = _tokenURI;
    }

    function tokenURI(uint256 id) public view override returns (string memory) {
        return string.concat(baseTokenURI, Strings.toString(id));
    }

    function mintBRC404(address to, uint256 amount) external onlyFactory {
        _mintBRC404(to, amount);
    }

    function burnBRC404(address from, uint256 amount) external onlyFactory {
        _burnBRC404(from, amount);
    }

    function setWhitelist(address target_, bool state_) external onlyFactory {
        _setWhitelist(target_, state_);
    }

    /**************Internal Function **********/

    function _mintBRC404(address to, uint256 amount) internal {
        if (totalSupply + amount > maxSupply) {
            revert Errors.ExceedMaxSupply();
        }
        _mintERC20WithERC721(to, amount);
        emit ERC20Transfer(address(0), to, amount);
    }

    function _burnBRC404(address from, uint256 amount) internal {
        _burnERC20WithERC721(from, amount);
        emit ERC20Transfer(from, address(0), amount);
    }
}
