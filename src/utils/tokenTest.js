import { ethers } from 'ethers';
import { ERC20_ABI } from './abis';

// 测试代币信息获取
export async function testTokenInfo(tokenAddress) {
  try {
    console.log('开始测试代币信息获取...');
    console.log('代币地址:', tokenAddress);

    // 连接到以太坊网络
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);

    // 获取代币信息
    console.log('正在获取代币信息...');
    const symbol = await tokenContract.symbol();
    const name = await tokenContract.name();
    const decimals = await tokenContract.decimals();

    console.log('代币信息获取成功:');
    console.log('- 代币符号 (Symbol):', symbol);
    console.log('- 代币名称 (Name):', name);
    console.log('- 代币精度 (Decimals):', decimals);

    return {
      symbol,
      name,
      decimals
    };
  } catch (error) {
    console.error('代币信息获取失败:', error);
    throw error;
  }
} 