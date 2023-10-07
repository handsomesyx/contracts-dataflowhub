const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Token", function () {
  let MyToken;
  let myToken;


  beforeEach(async function () {
    MyToken = await ethers.getContractFactory("Token");
    [owner, recipient] = await ethers.getSigners();

    myToken = await MyToken.deploy("My Token", "MTK", ethers.utils.parseEther("1000"));
    await myToken.deployed();
  });

  it("should have correct symbol name, and initial supply", async function () {
    const name = await myToken.name();
    const symbol = await myToken.symbol();
    const totalSupply = await myToken.totalSupply();

    expect(name).to.equal("My Token");
    expect(symbol).to.equal("MTK");
    expect(totalSupply).to.equal(ethers.utils.parseEther("1000"));
  });

});