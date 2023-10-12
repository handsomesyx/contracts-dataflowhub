// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.11;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Asset is ERC721 {
    struct AssetData {
        string name; //名称
        string image; // 图片
        uint8 deleted; // 是否删除  0是未删除；1是已删除
        uint8 status; // 发布状态 0是直接出售；1是拍卖出售
        uint256 price; // 价格
        string subtitle; // 副标题
        string description; // 描述
        uint256 supply; // 供应量
        uint256 inventory; // 库存
        address acceptedToken; // 接受代币
        string tags; // 标签 如能源，金融，医疗
        string remarks; // 备注
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
    ) external {
        uint256 tokenId = nextTokenId;
        _mint(to, tokenId);
        AssetData storage newAsset = assets[tokenId];
        newAsset.name = name;
        newAsset.image = image;
        newAsset.deleted = 0;
        newAsset.status = 0;
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
    ) external {
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

    function deleteAsset(uint256 tokenId) external {
        require(_exists(tokenId), "Token does not exist");
        AssetData storage existingAsset = assets[tokenId];
        existingAsset.deleted = 1;
        emit AssetDeleted(tokenId);
    }
}
