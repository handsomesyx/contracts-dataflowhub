// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.11;

// Helper interfaces
import {IWETH} from "../interfaces/IWETH.sol";

import "../openzeppelin-presets/token/ERC20/utils/SafeERC20.sol";

// 处理一般性的代币转移，包括各种费用和代币之间的交互
library CurrencyTransferLib {
    using SafeERC20 for IERC20;

    /// @dev The address interpreted as native token of the chain.
    address public constant NATIVE_TOKEN =
        0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

    /// @dev Transfers a given amount of currency.
    function transferCurrency(
        address _currency,
        address _from,
        address _to,
        uint256 _amount
    ) internal {
        if (_amount == 0) {
            return;
        }

        if (_currency == NATIVE_TOKEN) {
            safeTransferNativeToken(_to, _amount);
        } else {
            safeTransferERC20(_currency, _from, _to, _amount);
        }
    }

    /// @dev Transfers a given amount of currency. (With native token wrapping)
    function transferCurrencyWithWrapper(
        address _currency,
        address _from,
        address _to,
        uint256 _amount,
        address _nativeTokenWrapper
    ) internal {
        if (_amount == 0) {
            return;
        }

        if (_currency == NATIVE_TOKEN) {
            if (_from == address(this)) {
                // _from 是当前合约地址，就从合约中提取原生货币并转账给_to
                IWETH(_nativeTokenWrapper).withdraw(_amount);
                safeTransferNativeTokenWithWrapper(
                    _to,
                    _amount,
                    _nativeTokenWrapper
                );
            } else if (_to == address(this)) {
                // _to是当前合约地址，就将原生货币存储在合约中
                require(_amount == msg.value, "msg.value != amount");
                IWETH(_nativeTokenWrapper).deposit{value: _amount}();
            } else {
                // _from 和 _to 都不是当前合约时，将原生货币从 _from 转移到 _to
                safeTransferNativeTokenWithWrapper(
                    _to,
                    _amount,
                    _nativeTokenWrapper
                );
            }
        } else {
            // 如果_currency 不是原生货币，则表示它是一个 ERC-20 代币，调用safeTransferERC20函数
            safeTransferERC20(_currency, _from, _to, _amount);
        }
    }

    // 将 _amount 数量的 ERC-20 代币从 _from 转移到 _to
    function safeTransferERC20(
        address _currency,
        address _from,
        address _to,
        uint256 _amount
    ) internal {
        if (_from == _to) {
            return;
        }

        if (_from == address(this)) {
            IERC20(_currency).safeTransfer(_to, _amount);
        } else {
            IERC20(_currency).safeTransferFrom(_from, _to, _amount);
        }
    }

    /// @dev Transfers `amount` of native token to `to`.
    function safeTransferNativeToken(address to, uint256 value) internal {
        // solhint-disable avoid-low-level-calls
        // slither-disable-next-line low-level-calls
        (bool success, ) = to.call{value: value}("");
        require(success, "native token transfer failed");
    }

    /// @dev Transfers `amount` of native token to `to`. (With native token wrapping)
    function safeTransferNativeTokenWithWrapper(
        address to,
        uint256 value,
        address _nativeTokenWrapper
    ) internal {
        // solhint-disable avoid-low-level-calls
        // slither-disable-next-line low-level-calls
        (bool success, ) = to.call{value: value}("");
        if (!success) {
            IWETH(_nativeTokenWrapper).deposit{value: value}();
            IERC20(_nativeTokenWrapper).safeTransfer(to, value);
        }
    }
}
