const { expect, assert } = require("chai");
const { ethers } = require("hardhat");
// const hardhatConfig = require("./hardhat.config.js"); // 替换为您的 Hardhat 配置文件路径

// 获取您配置文件中的网络信息
// const catChainConfig = hardhatConfig.networks.CatChain;


describe("OneLandMarketplace", function () {
  let marketplace;
  let asset;
  let token;
  let owner;


  beforeEach(async function () {
    [owner] = await ethers.getSigners();
    console.log("caller:", owner.address);
    
    const Asset = await ethers.getContractFactory("Asset");
    asset = await Asset.deploy();
    const assetContract = await asset.deployed();
    const assetAddress = await assetContract.deployTransaction.from;
    console.log("asset.address:", asset.address);
    console.log("asset.deployer:", assetAddress);
    
    const Marketplace = await ethers.getContractFactory("OneLandMarketplace");
    marketplace = await Marketplace.deploy(
      ethers.constants.AddressZero,
      ethers.constants.AddressZero 
    );
    const marketplaceContract = await marketplace.deployed();
    const marketplaceAddress = await marketplaceContract.deployTransaction.from;
    console.log("marketplace.address:", marketplace.address);
    console.log("marketplace.deployer:", marketplaceAddress);

    const Token = await ethers.getContractFactory("Token");
    token = await Token.deploy("My Token", "MTK", ethers.utils.parseUnits("10000", 18));
    const tokenContract = await token.deployed();
    const tokenAddress = await tokenContract.deployTransaction.from;
    console.log("token.address:", token.address);
    console.log("token.deployer:", tokenAddress);

  });

   // 资产上市
   it("Should create a new listing", async function () {
    // 从后端读取到的数据 这里是使用假数据进行模拟
    // const tokenId = 18;  //id 唯一 不能重复
    const startTime = Math.floor(Date.now() / 1000) + 3600;  // 开始的时间 这个不用进行修改
    const secondsUntilEndTime = 3600; // 结束的时间 这个不用进行修改
    const quantityToList = 1; // 总数
    const currencyToAccept = token.address; // 代币地址
    const reservePricePerToken = ethers.utils.parseEther("1"); //拍卖接受的价格
    const buyoutPricePerToken = ethers.utils.parseEther("2");  // 直接售卖的价格
    const listingType = 0; // 或者使用常量 Direct  0是直接售卖 1是拍卖

    // 资产属性
    const productData = {
      name: "Test Product",
      image: "test.jpg",
      price: ethers.utils.parseEther("1"),
      subtitle: "Test Subtitle",
      description: "Test Description",
      supply: 10,
      acceptedToken: ethers.constants.AddressZero,
      tags: "energy",
      remarks: "Test Remarks",
    };
   
   // 给资产上链 
   // 调用 mint 函数，创建资产
   await asset.mint(
      owner.address,
      productData.name,
      productData.image,
      productData.price,
      productData.subtitle,
      productData.description,
      productData.supply,
      productData.acceptedToken,
      productData.tags,
      productData.remarks
    );
    await asset.deployTransaction.wait(3);
    // 监听 AssetMinted 事件,从中获取 tokenId
    const filter = asset.filters.AssetMinted(null, null);
    const events = await asset.queryFilter(filter);
    if (events.length > 0) {
      const latestEvent = events[events.length - 1];     
      const tokenId = latestEvent.args.tokenId; 
      console.log("New NFT Token ID:", tokenId.toString()); 
      // 设置授权
      await asset.approve(marketplace.address, tokenId);
      await asset.setApprovalForAll(marketplace.address, owner.address);
      await marketplace.createListing({
        assetContract: asset.address,
        tokenId,
        startTime,
        secondsUntilEndTime,
        quantityToList,
        currencyToAccept,
        reservePricePerToken,
        buyoutPricePerToken,
        listingType,    
      });
      await marketplace.deployTransaction.wait(5);
      const listing = await marketplace.listings(tokenId);
      console.log(listing);
    } else {
      console.log("No AssetMinted events found.");
    }
 });
})