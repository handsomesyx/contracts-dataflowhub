const { expect } = require("chai");
const { ethers } = require("hardhat");
const fs = require('fs');
const path = require("path");

describe("Asset Contract", function () {
  let assetContract;
  let owner;
  let contractData; 
  let tokenId;
  const AssetData = {
    name: "Test Asset", // 名称
    image: "test.jpg",  // 图片
    price: ethers.utils.parseEther("1"),  // 价格
    subtitle: "Test Subtitle",  // 副标题
    description: "Test Description",  //描述
    supply: 10, //供应量
    acceptedToken: ethers.constants.AddressZero,  //接受代币
    tags: "energy", // 标签 如能源，金融，医疗
    remarks: "Test Remarks",  // 备注
  };

  before(async () => {
    [owner] = await ethers.getSigners();
    console.log("ownerAddress:",owner.address);
    // 从JSON文件读取合约数据
    const jsonFilePath = path.join(__dirname, "asset-contract-data.json");
    const rawContractData = fs.readFileSync(jsonFilePath);
    contractData = JSON.parse(rawContractData);
    // 连接到现有的合约
    assetContract = new ethers.Contract(contractData.assetAddress, contractData.assetAbi, owner);
  });
  
  it("should mint a new asset", async () => {   
    await assetContract.mint(
      owner.address,
      AssetData.name,
      AssetData.image,
      AssetData.price,
      AssetData.subtitle,
      AssetData.description,
      AssetData.supply,
      AssetData.acceptedToken,
      AssetData.tags,
      AssetData.remarks
    );

    // 监听 AssetMinted 事件,从中获取 tokenId
    const filter = assetContract.filters.AssetMinted(null, null);
    const events = await assetContract.queryFilter(filter);
    const latestEvent = events[events.length - 1];     
    tokenId = latestEvent.args.tokenId; 
    console.log("New NFT Token ID:", tokenId.toString()); 
    
    // 调用合约获取已创建的资产地址，之后就可以根据资产地址进行上市
    const createdAssetAddresses = await assetContract.getCreatedAssets();
    const existingAssetAddress = createdAssetAddresses[tokenId];    
    console.log("existingAssetAddress:",existingAssetAddress);

    const asset = await assetContract.assets(tokenId);
    console.log("after mint asset:",asset);
    expect(asset.name).to.equal(AssetData.name);
    expect(asset.image).to.equal(AssetData.image);
    expect(asset.price).to.equal(AssetData.price);
    expect(asset.subtitle).to.equal(AssetData.subtitle);
    expect(asset.description).to.equal(AssetData.description);
    expect(asset.supply).to.equal(AssetData.supply);
    expect(asset.inventory).to.equal(AssetData.supply);
    expect(asset.acceptedToken).to.equal(AssetData.acceptedToken);
    expect(asset.tags).to.equal(AssetData.tags);
    expect(asset.remarks).to.equal(AssetData.remarks);
  });

  it("should update an existing asset", async () => {
    const newName = "Updated Asset";
    try{
    await assetContract.updateAsset(
      tokenId,
      newName,
      AssetData.image,
      0, // 设置删除状态  0是未删除；1是已删除
      0, // 设置发布状态 0是直接出售；1是拍卖出售
      ethers.utils.parseEther("2"), // 更改价格
      "Updated Subtitle", // 更改副标题
      "Updated Description",  // 更改描述
      5, // 更改供应量
      3, // 更改库存
      owner.address, // 接受代币
      "financial", // 更改标签
      "Updated Remarks" // 更改备注
    );
    } catch(error){
      console.log("error:",error);
    }

    // 获取更新后的资产名称
    const updatedAssetName = (await assetContract.assets(tokenId)).name;
    console.log("Current asset name after update:", updatedAssetName);

    const asset = await assetContract.assets(tokenId);
    console.log("after update asset:",asset)
    expect(asset.name).to.equal(newName);
    expect(asset.deleted).to.equal(0);
    expect(asset.status).to.equal(0);
    expect(asset.price).to.equal(ethers.utils.parseEther("2"));
    expect(asset.subtitle).to.equal("Updated Subtitle");
    expect(asset.description).to.equal("Updated Description");
    expect(asset.supply).to.equal(5);
    expect(asset.inventory).to.equal(3);
    expect(asset.acceptedToken).to.equal(owner.address);
    expect(asset.tags).to.deep.equal("financial");
    expect(asset.remarks).to.equal("Updated Remarks");
  });

  it("should delete an existing asset", async () => {
    await assetContract.deleteAsset(tokenId);
    const asset = await assetContract.assets(tokenId);
    expect(asset.deleted).to.equal(1);
  });
});
