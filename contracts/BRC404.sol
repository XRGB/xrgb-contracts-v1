// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import {ERC404} from "./interfaces/ERC404.sol";
import {IBRC404Factory} from "./interfaces/IBRC404Factory.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {Errors} from "./libraries/Errors.sol";
import {Events} from "./libraries/Events.sol";

contract BRC404 is ERC404 {
    string public dataURI;
    string public baseTokenURI;
    uint256 maxSupply;
    address public immutable factory;

    modifier onlyFactory() {
        if (msg.sender != factory) {
            revert Errors.OnlyCallByFactory();
        }
        _;
    }

    constructor() ERC404(msg.sender) {
        (name, symbol, decimals, maxSupply, nftUnit) = IBRC404Factory(
            msg.sender
        )._parameters();

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

    function mintBRC404(address to, uint256 amount) external onlyFactory {
        _mintBRC404(to, amount);
    }

    function burnBRC404(address from, uint256 amount) external onlyFactory {
        _burnBRC404(from, amount);
    }

    /**************Internal Function **********/

    function _mintBRC404(address to, uint256 amount) internal {
        totalSupply += amount;
        if (totalSupply > maxSupply) {
            revert Errors.ExceedMaxSupply();
        }

        uint256 unit = _getUnit();
        uint256 balanceBeforeReceiver = balanceOf[to];
        unchecked {
            balanceOf[to] += amount;
        }
        uint256 tokens_to_mint = (balanceOf[to] / unit) -
            (balanceBeforeReceiver / unit);

        for (uint256 i = 0; i < tokens_to_mint; i++) {
            _mint(to);
        }

        emit Events.ERC20Transfer(address(0), to, amount);
    }

    function _burnBRC404(address from, uint256 amount) internal {
        uint256 unit = _getUnit();
        uint256 balanceBeforeSender = balanceOf[from];
        balanceOf[from] -= amount;
        unchecked {
            totalSupply -= amount;
        }
        uint256 tokens_to_burn = (balanceBeforeSender / unit) -
            (balanceOf[from] / unit);

        for (uint256 i = 0; i < tokens_to_burn; i++) {
            _burn(from);
        }

        emit Events.ERC20Transfer(from, address(0), amount);
    }
}
