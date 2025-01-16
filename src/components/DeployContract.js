import React, { useState } from 'react';
import {
  Box,
  Button,
  Text,
  VStack,
  Alert,
  AlertIcon,
  Input,
  Textarea,
  useToast
} from '@chakra-ui/react';
import Web3 from 'web3';

// 预期的合约代码
const EXPECTED_CONTRACT_CODE = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20 {
    function transferFrom(address from, address to, uint256 value) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
}

contract BatchTransfer {
    uint256 constant public FEE_PER_ADDRESS = 1e15;
    
    event BatchTransferExecuted(
        address indexed token,
        address indexed sender,
        uint256 recipientCount,
        uint256 totalAmount,
        uint256 totalFee
    );

    function batchTransfer(
        address token,
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external payable {
        require(recipients.length > 0, "No recipients provided");
        require(recipients.length == amounts.length, "Recipients and amounts length mismatch");
        
        uint256 requiredFee = recipients.length * FEE_PER_ADDRESS;
        require(msg.value >= requiredFee, "Insufficient fee");

        IERC20 tokenContract = IERC20(token);
        uint256 totalAmount = 0;

        for (uint256 i = 0; i < recipients.length; i++) {
            require(recipients[i] != address(0), "Invalid recipient address");
            require(amounts[i] > 0, "Invalid amount");
            
            require(
                tokenContract.transferFrom(msg.sender, recipients[i], amounts[i]),
                "Transfer failed"
            );
            
            totalAmount += amounts[i];
        }

        emit BatchTransferExecuted(
            token,
            msg.sender,
            recipients.length,
            totalAmount,
            requiredFee
        );
    }

    function withdraw() external {
        address payable owner = payable(msg.sender);
        owner.transfer(address(this).balance);
    }

    receive() external payable {}
}`;

function DeployContract() {
  const [contractAddress, setContractAddress] = useState('');
  const [contractCode, setContractCode] = useState('');
  const toast = useToast();

  const verifyContract = async () => {
    try {
      if (!window.ethereum) {
        throw new Error('请安装 MetaMask 钱包');
      }

      if (!Web3.utils.isAddress(contractAddress)) {
        throw new Error('请输入有效的合约地址');
      }

      if (!contractCode.trim()) {
        throw new Error('请输入合约代码');
      }

      // 移除空格和换行符进行比较
      const normalizedInputCode = contractCode.replace(/\s/g, '');
      const normalizedExpectedCode = EXPECTED_CONTRACT_CODE.replace(/\s/g, '');

      if (normalizedInputCode !== normalizedExpectedCode) {
        throw new Error('合约代码与预期不符，请检查代码是否正确');
      }

      // 连接 Web3
      const web3 = new Web3(window.ethereum);
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      // 获取合约代码
      const deployedCode = await web3.eth.getCode(contractAddress);
      if (deployedCode === '0x' || deployedCode === '0x0') {
        throw new Error('该地址不是合约地址或合约未部署');
      }

      toast({
        title: '验证成功',
        description: '合约代码验证通过，您可以开始使用批量转账功能了',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
    } catch (error) {
      console.error('验证失败:', error);
      toast({
        title: '验证失败',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box maxW="800px" mx="auto" mt="8" p="6">
      <VStack spacing="6">
        <Text fontSize="2xl">验证批量转账合约</Text>
        
        <Input
          placeholder="请输入在 Remix 部署的合约地址"
          value={contractAddress}
          onChange={(e) => setContractAddress(e.target.value)}
        />

        <Textarea
          placeholder="请粘贴合约代码"
          value={contractCode}
          onChange={(e) => setContractCode(e.target.value)}
          height="400px"
          fontFamily="monospace"
        />

        <Button
          colorScheme="blue"
          onClick={verifyContract}
          size="lg"
          width="full"
        >
          验证合约
        </Button>

        {contractAddress && Web3.utils.isAddress(contractAddress) && (
          <Alert status="info">
            <AlertIcon />
            <VStack align="start" spacing="2">
              <Text>当前合约地址: {contractAddress}</Text>
              <Text>请将此地址更新到 web3Utils.js 中的 BATCH_TRANSFER_CONTRACT 变量</Text>
            </VStack>
          </Alert>
        )}
      </VStack>
    </Box>
  );
}

export default DeployContract; 