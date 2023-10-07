// scripts/deployAsset.js
const { ethers, upgrades } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  const Asset = await ethers.getContractFactory("Asset");
  const asset = await Asset.deploy();
  await asset.deployed();

  console.log("transaction hash:", asset.deployTransaction.hash);
  console.log("block:", asset.deployTransaction.blockNumber);
  console.log("deployer address:", deployer.address);
  console.log("asset address:", asset.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
