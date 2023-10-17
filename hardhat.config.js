require('dotenv').config();
require("@nomiclabs/hardhat-waffle");

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 31337,
      mining: {
        auto: true, // 自动挖矿以使时间流逝
        interval: 2000, // 块之间的时间间隔（以毫秒为单位）
      },
    },
    localhost: {
      chainId: 31337,
    },
    deepchain: {
        url: "https://deeprpc.xiucaixiaoyuan.xyz", 
        chainId: 88991, 
        accounts: [process.env.PRIVATE_KEY],
    },
    CatChain: {
      url: "http://1.117.28.22:18545",
      chainId: 88991,
      accounts: [process.env.PRIVATE_KEY],
      allowUnlimitedContractSize: true,
      gasLimit: 8000000,
      gas: 8000000,
    },
  },

  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      viaIR: true,
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 4000000
  }

};
