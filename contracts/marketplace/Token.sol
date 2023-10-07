// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20 {
    address public contractOwner;

    event TransferWithMessage(
        address indexed from,
        address indexed to,
        uint256 amount,
        string message
    );

    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20(name, symbol) {
        contractOwner = msg.sender;
        _mint(msg.sender, initialSupply); // 铸造代币并发送到合约创建者地址
    }

    function mint(address account, uint256 amount) external {
        require(
            msg.sender == contractOwner,
            "Only the contract owner can mint tokens"
        );
        _mint(account, amount);
    }

    function transferWithMessage(
        address to,
        uint256 amount,
        string calldata message
    ) external {
        _transfer(_msgSender(), to, amount);
        emit TransferWithMessage(_msgSender(), to, amount, message);
    }
}
