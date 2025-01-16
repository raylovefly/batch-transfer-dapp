// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract BatchTransfer is Ownable, ReentrancyGuard {
    // 每个地址的手续费
    uint256 public feePerAddress = 0.01 ether;
    
    // 批量转账事件
    event BatchTransferExecuted(
        address indexed token,
        address indexed sender,
        uint256 totalAmount,
        uint256 recipientCount
    );
    
    // 提取手续费事件
    event FeeWithdrawn(address indexed owner, uint256 amount);
    
    // 设置每个地址的手续费
    function setFeePerAddress(uint256 _feePerAddress) external onlyOwner {
        feePerAddress = _feePerAddress;
    }
    
    // 批量转账函数
    function batchTransfer(
        address token,
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external payable nonReentrant {
        require(recipients.length > 0, "No recipients provided");
        require(recipients.length == amounts.length, "Arrays length mismatch");
        require(msg.value >= feePerAddress * recipients.length, "Insufficient fee");
        
        // 计算总转账金额
        uint256 totalAmount = 0;
        for(uint256 i = 0; i < amounts.length; i++) {
            totalAmount += amounts[i];
        }
        
        // 将代币从用户转移到合约
        IERC20(token).transferFrom(msg.sender, address(this), totalAmount);
        
        // 执行批量转账
        for(uint256 i = 0; i < recipients.length; i++) {
            require(recipients[i] != address(0), "Invalid recipient address");
            IERC20(token).transfer(recipients[i], amounts[i]);
        }
        
        emit BatchTransferExecuted(token, msg.sender, totalAmount, recipients.length);
    }
    
    // 提取手续费
    function withdrawFee() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fee to withdraw");
        
        (bool success, ) = owner().call{value: balance}("");
        require(success, "Fee withdrawal failed");
        
        emit FeeWithdrawn(owner(), balance);
    }
    
    // 接收 DFC
    receive() external payable {}
    
    // 提取合约中的ETH
    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        
        (bool success, ) = owner().call{value: balance}("");
        require(success, "Withdrawal failed");
    }
} 