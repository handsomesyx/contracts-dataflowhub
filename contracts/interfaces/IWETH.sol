// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.11;

interface IWETH {
    // 当以太币发送到 WETH 合约时，会将相应数量的 WETH 代币存入调用者的账户
    function deposit() external payable;

    // 将指定数量的 WETH 代币兑换为以太币，并将以太币发送到调用者的地址。
    function withdraw(uint256 amount) external;

    // 允许用户将 WETH 代币从一个地址转移到另一个地址
    function transfer(address to, uint256 value) external returns (bool);
}
