const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Asset Contract", function () {
  let assetContract;
  let owner;

  const AssetData = {
    name: "Test Asset",
    image: "test.jpg",
    price: ethers.utils.parseEther("1"),
    subtitle: "Test Subtitle",
    description: "Test Description",
    supply: 10,
    acceptedToken: ethers.constants.AddressZero,
    tags: "energy",
    remarks: "Test Remarks",
  };

  before(async () => {
    [owner] = await ethers.getSigners();
    const Asset = await ethers.getContractFactory("Asset");
    assetContract = await Asset.deploy();
    await assetContract.deployed();
  });

  it("should mint a new asset", async () => {
    const tokenId = 0; 
    await assetContract.connect(owner).mint(
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
     // 等待交易完成
    await assetContract.deployTransaction.wait(2);
    console.log("Current asset name after mint:", (await assetContract.assets(0)).name);

    const asset = await assetContract.assets(tokenId);
    console.log(asset);
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
    const tokenId = 0; 
    const newName = "Updated Asset";
    await assetContract.connect(owner).updateAsset(
      tokenId,
      newName,
      AssetData.image,
      1, // Set as deleted
      1, // Set as pending
      ethers.utils.parseEther("2"), // Updated price
      "Updated Subtitle",
      "Updated Description",
      5, // Updated supply
      3, // Updated inventory
      owner.address, // Updated acceptedToken
      "financial", // Updated tags
      "Updated Remarks"
    );
     // 等待交易完成
    await assetContract.deployTransaction.wait(3);
    // 获取更新后的资产名称
    const updatedAssetName = (await assetContract.assets(tokenId)).name;
    console.log("Current asset name after update:", updatedAssetName);

    const asset = await assetContract.assets(tokenId);
    expect(asset.name).to.equal(newName);
    expect(asset.deleted).to.equal(1);
    expect(asset.status).to.equal(1);
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
    const tokenId = 0;
    await assetContract.connect(owner).deleteAsset(tokenId);
    const asset = await assetContract.assets(tokenId);
    expect(asset.deleted).to.equal(1);
  });
});
