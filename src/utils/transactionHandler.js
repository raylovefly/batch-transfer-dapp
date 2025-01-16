import { ethers } from 'ethers';

export const handleTransaction = async (transaction, options = {}) => {
  const { onSuccess, onError, onPending } = options;

  try {
    if (onPending) {
      onPending(transaction);
    }

    const receipt = await transaction.wait();

    if (onSuccess) {
      onSuccess(receipt);
    }

    return receipt;
  } catch (error) {
    if (onError) {
      onError(error);
    }
    throw error;
  }
};

export const estimateGas = async (contract, method, args = [], options = {}) => {
  try {
    const gasEstimate = await contract.estimateGas[method](...args, options);
    return gasEstimate.mul(12).div(10); // 增加 20% 的 gas 限制
  } catch (error) {
    console.error('Gas 估算失败:', error);
    return ethers.BigNumber.from('5000000'); // 默认 gas 限制
  }
}; 