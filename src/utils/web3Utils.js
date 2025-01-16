import Web3 from 'web3';

// ERC20代币的ABI
const ERC20_ABI = [
  // approve方法
  {
    "constant": false,
    "inputs": [
      {
        "name": "_spender",
        "type": "address"
      },
      {
        "name": "_value",
        "type": "uint256"
      }
    ],
    "name": "approve",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // transferFrom方法
  {
    "constant": false,
    "inputs": [
      {
        "name": "_from",
        "type": "address"
      },
      {
        "name": "_to",
        "type": "address"
      },
      {
        "name": "_value",
        "type": "uint256"
      }
    ],
    "name": "transferFrom",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // allowance 方法
  {
    "constant": true,
    "inputs": [
      {
        "name": "_owner",
        "type": "address"
      },
      {
        "name": "_spender",
        "type": "address"
      }
    ],
    "name": "allowance",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  // 添加 balanceOf 方法
  {
    "constant": true,
    "inputs": [
      {
        "name": "_owner",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "name": "balance",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  // 添加 decimals 方法
  {
    "constant": true,
    "inputs": [],
    "name": "decimals",
    "outputs": [
      {
        "name": "",
        "type": "uint8"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  // 添加 symbol 方法
  {
    "constant": true,
    "inputs": [],
    "name": "symbol",
    "outputs": [
      {
        "name": "",
        "type": "string"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }
];

// 批量转账合约
const BATCH_TRANSFER_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      },
      {
        "internalType": "address[]",
        "name": "recipients",
        "type": "address[]"
      },
      {
        "internalType": "uint256[]",
        "name": "amounts",
        "type": "uint256[]"
      }
    ],
    "name": "batchTransfer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// 批量转账合约地址（需要部署后填入）
const BATCH_TRANSFER_CONTRACT = "0x78B0839AaC7027afC0807A1C664e19B56e932823";

export const approveBatchTransfer = async (tokenAddress, totalAmount) => {
  try {
    const web3 = new Web3(window.ethereum);
    const accounts = await web3.eth.getAccounts();
    const tokenContract = new web3.eth.Contract(ERC20_ABI, tokenAddress);

    // 检查当前授权额度
    const currentAllowance = await tokenContract.methods
      .allowance(accounts[0], BATCH_TRANSFER_CONTRACT)
      .call();

    // 将数值转换为字符串进行比较
    const currentAllowanceStr = currentAllowance.toString();
    const totalAmountStr = totalAmount.toString();

    // 如果当前授权额度小于需要的金额，才进行授权
    if (currentAllowanceStr < totalAmountStr) {
      // 获取当前 gas 价格
      const gasPrice = await web3.eth.getGasPrice();

      // 进行新的授权
      const approve = await tokenContract.methods
        .approve(BATCH_TRANSFER_CONTRACT, totalAmount)
        .send({ 
          from: accounts[0],
          gasPrice: gasPrice,
          gas: 60000  // 固定的 gas 限制
        });

      return approve;
    }
    
    return true; // 已经有足够的授权额度
  } catch (error) {
    console.error('Approve failed:', error);
    if (error.message.includes('Internal JSON-RPC error')) {
      throw new Error('授权失败，请检查：\n1. 是否有足够的 DFC 支付 gas\n2. 代币合约是否支持 approve 功能');
    }
    throw error;
  }
};

export const executeBatchTransfer = async (tokenAddress, recipients, amounts) => {
  try {
    const web3 = new Web3(window.ethereum);
    const accounts = await web3.eth.getAccounts();
    const batchContract = new web3.eth.Contract(BATCH_TRANSFER_ABI, BATCH_TRANSFER_CONTRACT);

    // 验证参数
    console.log('=== 批量转账参数验证 ===');
    console.log('批量转账合约地址:', BATCH_TRANSFER_CONTRACT);
    console.log('Token地址:', tokenAddress);
    console.log('发送者地址:', accounts[0]);
    console.log('接收者地址:', recipients);
    console.log('转账金额:', amounts);
    
    // 验证每个地址的格式
    for (const recipient of recipients) {
      if (!web3.utils.isAddress(recipient)) {
        throw new Error(`无效的接收地址: ${recipient}`);
      }
    }

    // 验证金额列表长度
    if (recipients.length !== amounts.length) {
      throw new Error('接收者地址和金额数量不匹配');
    }

    // 计算手续费 (0.001 DFC per address)
    const feePerAddress = '1000000000000000'; // 0.001 ether in wei
    const totalFee = (Number(feePerAddress) * recipients.length).toString();
    console.log('手续费:', web3.utils.fromWei(totalFee, 'ether'), 'DFC');

    // 估算 gas 限制
    try {
      const gasEstimate = await batchContract.methods
        .batchTransfer(tokenAddress, recipients, amounts)
        .estimateGas({ 
          from: accounts[0],
          value: totalFee
        });
      console.log('预估 gas 限制:', gasEstimate);
      
      // 执行批量转账
      console.log('=== 执行转账 ===');
      const transfer = await batchContract.methods
        .batchTransfer(tokenAddress, recipients, amounts)
        .send({ 
          from: accounts[0],
          value: totalFee,
          gas: Math.floor(Number(gasEstimate.toString()) * 1.5), // 将 BigInt 转换为 Number
          type: '0x0'
        });

      console.log('转账成功:', transfer.transactionHash);
      return transfer;
    } catch (gasError) {
      console.error('Gas 估算失败:', gasError);
      throw new Error('Gas 估算失败，请检查合约地址和参数是否正确');
    }
  } catch (error) {
    console.error('转账失败:', error);
    if (error.message.includes('Insufficient fee')) {
      throw new Error('手续费不足，请确保有足够的 DFC');
    }
    throw error;
  }
}; 