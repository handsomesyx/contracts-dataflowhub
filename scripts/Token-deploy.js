const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  const Token = await ethers.getContractFactory("Token");
  const token = await Token.deploy("My Token", "MTK", ethers.utils.parseEther("1000"));
  await token.deployed();

  console.log("transaction hash:", token.deployTransaction.hash);
  console.log("block:", token.deployTransaction.blockNumber);
  console.log("deployer address:", deployer.address);
  console.log("token address:", token.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
