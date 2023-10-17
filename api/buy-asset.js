const { expect, assert } = require("chai");
const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path'); 


describe("OneLandMarketplace", function () {
  let marketplace;
  let asset;
  let token;
  let owner;
  let tokenId;
  let listingId;
  let buyer;

  // 使用私钥创建账户实例
  const ownerPrivateKey = process.env.OWNER_PRIVATE_KEY;
  const buyerPrivateKey = process.env.BUYER_PRIVATE_KEY;
  owner = new ethers.Wallet(ownerPrivateKey, ethers.provider);
  buyer = new ethers.Wallet(buyerPrivateKey, ethers.provider);


  before(async function () {
    console.log("owner address:",owner.address);
    console.log("buyer address:",buyer.address);
      
    // 读取 Asset 合约的 ABI 和地址
    const jsonAssetFilePath = path.join(__dirname, "asset-contract-data.json");
    const rawAssetContractData = fs.readFileSync(jsonAssetFilePath);
    const AssetData = JSON.parse(rawAssetContractData);
    asset = new ethers.Contract(AssetData.assetAddress, AssetData.assetAbi, owner);   

    // 读取 Marketplace 合约的 ABI 和地址
    const jsonMarketplaceFilePath = path.join(__dirname, "marketplace-contract-data.json");
    const rawMarketplaceContractData = fs.readFileSync(jsonMarketplaceFilePath);
    const marketplaceData = JSON.parse(rawMarketplaceContractData);
    marketplace = new ethers.Contract(marketplaceData.marketplaceAddress, marketplaceData.marketplaceAbi, owner);
    
    // 读取 Token 合约的 ABI 和地址
    const jsonTokenFilePath = path.join(__dirname, "token-contract-data.json");
    const rawTokenContractData = fs.readFileSync(jsonTokenFilePath);
    const TokenData = JSON.parse(rawTokenContractData);
    token = new ethers.Contract(TokenData.tokenAddress, TokenData.tokenAbi, owner);
    console.log(1111111111)
  });


   // 资产上市
   it("Should create a new listing", async function () {
      // 获取当前块的时间戳
      const currentBlock = await ethers.provider.getBlock("latest");
      const currentTimestamp = currentBlock.timestamp;

      // 从后端读取到的数据 这里是使用假数据进行模拟
      // const startTime = Math.floor(Date.now() / 1000) + 3600;  // 开始的时间   
      // const secondsUntilEndTime = 3600; // 结束的时间
      const startTime = currentTimestamp;
      const timeWindowInHours = 1;
      const secondsUntilEndTime = timeWindowInHours * 3600;
      const quantityToList = 1; // 总数
      const currencyToAccept = token.address; // 代币地址
      const reservePricePerToken = ethers.utils.parseEther("1"); //拍卖接受的价格
      const buyoutPricePerToken = ethers.utils.parseEther("2");  // 直接售卖的价格
      const listingType = 0; // 或者使用常量 Direct  0是直接售卖 1是拍卖

      // 资产属性
      const assetData = {
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
    
      console.log(2222222222)
      // 调用 mint 函数，创建资产
      const tx = await asset.mint(
          owner.address,
          assetData.name,
          assetData.image,
          assetData.price,
          assetData.subtitle,
          assetData.description,
          assetData.supply,
          assetData.acceptedToken,
          assetData.tags,
          assetData.remarks
        );
        // await asset.deployTransaction.wait(3);
        console.log("asset:",asset.address)

        // 使用 `wait` 方法等待交易被确认，并获取交易哈希
        const receipt = await tx.wait();
        const transactionHash = receipt.transactionHash;
        console.log(`Transaction Hash: ${transactionHash}`);
        const creator = receipt.from;
        console.log(`creator: ${creator}`);

        // 监听 AssetMinted 事件,从中获取 tokenId
        const filter = asset.filters.AssetMinted(null, null);
        const events = await asset.queryFilter(filter);
        const newAssets = events.filter(event => event.transactionHash === transactionHash);
        newAssets.forEach((event) => {
          tokenId = event.args.tokenId;
          console.log(`New asset created tokenId: ${tokenId}`);
        });

        // 设置授权
        await asset.approve(marketplace.address, tokenId);
        await asset.setApprovalForAll(marketplace.address, owner.address);

      // 调用marketplace合约的createListing函数进行上市
        const mp = await marketplace.connect(owner).createListing({
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

        // 获取上市之后的哈希值
        const listingData = await mp.wait();
        const listingTransactionHash = listingData.transactionHash;
        console.log(`Asset Listinged Transaction Hash: ${listingTransactionHash}`);
        const listingCreator = listingData.from;
        console.log(`Asset Listinged Creator: ${listingCreator}`);

        // 监听 ListingAdded 事件，从中获取listingId
        const filterListing = marketplace.filters.ListingAdded(null, null, null, null);
        const Listingevents = await marketplace.queryFilter(filterListing);
        const newListings = Listingevents.filter(Listingevent => Listingevent.transactionHash === listingTransactionHash);
        newListings.forEach((Listingevent) => {
            listingId = Listingevent.args.listingId;
            console.log(`New add listing listingId: ${listingId.toNumber()}`);
        });
        
        // 获取上市后的listingId
        const listing = await marketplace.listings(listingId);
        console.log(listing);

        // 获取总价格
        const quantityToBuy = 1;
        const totalPrice = buyoutPricePerToken.mul(quantityToBuy);
        const oldOwner = await asset.ownerOf(tokenId);
        console.log("oldOwner:", oldOwner);

        // token授权数量buyer
        const approvalTotalAmount = ethers.utils.parseUnits("100", 18); 
        await token.connect(owner).approve(buyer.address, approvalTotalAmount);
        const allowanceBuyer = await token.allowance(owner.address, buyer.address); 
        console.log("allowanceBuyer:", allowanceBuyer);
        
        // 转移token到buyer
        await token.connect(owner).transfer(buyer.address, approvalTotalAmount);
        const buyerBalance = await token.balanceOf(buyer.address);
        console.log("buyer.address:", buyer.address);
        console.log("buyerBalance:", buyerBalance);

        // buyer授权marketplace
        await token.connect(buyer).approve(marketplace.address, approvalTotalAmount);
        const allowanceMarketplace = await token.allowance(buyer.address, marketplace.address);
        console.log("allowanceMarketplace:", allowanceMarketplace);
        
        console.log(
          listing.listingId,
          listing.assetContract,
          listing.tokenOwner,
          buyer.address, 
          quantityToBuy,
          totalPrice,
        );
        // 获取购买前的事件数量
        const initialEventCount = await marketplace.queryFilter("NewSale").then((events) => events.length);
        console.log("initialEventCount:",initialEventCount);
        // 购买上市
        await expect(
          marketplace.connect(buyer).buy(
            listingId, 
            buyer.address, 
            quantityToBuy, 
            currencyToAccept, 
            totalPrice
            )
        )
        .to.emit(marketplace, "NewSale") 
        .withArgs(
          listing.listingId,
          listing.assetContract,
          listing.tokenOwner,
          buyer.address, 
          quantityToBuy,
          totalPrice,
      );
      // 获取购买后的事件数量
      const finalEventCount = await marketplace.queryFilter("NewSale").then((events) => events.length);
      console.log(finalEventCount);

      // 验证是否触发了 NewSale 事件
      expect(finalEventCount).to.equal(initialEventCount + 1);
    
      // 验证购买后的资产所有者
      const newOwner = await asset.ownerOf(tokenId);
      console.log("newOwner:", newOwner);
      const updatedListing = await marketplace.listings(listingId);
      expect(updatedListing.quantity).to.equal(listing.quantity - quantityToBuy);
      expect(newOwner).to.equal(buyer.address);
  });
})