const { expect, assert } = require("chai");
const { ethers,network, waffle } = require("hardhat");
const fs = require('fs');
const path = require('path'); 


describe("OneLandMarketplace", function () {
  let marketplace;
  let asset;
  let token;
  let owner;
  let tokenId;
  let listingId;
  let startTime;
  let secondsUntilEndTime;
  let quantityToList;
  let currencyToAccept;
  let reservePricePerToken;
  let buyoutPricePerToken;
  let listingType;
  
  before(async function () {
    [owner] = await ethers.getSigners();

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
    
    // 从后端读取到的数据 这里是使用假数据进行模拟
    startTime = Math.floor(Date.now() / 1000) + 3600;  // 开始的时间 这个不用进行修改
    secondsUntilEndTime = 3600; // 结束的时间 这个不用进行修改
    quantityToList = 1; // 总数
    currencyToAccept = token.address; // 代币地址
    reservePricePerToken = ethers.utils.parseEther("1"); //拍卖接受的价格
    buyoutPricePerToken = ethers.utils.parseEther("2");  // 直接售卖的价格
    listingType = 0; // 或者使用常量 Direct  0是直接售卖 1是拍卖
  });
    

   // 资产上市
   it("Should create a new listing", async function () {
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

      // 等待交易被确认，并获取交易哈希和创建者地址
      const mintedData = await tx.wait();
      const aeestTransactionHash = mintedData.transactionHash;
      console.log(`Asset Minted Transaction Hash: ${aeestTransactionHash}`);
      const assetCreator = mintedData.from;
      console.log(`Asset Creator: ${assetCreator}`);

      // 监听 AssetMinted 事件,从中获取 tokenId
      const filter = asset.filters.AssetMinted(null, null);
      const events = await asset.queryFilter(filter);
      const newAssets = events.filter(event => event.transactionHash === aeestTransactionHash);
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
      expect(listing.tokenOwner).to.equal(owner.address);
      expect(listing.quantity).to.equal(quantityToList); 
      expect(listing.reservePricePerToken).to.equal(reservePricePerToken); 
      expect(listing.buyoutPricePerToken).to.equal(buyoutPricePerToken);
      expect(listing.listingType).to.equal(listingType);
  });


    // 更新上市后资产信息
    it("Should update a listing", async function () {
      const updatedStartTime = startTime + 3600;
      const updatedReservePrice = ethers.utils.parseEther("1.5"); 
      const updatedBuyoutPrice = ethers.utils.parseEther("2.5"); 
      await expect(
        marketplace.connect(owner).updateListing(
          listingId,
          quantityToList,
          updatedReservePrice,
          updatedBuyoutPrice,
          currencyToAccept,
          updatedStartTime,
          secondsUntilEndTime, 
        )
      )
        .to.emit(marketplace, "ListingUpdated")
        .withArgs(listingId, owner.address);
      const updatedListing = await marketplace.listings(listingId);
      console.log("updatedListing:",updatedListing);
      expect(updatedListing.startTime).to.equal(updatedStartTime);
      expect(updatedListing.reservePricePerToken).to.equal(updatedReservePrice);
      expect(updatedListing.buyoutPricePerToken).to.equal(updatedBuyoutPrice);
      expect(updatedListing.listingType).to.equal(listingType);
    });


    // 取消资产上市
    it("Should cancel a direct listing", async function () {
      await expect(
        marketplace.connect(owner).cancelDirectListing(listingId)
      ).to.emit(marketplace, "ListingRemoved").withArgs(listingId, owner.address);
    
      // 获取已删除的上市信息
      const canceledListing = await marketplace.listings(listingId);
      expect(canceledListing.tokenOwner).to.equal(ethers.constants.AddressZero);
    });

})