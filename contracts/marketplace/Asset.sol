// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.11;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Asset is ERC721, Ownable {
    struct AssetData {
        string name;
        string image;
        uint8 deleted;
        uint8 status;
        uint256 price;
        string subtitle;
        string description;
        uint256 supply;
        uint256 inventory;
        address acceptedToken;
        string tags;
        string remarks;
    }

    mapping(uint256 => AssetData) public assets;
    uint256 public nextTokenId;

    constructor() ERC721("MyNFT", "NFT") {}

    event AssetMinted(address indexed owner, uint256 indexed tokenId);
    event AssetUpdated(uint256 indexed tokenId);
    event AssetDeleted(uint256 indexed tokenId);

    function mint(
        address to,
        string memory name,
        string memory image,
        uint256 price,
        string memory subtitle,
        string memory description,
        uint256 supply,
        address acceptedToken,
        string memory tags,
        string memory remarks
    ) external onlyOwner {
        uint256 tokenId = nextTokenId;
        _mint(to, tokenId);
        AssetData storage newAsset = assets[tokenId];
        newAsset.name = name;
        newAsset.image = image;
        newAsset.deleted = 0; // Not deleted
        newAsset.status = 0; // Pending
        newAsset.price = price;
        newAsset.subtitle = subtitle;
        newAsset.description = description;
        newAsset.supply = supply;
        newAsset.inventory = supply;
        newAsset.acceptedToken = acceptedToken;
        newAsset.tags = tags;
        newAsset.remarks = remarks;
        nextTokenId++;
        emit AssetMinted(to, tokenId);
    }

    function updateAsset(
        uint256 tokenId,
        string memory name,
        string memory image,
        uint8 deleted,
        uint8 status,
        uint256 price,
        string memory subtitle,
        string memory description,
        uint256 supply,
        uint256 inventory,
        address acceptedToken,
        string memory tags,
        string memory remarks
    ) external onlyOwner {
        require(_exists(tokenId), "Token does not exist");
        AssetData storage asset = assets[tokenId];
        asset.name = name;
        asset.image = image;
        asset.deleted = deleted;
        asset.status = status;
        asset.price = price;
        asset.subtitle = subtitle;
        asset.description = description;
        asset.supply = supply;
        asset.inventory = inventory;
        asset.acceptedToken = acceptedToken;
        asset.tags = tags;
        asset.remarks = remarks;
        emit AssetUpdated(tokenId);
    }

    function deleteAsset(uint256 tokenId) external onlyOwner {
        require(_exists(tokenId), "Token does not exist");
        AssetData storage existingAsset = assets[tokenId];
        existingAsset.deleted = 1;
        emit AssetDeleted(tokenId);
    }
}
