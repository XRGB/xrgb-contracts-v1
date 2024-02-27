// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {IERC404} from "./interfaces/IERC404.sol";

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {ERC721Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract XRGBProxy is Initializable, ERC721Upgradeable, OwnableUpgradeable {
    using Strings for uint256;

    address erc404Address;
    string public baseTokenURI;
    string public contractURI;

    mapping(uint256 => bool) public enableNft;

    function initialize(
        string memory name,
        string memory symbol,
        string memory baseTokenUri,
        string memory contractUri,
        address initialOwner,
        address erc404Contract
    ) public initializer {
        __ERC721_init(name, symbol);
        __Ownable_init(initialOwner);
        erc404Address = erc404Contract;
        baseTokenURI = baseTokenUri;
        contractURI = contractUri;
    }

    function setContractURI(
        string calldata newContractUri
    ) public onlyOwner returns (bool) {
        contractURI = newContractUri;
        return true;
    }

    function setBaseURI(
        string memory baseUri
    ) public virtual onlyOwner returns (bool) {
        baseTokenURI = baseUri;
        return true;
    }

    function setErc404Address(
        address newAddress
    ) public virtual onlyOwner returns (bool) {
        require(newAddress != address(0x0), "Zero Address");
        erc404Address = newAddress;
        return true;
    }

    function balanceOf(address owner) public view override returns (uint256) {
        return IERC404(erc404Address).erc721BalanceOf(owner);
    }

    function ownerOf(uint256 tokenId) public view override returns (address) {
        return IERC721(erc404Address).ownerOf(tokenId);
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) public virtual override {
        IERC721(erc404Address).safeTransferFrom(from, to, tokenId, data);
        emit Transfer(from, to, tokenId);
    }

    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public virtual override {
        IERC721(erc404Address).transferFrom(from, to, tokenId);
        emit Transfer(from, to, tokenId);
    }

    function approve(address to, uint256 tokenId) public virtual override {
        IERC721(erc404Address).approve(to, tokenId);
        emit Approval(msg.sender, to, tokenId);
    }

    /**
     * @dev See {IERC721-getApproved}.
     */
    function getApproved(
        uint256 tokenId
    ) public view virtual override returns (address) {
        return IERC721(erc404Address).getApproved(tokenId);
    }

    function enableNFT(uint256[] calldata nftIds) public virtual {
        require(nftIds.length > 0, "Invalid nft length");
        for (uint256 i = 0; i < nftIds.length; i++) {
            if (!enableNft[nftIds[i]]) {
                address owner = IERC721(erc404Address).ownerOf(nftIds[i]);
                if (owner != address(0)) {
                    enableNft[nftIds[i]] = true;
                    emit Transfer(address(0), owner, nftIds[i]);
                }
            }
        }
    }

    /**
     * @dev See {IERC721-setApprovalForAll}.
     */
    function setApprovalForAll(
        address operator,
        bool approved
    ) public virtual override {
        emit ApprovalForAll(msg.sender, operator, approved);
    }

    /**
     * @dev See {IERC721-isApprovedForAll}.
     */
    function isApprovedForAll(
        address owner,
        address operator
    ) public view virtual override returns (bool) {
        return IERC404(erc404Address).isApprovedForAll(owner, operator);
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseTokenURI;
    }

    function tokenURI(
        uint256 tokenId
    ) public view virtual override returns (string memory) {
        string memory baseURI = _baseURI();
        return
            bytes(baseURI).length > 0
                ? string.concat(baseURI, tokenId.toString())
                : "";
    }
}
