const { ethers } = require("hardhat");

async function main() {
  // 获取合约工厂
  const OneLandMarketplace = await ethers.getContractFactory("OneLandMarketplace");

  // 从命令行参数中读取参数值
  // const nativeTokenWrapperAddress = process.env.nativeTokenWrapper;
  // const thirdwebFeeAddress = process.env.thirdwebFee;
  // 部署合约
  // const oneLandMarketplace = await OneLandMarketplace.deploy(nativeTokenWrapperAddress, thirdwebFeeAddress);
  const oneLandMarketplace = await OneLandMarketplace.deploy(
    ethers.constants.AddressZero, // Native token wrapper address
    ethers.constants.AddressZero  // Thirdweb fee address
  );
  await oneLandMarketplace.deployed();

  console.log("Deploying 'OneLandMarketplace'");
  console.log("-----------------------------");
  console.log("transaction hash:", oneLandMarketplace.deployTransaction.hash);
  console.log("blocks:", oneLandMarketplace.deployTransaction.blockNumber);
  console.log("account:", oneLandMarketplace.deployTransaction.from);
  console.log("contract address:", oneLandMarketplace.address);

}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });



