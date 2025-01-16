import React, { useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import {
  Box,
  Button,
  Input,
  Textarea,
  useToast,
  Text,
  VStack,
  HStack,
  Grid,
  GridItem,
  Progress,
  InputGroup,
  InputRightElement,
  Tooltip,
  Stat,
  StatLabel,
  StatNumber,
  Alert,
  AlertIcon,
  CircularProgress,
  CircularProgressLabel,
  Flex,
  Badge,
  AlertTitle,
  AlertDescription,
  Link,
} from '@chakra-ui/react';
import { InfoIcon, DownloadIcon, WarningIcon } from '@chakra-ui/icons';
import { ERC20_ABI, BATCH_TRANSFER_ABI, BATCH_TRANSFER_CONTRACT } from '../utils/abis';
import { analyzeTransactionError } from '../utils/errorAnalyzer';
import { AnimatePresence } from 'framer-motion';
import { motion } from 'framer-motion';
import BatchCard, { BatchStatus } from './BatchCard';
import { testTokenInfo } from '../utils/tokenTest';

// 版本号
const VERSION = '2.2.1';
const BATCH_TRANSFER_ADDRESS = '0x1E511E790Dc2CbDd6DA739b20e8a441Ccef1d9f8';

// 样式配置
const styles = {
  gradientBg: 'linear-gradient(180deg, #0D0D2B 0%, #0D0D2B 100%)',
  cardBg: 'rgba(19, 23, 64, 0.5)',
  cardBorder: 'rgba(255, 255, 255, 0.1)',
  cardHoverBorder: 'rgba(31, 199, 212, 0.4)',
  textPrimary: 'white',
  textSecondary: 'rgba(255, 255, 255, 0.6)',
  buttonGradient: 'linear-gradient(90deg, #1FC7D4 0%, #2194F3 100%)',
  buttonHover: 'linear-gradient(90deg, #1FC7D4 20%, #2194F3 120%)',
  buttonActive: 'linear-gradient(90deg, #1FC7D4 -20%, #2194F3 80%)',
  inputBg: 'rgba(19, 23, 64, 0.5)',
  inputBorder: 'rgba(255, 255, 255, 0.1)',
  inputBgActive: 'rgba(31, 199, 212, 0.1)',
  inputBgLocked: 'rgba(19, 23, 64, 0.8)',
  batchCard: {
    completed: {
      borderColor: 'rgb(46, 204, 113)',
      boxShadow: '0 0 10px rgba(46, 204, 113, 0.3)'
    },
    processing: {
      borderColor: 'rgb(52, 152, 219)',
      boxShadow: '0 0 10px rgba(52, 152, 219, 0.3)'
    },
    failed: {
      borderColor: 'rgb(231, 76, 60)',
      boxShadow: '0 0 10px rgba(231, 76, 60, 0.3)'
    },
    pending: {
      borderColor: 'rgba(255, 255, 255, 0.1)',
      boxShadow: 'none'
    }
  },
  statusBadge: {
    completed: {
      bg: 'linear-gradient(90deg, #00FFB3 0%, #008A5E 100%)',
      color: 'white',
      boxShadow: '0 0 10px rgba(0, 255, 179, 0.3)'
    },
    pending: {
      bg: 'linear-gradient(90deg, #FFD54F 0%, #FF8C00 100%)',
      color: '#4A4A4A',
      animation: 'pulseBorder 2s infinite'
    },
    failed: {
      bg: '#FF4C4C',
      color: 'white',
      boxShadow: '0 0 10px rgba(178, 34, 34, 0.5)'
    }
  },
  errorAlert: {
    bg: '#FFEBEB',
    color: '#B22222',
    icon: {
      size: '24px',
      color: '#B22222'
    },
    text: {
      fontSize: 'sm',
      fontWeight: '500'
    }
  }
};

function BatchTransfer({ account, connectWallet, checkAndSwitchNetwork, provider }) {
  // 状态定义
  const [tokenAddress, setTokenAddress] = useState('');
  const [addressList, setAddressList] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenBalance, setTokenBalance] = useState('0');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [totalAmount, setTotalAmount] = useState('0');
  const [validationError, setValidationError] = useState('');
  const [isTransferSuccess, setIsTransferSuccess] = useState(false);
  const [batches, setBatches] = useState([]);
  const [completedBatches, setCompletedBatches] = useState(0);
  const [totalGasUsed, setTotalGasUsed] = useState('0');
  const [currentBatchIndex, setCurrentBatchIndex] = useState(-1);
  const [lastBatchId, setLastBatchId] = useState(0);
  const [isAddressLocked, setIsAddressLocked] = useState(false);
  const [usedAllowance, setUsedAllowance] = useState('0');
  const [tokenDecimals, setTokenDecimals] = useState(18);
  const toast = useToast();
  const [totalAddresses, setTotalAddresses] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [calculationProgress, setCalculationProgress] = useState(0);
  const [validationErrors, setValidationErrors] = useState([]);

  // 添加批次上限常量
  const MAX_BATCHES = 10; // 每次最多处理10个批次（2000个地址）

  // 更新代币信息的函数
  const updateTokenInfo = useCallback(async () => {
    if (!tokenAddress || !account) {
      console.log('缺少必要信息:', { tokenAddress, account });
      return;
    }
    
    try {
      console.log('开始获取代币信息...');
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
      
      // 并行获取代币信息
      console.log('调用合约方法...');
      const [symbol, balance, decimals] = await Promise.all([
        tokenContract.symbol(),
        tokenContract.balanceOf(account),
        tokenContract.decimals()
      ]);
      
      console.log('获取到代币信息:', { 
        symbol,
        balance: balance.toString(),
        decimals,
        formattedBalance: ethers.utils.formatUnits(balance, decimals)
      });
      
      // 立即更新状态
      setTokenSymbol(symbol);
      setTokenDecimals(decimals);
      setTokenBalance(ethers.utils.formatUnits(balance, decimals));

      // 打印更新后的状态
      console.log('状态更新后的值:', {
        tokenSymbol: symbol,
        tokenDecimals: decimals,
        tokenBalance: ethers.utils.formatUnits(balance, decimals)
      });

    } catch (error) {
      console.error('获取代币信息失败:', error);
      setTokenSymbol('');
      setTokenBalance('0');
      setTokenDecimals(18);
      
      toast({
        title: '获取代币信息失败',
        description: '请确认合约地址是否正确',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  }, [tokenAddress, account, toast]);

  // 添加 useEffect 监听代币地址变化
  useEffect(() => {
    if (tokenAddress && account) {
      console.log('代币地址或账户变化，重新获取代币信息');
      updateTokenInfo();
    }
  }, [tokenAddress, account, updateTokenInfo]);

  // 处理代币地址变化的函数
  const handleTokenAddressChange = useCallback(async (e) => {
    const newAddress = e.target.value;
    console.log('代币地址变化:', newAddress);
    
    setTokenAddress(newAddress);
    
    // 清除旧的代币信息
    setTokenSymbol('');
    setTokenBalance('0');
    setTokenDecimals(18);
    setTotalAmount('0');
    
    // 如果是有效的以太坊地址，则获取代币信息
    if (ethers.utils.isAddress(newAddress)) {
      console.log('有效的以太坊地址，开始获取代币信息');
      try {
        // 先用测试函数检查
        const tokenInfo = await testTokenInfo(newAddress);
        console.log('测试获取的代币信息:', tokenInfo);
        
        // 然后再调用正常的更新函数
        updateTokenInfo();
      } catch (error) {
        console.error('测试获取代币信息失败:', error);
      }
    } else {
      console.log('无效的以太坊地址');
    }
  }, [updateTokenInfo]);

  // 添加本地存储键
  const STORAGE_KEY = `batch_transfer_${account || 'default'}`;

  // 修改保存状态到本地存储的逻辑
  useEffect(() => {
    if (account && batches.length > 0) {
      try {
        const BATCH_KEY_PREFIX = `batch_transfer_${account}_batch_`;
        
        // 只保存基本信息和未完成的批次ID
        const incompleteBatches = batches.filter(
          batch => batch.status !== BatchStatus.COMPLETED
        );
        
        const basicInfo = {
          tokenAddress,
          tokenSymbol,
          completedBatches,
          lastBatchId,
          batchIds: incompleteBatches.map(batch => batch.id)
        };
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(basicInfo));
        
        // 清理已完成批次的存储
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith(BATCH_KEY_PREFIX)) {
            const batchId = parseInt(key.replace(BATCH_KEY_PREFIX, ''));
            const batch = batches.find(b => b.id === batchId);
            if (!batch || batch.status === BatchStatus.COMPLETED) {
              localStorage.removeItem(key);
            }
          }
        });
        
        // 只保存未完成批次的详细信息
        incompleteBatches.forEach(batch => {
          const batchKey = BATCH_KEY_PREFIX + batch.id;
          const batchData = {
            id: batch.id,
            addresses: batch.addresses,
            amounts: batch.amounts.map(amount => amount.toString()),
            status: batch.status,
            error: batch.error,
            txHash: batch.txHash
          };
          
          try {
            localStorage.setItem(batchKey, JSON.stringify(batchData));
          } catch (error) {
            console.error(`批次 #${batch.id} 数据保存失败:`, error);
            // 如果保存失败，尝试只保存最基本的信息
            const minimalBatchData = {
              id: batch.id,
              status: batch.status,
              error: batch.error,
              txHash: batch.txHash,
              addressCount: batch.addresses.length
            };
            try {
              localStorage.setItem(batchKey, JSON.stringify(minimalBatchData));
            } catch (e) {
              console.error(`批次 #${batch.id} 最小数据保存也失败:`, e);
            }
          }
        });
      } catch (error) {
        console.error('保存状态失败:', error);
        toast({
          title: '部分状态保存失败',
          description: '只保存了未完成的批次信息',
          status: 'warning',
          duration: 3000,
          isClosable: true,
          position: 'top-right',
        });
      }
    }
  }, [account, batches, tokenAddress, tokenSymbol, completedBatches, lastBatchId]);

  // 修改从本地存储恢复状态的逻辑
  useEffect(() => {
    if (account) {
      try {
        const savedBasicInfo = localStorage.getItem(STORAGE_KEY);
        if (savedBasicInfo) {
          const {
            tokenAddress: savedTokenAddress,
            tokenSymbol: savedTokenSymbol,
            completedBatches: savedCompletedBatches,
            lastBatchId: savedLastBatchId,
            batchIds
          } = JSON.parse(savedBasicInfo);

          // 恢复基本状态
          setTokenAddress(savedTokenAddress);
          setTokenSymbol(savedTokenSymbol);
          setCompletedBatches(savedCompletedBatches);
          setLastBatchId(savedLastBatchId);

          // 恢复未完成的批次数据
          const BATCH_KEY_PREFIX = `batch_transfer_${account}_batch_`;
          const recoveredBatches = [];
          
          for (const batchId of batchIds) {
            const batchKey = BATCH_KEY_PREFIX + batchId;
            const batchData = localStorage.getItem(batchKey);
            
            if (batchData) {
              const parsedBatch = JSON.parse(batchData);
              // 检查是否是最小化数据
              if (!parsedBatch.addresses) {
                // 如果是最小化数据，跳过恢复
                continue;
              }
              // 将金额字符串转回 BigNumber
              parsedBatch.amounts = parsedBatch.amounts.map(amount => 
                ethers.BigNumber.from(amount)
              );
              recoveredBatches.push(parsedBatch);
            }
          }

          if (recoveredBatches.length > 0) {
            setBatches(recoveredBatches);
            
            // 找到第一个未完成的批次的索引
            const nextBatchIndex = recoveredBatches.findIndex(
              batch => batch.status !== BatchStatus.COMPLETED
            );
            if (nextBatchIndex !== -1) {
              setCurrentBatchIndex(nextBatchIndex);
            }

            toast({
              title: '已恢复未完成的转账进度',
              description: `恢复了 ${recoveredBatches.length} 个未完成的批次`,
              status: 'info',
              duration: 2000,
              isClosable: true,
              position: 'top-right',
            });
          }
        }
      } catch (error) {
        console.error('恢复状态失败:', error);
        // 清理所有相关的存储
        const BATCH_KEY_PREFIX = `batch_transfer_${account}_batch_`;
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith(BATCH_KEY_PREFIX)) {
            localStorage.removeItem(key);
          }
        });
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, [account]);

  // 添加页面刷新/关闭事件监听
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (account) {
        localStorage.removeItem(STORAGE_KEY);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [account]);

  // 添加重置所有状态的函数
  const resetAllStates = useCallback(() => {
    // 清除本地存储
    localStorage.removeItem(STORAGE_KEY);
    
    // 重置所有状态
    setTokenAddress('');
    setAddressList('');
    setLoading(false);
    setTokenBalance('0');
    setTokenSymbol('');
    setTotalAmount('0');
    setValidationError('');
    setIsTransferSuccess(false);
    setBatches([]);
    setCompletedBatches(0);
    setTotalGasUsed('0');
    setCurrentBatchIndex(-1);
    setLastBatchId(0);
    setIsAddressLocked(false);
    setUsedAllowance('0');
    setTokenDecimals(18);
  }, []);

  // 修改清除数据的函数
  const clearTransferData = () => {
    if (account) {
      // 清除所有批次数据
      const BATCH_KEY_PREFIX = `batch_transfer_${account}_batch_`;
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(BATCH_KEY_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
      localStorage.removeItem(STORAGE_KEY);
    }
    
    // 重置所有状态
    resetAllStates();
  };

  // 修改连接钱包的监听
  useEffect(() => {
    if (!account) {
      // 当钱包断开连接时，重置所有状态
      resetAllStates();
    }
  }, [account, resetAllStates]);

  // 修改页面刷新/关闭事件监听
  useEffect(() => {
    const handleBeforeUnload = () => {
      resetAllStates();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [resetAllStates]);

  // 修改重置表单函数
  const resetTransferForm = () => {
    resetAllStates();
    if (account) {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  // 修改清除已完成转账记录的函数
  const clearCompletedTransfers = () => {
    resetAllStates();
    toast({
      title: '已清除转账记录',
      description: '您可以开始新的转账',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  // 修改序号样式处理函数
  const formatDisplayValue = (value) => {
    if (!value) return null;
    
    return value.split('\n').map((line, index) => {
      const match = line.match(/^(\d{3})\.\s*(.*)/);
      if (match) {
        const [_, number, rest] = match;
        return (
          <Box key={`line-${index}`} display="flex" alignItems="center">
            <Text
              as="span"
              color="rgba(255, 255, 255, 0.4)"
              fontWeight="500"
              marginRight="8px"
              fontFamily="'Roboto Mono', monospace"
              minWidth="3.5em"
              userSelect="none"
              pointerEvents="none"
            >
              {number}.
            </Text>
            <Text as="span" flex="1">
              {rest}
            </Text>
          </Box>
        );
      }
      return <Box key={`line-${index}`}>{line}</Box>;
    });
  };

  const validateAddress = (address) => {
    // 检查地址格式
    if (!address.match(/^0x[a-fA-F0-9]{40}$/)) {
      return false;
    }
    return true;
  };

  const handleAddressListChange = (e) => {
    if (isAddressLocked) {
      return;
    }

    const textarea = e.target;
    const newValue = textarea.value;
    const lines = newValue.split('\n');
    const errors = [];
    let totalTransferAmount = ethers.BigNumber.from(0);
    
    // 格式化每一行
    const formattedLines = lines.map((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) return '';
      
      // 移除所有已有的序号格式，包括可能的点号和空格
      const cleanLine = trimmed.replace(/^(\d{3,4}\.?\s*)+/, '').trim();
      
      // 验证地址格式和金额
      const parts = cleanLine.split(/[,\s]+/);
      if (parts.length >= 2) {
        const address = parts[0];
        const amount = parts[1];
        
        if (!validateAddress(address)) {
          errors.push({
            line: index + 1,
            message: `第 ${index + 1} 行: 无效的地址格式 "${address}"`
          });
        }
        
        // 验证并累加金额
        if (!isNaN(amount) && parseFloat(amount) > 0) {
          try {
            const amountInWei = ethers.utils.parseUnits(amount, tokenDecimals);
            totalTransferAmount = totalTransferAmount.add(amountInWei);
          } catch (error) {
            errors.push({
              line: index + 1,
              message: `第 ${index + 1} 行: 金额格式错误 "${amount}"`
            });
          }
        } else {
          errors.push({
            line: index + 1,
            message: `第 ${index + 1} 行: 无效的金额 "${amount}"`
          });
        }
      } else if (cleanLine.length > 0) {
        errors.push({
          line: index + 1,
          message: `第 ${index + 1} 行: 缺少转账金额`
        });
      }
      
      // 添加新的序号（即使数据无效也添加序号）
      const num = (index + 1).toString().padStart(3, '0');
      return cleanLine ? `${num}. ${cleanLine}` : '';
    });
    
    // 过滤掉空行，但保持其他行的序号连续
    const filteredLines = formattedLines.filter(line => line.trim());
    const renumberedLines = filteredLines.map((line, index) => {
      const num = (index + 1).toString().padStart(3, '0');
      const content = line.replace(/^(\d{3,4}\.?\s*)+/, '').trim();
      return `${num}. ${content}`;
    });

    const formattedContent = renumberedLines.join('\n');
    setAddressList(formattedContent);
    
    // 立即更新总金额
    setTotalAmount(ethers.utils.formatUnits(totalTransferAmount, tokenDecimals));
    
    // 如果有错误，显示 toast 提示
    if (errors.length > 0) {
      // 最多显示前3个错误
      const displayErrors = errors.slice(0, 3);
      const hasMore = errors.length > 3;
      
      toast({
        title: '地址格式错误',
        description: (
          <VStack align="start" spacing={1}>
            {displayErrors.map((error, index) => (
              <Text key={index}>{error.message}</Text>
            ))}
            {hasMore && <Text>{`还有 ${errors.length - 3} 个错误...`}</Text>}
          </VStack>
        ),
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
    }
    
    setValidationErrors(errors);
    
    // 更新有效地址数量
    const validLines = renumberedLines.filter(line => {
      const cleanLine = line.replace(/^(\d{3,4}\.?\s*)+/, '').trim();
      const parts = cleanLine.split(/[,\s]+/);
      return parts.length >= 2 && validateAddress(parts[0]) && !isNaN(parts[1]) && parseFloat(parts[1]) > 0;
    });
    setTotalAddresses(validLines.length);
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const textarea = e.target;
    const pastedText = e.clipboardData.getData('text');
    const currentLines = addressList.split('\n').filter(line => line.trim());
    const startIndex = currentLines.length + 1;
    let totalTransferAmount = ethers.BigNumber.from(0);
    const errors = [];

    // 处理粘贴的内容
    const newLines = pastedText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line)
      .map(line => {
        // 移除所有已有的序号格式
        return line.replace(/^(\d{3,4}\.?\s*)+/, '');
      });

    // 合并当前内容和新内容
    const allLines = [
      ...currentLines.map(line => line.replace(/^(\d{3,4}\.?\s*)+/, '')),
      ...newLines
    ];

    // 处理所有行
    const formattedLines = allLines.map((line, index) => {
      const parts = line.split(/[,\s]+/);
      if (parts.length >= 2) {
        const address = parts[0];
        const amount = parts[1];

        // 验证地址
        if (!validateAddress(address)) {
          errors.push({
            line: index + 1,
            message: `第 ${index + 1} 行: 无效的地址格式 "${address}"`
          });
        }

        // 验证并累加金额
        if (!isNaN(amount) && parseFloat(amount) > 0) {
          try {
            const amountInWei = ethers.utils.parseUnits(amount, tokenDecimals);
            totalTransferAmount = totalTransferAmount.add(amountInWei);
          } catch (error) {
            errors.push({
              line: index + 1,
              message: `第 ${index + 1} 行: 金额格式错误 "${amount}"`
            });
          }
        } else {
          errors.push({
            line: index + 1,
            message: `第 ${index + 1} 行: 无效的金额 "${amount}"`
          });
        }
      }

      // 添加序号
      const num = (index + 1).toString().padStart(3, '0');
      return `${num}. ${line}`;
    });

    // 合并内容
    const formattedContent = formattedLines.join('\n');
    setAddressList(formattedContent);

    // 更新总金额
    setTotalAmount(ethers.utils.formatUnits(totalTransferAmount, tokenDecimals));

    // 显示错误提示
    if (errors.length > 0) {
      const displayErrors = errors.slice(0, 3);
      const hasMore = errors.length > 3;
      
      toast({
        title: '格式错误',
        description: (
          <VStack align="start" spacing={1}>
            {displayErrors.map((error, index) => (
              <Text key={index}>{error.message}</Text>
            ))}
            {hasMore && <Text>{`还有 ${errors.length - 3} 个错误...`}</Text>}
          </VStack>
        ),
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
    }

    // 更新有效地址数量
    const validLines = formattedLines.filter(line => {
      const cleanLine = line.replace(/^(\d{3,4}\.?\s*)+/, '').trim();
      const parts = cleanLine.split(/[,\s]+/);
      return parts.length >= 2 && validateAddress(parts[0]) && !isNaN(parts[1]) && parseFloat(parts[1]) > 0;
    });
    setTotalAddresses(validLines.length);
    setValidationErrors(errors);

    // 优化光标位置和滚动
    requestAnimationFrame(() => {
      textarea.scrollTop = textarea.scrollHeight;
      const newPosition = formattedContent.length;
      textarea.setSelectionRange(newPosition, newPosition);
      textarea.focus();
    });
  };

  // 修改按钮组件
  const TransferButton = () => (
    <Button
      width="100%"
      height="48px"
      bgGradient={styles.buttonGradient}
      color="white"
      borderRadius="16px"
      _hover={{
        bgGradient: styles.buttonHover,
        transform: "translateY(-1px)",
        boxShadow: "0px 4px 12px rgba(31, 199, 212, 0.4)"
      }}
      _active={{
        bgGradient: styles.buttonActive,
        transform: "translateY(1px)"
      }}
      isLoading={isCalculating || isExecuting}
      loadingText={isCalculating ? "计算中" : "执行中"}
      onClick={handleTransferOrReset}
      disabled={!account || isCalculating || isExecuting}
    >
      {isTransferSuccess ? "清除数据" : "执行批量转账"}
    </Button>
  );

  // 在统计信息区域添加总地址数显示
  const StatisticsDisplay = () => (
    <Grid templateColumns="repeat(3, 1fr)" gap={4} w="full">
      <Box
        p={4}
        bg="rgba(19, 23, 64, 0.5)"
        borderRadius="16px"
        border="1px solid"
        borderColor={styles.cardBorder}
        boxShadow="inset 0px 2px 4px -2px rgba(14, 14, 44, 0.2)"
      >
        <VStack align="start" spacing={1}>
          <Text color={styles.textSecondary} fontSize="sm">当前地址数</Text>
          <Text color={styles.textPrimary} fontSize="xl" fontWeight="600">
            {totalAddresses}
          </Text>
        </VStack>
      </Box>
      <Box
        p={4}
        bg="rgba(19, 23, 64, 0.5)"
        borderRadius="16px"
        border="1px solid"
        borderColor={styles.cardBorder}
        boxShadow="inset 0px 2px 4px -2px rgba(14, 14, 44, 0.2)"
      >
        <VStack align="start" spacing={1}>
          <Text color={styles.textSecondary} fontSize="sm">总批次数</Text>
          <Text color={styles.textPrimary} fontSize="xl" fontWeight="600">
            {batches.length}
          </Text>
        </VStack>
      </Box>
      <Box
        p={4}
        bg="rgba(19, 23, 64, 0.5)"
        borderRadius="16px"
        border="1px solid"
        borderColor={styles.cardBorder}
        boxShadow="inset 0px 2px 4px -2px rgba(14, 14, 44, 0.2)"
      >
        <VStack align="start" spacing={1}>
          <Text color={styles.textSecondary} fontSize="sm">已完成批次</Text>
          <Text color={styles.textPrimary} fontSize="xl" fontWeight="600">
            {completedBatches}
          </Text>
        </VStack>
      </Box>
    </Grid>
  );

  // 1. 首先声明基础功能函数
  const executeBatchTransfer = async (addresses, amounts, batchId) => {
    try {
      // 检查地址和金额数组的长度
      if (addresses.length === 0 || amounts.length === 0) {
        throw new Error('地址或金额数组为空');
      }

      if (addresses.length !== amounts.length) {
        throw new Error('地址和金额数组长度不匹配');
      }

      if (addresses.length > 200) {
        throw new Error('单批次地址数量超过限制(200)');
      }

      // 验证每个地址的格式
      for (let i = 0; i < addresses.length; i++) {
        if (!ethers.utils.isAddress(addresses[i])) {
          throw new Error(`无效的地址格式: ${addresses[i]}`);
        }
      }

      // 验证每个金额是否为有效的 BigNumber
      for (let i = 0; i < amounts.length; i++) {
        if (!ethers.BigNumber.isBigNumber(amounts[i]) || amounts[i].lte(0)) {
          throw new Error(`无效的转账金额: ${amounts[i].toString()}`);
        }
      }

      // 更新批次状态为处理中
      setBatches(prev => prev.map(batch => 
        batch.id === batchId 
          ? { 
              ...batch, 
              status: BatchStatus.PROCESSING,
              error: null
            }
          : batch.id > batchId
          ? {
              ...batch,
              status: BatchStatus.PENDING,
              error: "等待前序交易完成"
            }
          : batch
      ));

      // 初始化 provider 和 signer
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      const batchTransferContract = new ethers.Contract(
        BATCH_TRANSFER_ADDRESS,
        BATCH_TRANSFER_ABI,
        signer
      );

      // 获取每个地址的手续费
      const feePerAddress = await batchTransferContract.feePerAddress();
      const totalFee = feePerAddress.mul(addresses.length);

      // 检查 DFC 余额
      const balance = await provider.getBalance(account);
      if (balance.lt(totalFee)) {
        throw new Error('DFC余额不足以支付手续费');
      }

      console.log('准备执行批量转账:', {
        batchId,
        addressCount: addresses.length,
        addresses: addresses.slice(0, 3), // 只打印前三个地址用于调试
        amounts: amounts.slice(0, 3).map(a => a.toString()), // 只打印前三个金额用于调试
        totalFee: totalFee.toString()
      });

      // 执行批量转账
      const tx = await batchTransferContract.batchTransfer(
        tokenAddress,
        addresses,
        amounts,
        { value: totalFee }
      ).catch(error => {
        // 检查是否是用户取消交易
        if (error.message.includes('user rejected transaction')) {
          // 更新所有批次状态
          setBatches(prev => prev.map(batch => ({
            ...batch,
            status: batch.id === batchId ? BatchStatus.FAILED : BatchStatus.TERMINATED,
            error: batch.id === batchId ? '用户取消了交易' : '已终止'
          })));
          
          // 更改按钮状态
          setIsTransferSuccess(true);
          
          // 显示提示
          toast({
            title: '转账已取消',
            description: '所有后续批次已终止',
            status: 'info',
            duration: 3000,
            isClosable: true,
            position: 'top-right',
          });
        }
        throw error;
      });

      console.log('交易已发送:', tx.hash);

      // 等待交易确认
      const receipt = await tx.wait();
      console.log('交易已确认:', receipt);

      // 更新批次状态为完成
      setBatches(prev => prev.map(batch => {
        if (batch.id === batchId) {
          return { 
            ...batch, 
            status: BatchStatus.COMPLETED,
            txHash: receipt.transactionHash,
            error: null
          };
        }
        return batch;
      }));

      setCompletedBatches(prev => prev + 1);
      return true;

    } catch (error) {
      console.error(`批次 #${batchId + 1} 转账失败:`, error);
      
      // 如果不是用户取消（因为已经在上面处理过），则显示错误
      if (!error.message.includes('user rejected transaction')) {
        setBatches(prev => prev.map(batch => ({
          ...batch,
          status: batch.id === batchId ? BatchStatus.FAILED : BatchStatus.TERMINATED,
          error: batch.id === batchId ? error.message : '已终止'
        })));
        
        setIsTransferSuccess(true);
      }
      
      throw error;
    }
  };

  // 2. 然后声明依赖于基础功能的函数
  const handleRetry = useCallback(async (batchId) => {
    const batch = batches.find(b => b.id === batchId);
    if (!batch) return;

    // 检查前序批次是否都已完成
    const hasPendingPreviousBatch = batches.some(b => 
      b.id < batchId && b.status !== BatchStatus.COMPLETED
    );

    if (hasPendingPreviousBatch) {
      toast({
        title: '无法执行',
        description: '请先完成前序批次的转账',
        status: 'warning',
        duration: 2000,
        isClosable: true,
        position: 'top-right',
      });
      return;
    }

    // 设置当前批次
    setCurrentBatchIndex(batchId);
    
    // 更新批次状态
    setBatches(prev => prev.map(b => {
      if (b.id === batchId) {
        return {
          ...b,
          status: BatchStatus.PENDING,
          error: null
        };
      }
      if (b.id > batchId) {
        return {
          ...b,
          status: BatchStatus.PENDING,
          error: "等待前序交易完成"
        };
      }
      return b;
    }));
    
    // 触发转账
    try {
      await executeBatchTransfer(
        batch.addresses,
        batch.amounts,
        batch.id
      );
      
      setCompletedBatches(prev => prev + 1);
      
      // 如果当前批次成功，自动执行下一个批次
      const nextBatchIndex = batchId + 1;
      const nextBatch = batches.find(b => b.id === nextBatchIndex);
      if (nextBatch) {
        setCurrentBatchIndex(nextBatchIndex);
        await executeBatchTransfer(
          nextBatch.addresses,
          nextBatch.amounts,
          nextBatch.id
        );
      }
    } catch (error) {
      console.error(`批次 #${batch.id + 1} 执行失败:`, error);
      // 失败后保持在当前状态
    }
  }, [batches, executeBatchTransfer, toast]);

  // 3. 最后声明用户交互函数
  const handleBatchTransfer = async () => {
    try {
      setIsCalculating(true);
      setCalculationProgress(0);
      
      await checkAndSwitchNetwork();
      setCalculationProgress(20);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
      
      setCalculationProgress(40);

      // 计算总转账金额
      const lines = addressList.split('\n').filter(line => line.trim());
      let totalTransferAmount = ethers.BigNumber.from(0);
      const addresses = [];
      const amounts = [];

      // 修改地址和金额的解析逻辑
      for (const line of lines) {
        // 移除序号并分割地址和金额
        const cleanLine = line.replace(/^\d{3,4}\.\s+/, '').trim();
        const parts = cleanLine.split(/[,\s]+/);
        
        if (parts.length >= 2) {
          const address = parts[0];
          const amount = parts[1];
          
          // 验证地址格式
          if (!validateAddress(address)) {
            throw new Error(`无效的地址格式: ${address}`);
          }
          
          // 验证并转换金额
          try {
            const amountInWei = ethers.utils.parseUnits(amount, tokenDecimals);
            if (amountInWei.lte(0)) {
              throw new Error(`无效的转账金额: ${amount}`);
            }
            totalTransferAmount = totalTransferAmount.add(amountInWei);
            addresses.push(address);
            amounts.push(amountInWei);
          } catch (error) {
            throw new Error(`第 ${addresses.length + 1} 行金额格式错误: ${amount}`);
          }
        } else {
          throw new Error(`第 ${addresses.length + 1} 行格式错误，缺少地址或金额`);
        }
      }

      if (addresses.length === 0) {
        throw new Error('没有找到有效的地址和金额');
      }

      // 更新总转账金额显示
      setTotalAmount(ethers.utils.formatUnits(totalTransferAmount, tokenDecimals));

      // 检查代币余额
      const balance = await tokenContract.balanceOf(account);
      if (balance.lt(totalTransferAmount)) {
        throw new Error('代币余额不足');
      }

      // 检查授权
      const allowance = await tokenContract.allowance(account, BATCH_TRANSFER_ADDRESS);
      if (allowance.lt(totalTransferAmount)) {
        // 如果授权不足，请求用户授权
        try {
          const tx = await tokenContract.approve(
            BATCH_TRANSFER_ADDRESS,
            totalTransferAmount
          );
          setIsCalculating(false);
          setIsExecuting(true);
          await tx.wait();
          console.log('授权成功');
        } catch (error) {
          setIsExecuting(false);
          throw new Error('代币授权失败: ' + error.message);
        }
      }

      setCalculationProgress(60);

      // 将地址分批，每批最多200个地址
      const batchSize = 200;
      const batchCount = Math.ceil(addresses.length / batchSize);
      const newBatches = [];

      for (let i = 0; i < batchCount; i++) {
        const start = i * batchSize;
        const end = Math.min(start + batchSize, addresses.length);
        const batchAddresses = addresses.slice(start, end);
        const batchAmounts = amounts.slice(start, end);

        newBatches.push({
          id: lastBatchId + i,
          addresses: batchAddresses,
          amounts: batchAmounts,
          status: i === 0 ? BatchStatus.PENDING : BatchStatus.PENDING,
          error: i === 0 ? null : "等待前序交易完成",
          txHash: null
        });
      }

      setBatches(newBatches);
      setLastBatchId(lastBatchId + batchCount);
      setIsAddressLocked(true);
      setCalculationProgress(80);

      // 开始执行第一个批次的转账
      try {
        setCurrentBatchIndex(newBatches[0].id);
        await executeBatchTransfer(
          newBatches[0].addresses,
          newBatches[0].amounts,
          newBatches[0].id
        );
        
        // 如果第一个批次成功，继续执行后续批次
        for (let i = 1; i < newBatches.length; i++) {
          const currentBatch = newBatches[i];
          setCurrentBatchIndex(currentBatch.id);
          await executeBatchTransfer(
            currentBatch.addresses,
            currentBatch.amounts,
            currentBatch.id
          );
        }
      } catch (error) {
        // 错误已在 executeBatchTransfer 中处理，这里不需要额外处理
        console.error('批量转账执行失败:', error);
      }

      setCalculationProgress(100);
      setIsCalculating(false);
      setIsExecuting(false);
      
    } catch (error) {
      console.error('批量转账失败:', error);
      setIsCalculating(false);
      setIsExecuting(false);
      setCalculationProgress(0);
      toast({
        title: '转账失败',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleTransferOrReset = () => {
    if (isTransferSuccess || batches.some(batch => batch.status === BatchStatus.FAILED)) {
      // 重置表单
      setAddressList('');
      setBatches([]);
      setTotalAmount('0');
      setIsTransferSuccess(false);
      setCompletedBatches(0);
      setCurrentBatchIndex(-1);
      setIsAddressLocked(false);
      setValidationErrors([]);
    } else {
      // 检查是否有验证错误
      if (validationErrors.length > 0) {
        toast({
          title: '无法执行转账',
          description: '请先修正地址格式错误',
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: 'top-right',
        });
        return;
      }
      // 执行转账
      handleBatchTransfer();
    }
  };

  const renderTransactionHash = (hash) => {
    if (!hash) return null;
    
    const dfcExplorerUrl = `https://dfscan.dfcscan.io/tx/${hash}`;
    
    return (
      <Link
        href={dfcExplorerUrl}
        target="_blank"
        rel="noopener noreferrer"
        color="rgb(31, 199, 212)"
        _hover={{
          color: 'rgb(31, 199, 212, 0.8)',
          textDecoration: 'underline'
        }}
        wordBreak="break-all"
        fontSize="sm"
      >
        {hash}
      </Link>
    );
  };

  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      right="0"
      bottom="0"
      bgGradient={styles.gradientBg}
      overflowY="auto"
      sx={{
        '&:before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            radial-gradient(circle at 20% 30%, rgba(31, 199, 212, 0.04) 0%, transparent 30%),
            radial-gradient(circle at 80% 70%, rgba(31, 199, 212, 0.04) 0%, transparent 30%),
            radial-gradient(circle at 50% 50%, rgba(31, 199, 212, 0.02) 0%, transparent 60%)
          `,
          pointerEvents: 'none'
        },
        '&::-webkit-scrollbar': {
          width: '8px'
        },
        '&::-webkit-scrollbar-track': {
          background: 'rgba(0, 0, 0, 0.1)',
          borderRadius: '4px'
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'rgba(31, 199, 212, 0.3)',
          borderRadius: '4px',
          '&:hover': {
            background: 'rgba(31, 199, 212, 0.5)'
          }
        }
      }}
    >
      <Grid
        templateColumns={{ base: "1fr", lg: "3fr 2fr" }}
        gap={6}
        maxW="1200px"
        mx="auto"
        p="6"
        h="100vh"
        pt="8"
      >
        {/* 左侧主要操作区域 */}
        <GridItem>
          <Box
            p="6"
            bg="rgba(39, 38, 44, 0.7)"
            borderRadius="24px"
            border="1px solid"
            borderColor={styles.cardBorder}
            backdropFilter="blur(20px)"
            boxShadow="0px 8px 28px -6px rgba(14, 14, 44, 0.4), 0px 18px 88px -12px rgba(14, 14, 44, 0.3)"
            height="calc(100vh - 4rem)"
            display="flex"
            flexDirection="column"
            position="relative"
            overflow="hidden"
            _before={{
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)'
            }}
          >
            <VStack spacing="6" flex="1">
              {/* 标题 */}
              <Text
                fontSize="24px"
                fontWeight="600"
                color={styles.textPrimary}
                textAlign="center"
                mb="2"
              >
                批量转账工具
              </Text>

              {/* 主要内容区域 */}
              <Box
                bg="rgba(39, 38, 44, 0.5)"
                borderRadius="20px"
                border="1px solid"
                borderColor={styles.cardBorder}
                p="5"
                w="full"
                boxShadow="inset 0px 2px 4px -2px rgba(14, 14, 44, 0.2)"
              >
                {/* 钱包连接按钮 */}
                <Button
                  onClick={connectWallet}
                  w="full"
                  height="48px"
                  bgGradient={styles.buttonGradient}
                  color="white"
                  borderRadius="16px"
                  mb="4"
                  _hover={{
                    bgGradient: styles.buttonHover,
                    transform: "translateY(-1px)",
                    boxShadow: "0px 4px 12px rgba(31, 199, 212, 0.4)"
                  }}
                  _active={{
                    bgGradient: styles.buttonActive,
                    transform: "translateY(1px)"
                  }}
                >
                  {account ? `已连接: ${account.slice(0, 6)}...${account.slice(-4)}` : "连接钱包"}
                </Button>

                {/* 代币地址输入框 */}
                <InputGroup mb="4">
                  <Input
                    placeholder="请输入代币合约地址"
                    value={tokenAddress}
                    onChange={handleTokenAddressChange}
                    bg="rgba(19, 23, 64, 0.5)"
                    border="1px solid"
                    borderColor={styles.inputBorder}
                    color={styles.textPrimary}
                    height="48px"
                    isDisabled={isAddressLocked}
                    _disabled={{
                      opacity: 0.7,
                      cursor: 'not-allowed',
                      backgroundColor: styles.inputBgLocked
                    }}
                    _hover={{
                      borderColor: 'rgba(31, 199, 212, 0.4)'
                    }}
                    _focus={{
                      borderColor: 'rgb(31, 199, 212)',
                      boxShadow: '0 0 0 1px rgb(31, 199, 212)'
                    }}
                  />
                  <InputRightElement height="48px">
                    <InfoIcon color={styles.textSecondary} />
                  </InputRightElement>
                </InputGroup>

                {/* 代币信息和转账总量显示 */}
                <HStack spacing={4} w="full" mb="6">
                  <Box
                    flex="1"
                    p={4}
                    bg="rgba(19, 23, 64, 0.5)"
                    borderRadius="16px"
                    border="1px solid"
                    borderColor={styles.cardBorder}
                    boxShadow="inset 0px 2px 4px -2px rgba(14, 14, 44, 0.2)"
                  >
                    <VStack align="start" spacing={1}>
                      <Text color={styles.textSecondary} fontSize="sm">钱包余额</Text>
                      <HStack spacing={2} align="baseline">
                        <Text color={styles.textPrimary} fontSize="xl" fontWeight="600">
                          {tokenBalance ? Number(tokenBalance).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          }) : '0.00'}
                        </Text>
                        <Text color={styles.textSecondary} fontSize="sm">
                          {tokenSymbol || '-'}
                        </Text>
                      </HStack>
                    </VStack>
                  </Box>
                  <Box
                    flex="1"
                    p={4}
                    bg="rgba(19, 23, 64, 0.5)"
                    borderRadius="16px"
                    border="1px solid"
                    borderColor={styles.cardBorder}
                    boxShadow="inset 0px 2px 4px -2px rgba(14, 14, 44, 0.2)"
                  >
                    <VStack align="start" spacing={1}>
                      <Text color={styles.textSecondary} fontSize="sm">本次转账总量</Text>
                      <HStack spacing={2} align="baseline">
                        <Text color={styles.textPrimary} fontSize="xl" fontWeight="600">
                          {totalAmount ? Number(totalAmount).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          }) : '0.00'}
                        </Text>
                        <Text color={styles.textSecondary} fontSize="sm">
                          {tokenSymbol || '-'}
                        </Text>
                      </HStack>
                    </VStack>
                  </Box>
                </HStack>

                {/* 地址列表输入框 */}
                <Box mb="6">
                  <Textarea
                    value={addressList}
                    onChange={handleAddressListChange}
                    onPaste={handlePaste}
                    placeholder="请输入地址和金额，每行一个，格式为：地址,金额"
                    isDisabled={isAddressLocked}
                    style={{
                      width: '100%',
                      minHeight: '300px',
                      maxHeight: '400px',
                      overflowY: 'auto',
                      whiteSpace: 'pre',
                      fontFamily: "'Roboto Mono', monospace",
                      fontSize: '14px',
                      lineHeight: '1.6',
                      padding: '12px',
                      backgroundColor: isAddressLocked ? styles.inputBgLocked : 'rgba(19, 23, 64, 0.5)',
                      color: styles.textPrimary,
                      border: '1px solid ' + styles.inputBorder,
                      borderRadius: '16px',
                      caretColor: styles.textPrimary,
                      opacity: isAddressLocked ? 0.7 : 1,
                      cursor: isAddressLocked ? 'not-allowed' : 'text'
                    }}
                    _hover={{
                      borderColor: validationErrors.length > 0 ? 'rgb(229, 62, 62)' : 'rgba(31, 199, 212, 0.4)'
                    }}
                    _focus={{
                      borderColor: validationErrors.length > 0 ? 'rgb(229, 62, 62)' : 'rgb(31, 199, 212)',
                      boxShadow: validationErrors.length > 0 ? '0 0 0 1px rgb(229, 62, 62)' : '0 0 0 1px rgb(31, 199, 212)'
                    }}
                  />
                </Box>

                {/* 执行按钮 */}
                <TransferButton />
              </Box>
            </VStack>
          </Box>
        </GridItem>

        {/* 右侧状态区域 */}
        <GridItem>
          <Box
            p="6"
            bg="rgba(39, 38, 44, 0.7)"
            borderRadius="24px"
            border="1px solid"
            borderColor={styles.cardBorder}
            backdropFilter="blur(20px)"
            boxShadow="0px 8px 28px -6px rgba(14, 14, 44, 0.4), 0px 18px 88px -12px rgba(14, 14, 44, 0.3)"
            height="calc(100vh - 4rem)"
            position="relative"
            overflow="hidden"
            _before={{
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)'
            }}
          >
            <VStack spacing="6" flex="1" h="full">
              {/* 标题 */}
              <Text
                fontSize="24px"
                fontWeight="600"
                color={styles.textPrimary}
                textAlign="center"
                mb="2"
              >
                转账详情
              </Text>

              <Box
                bg="rgba(39, 38, 44, 0.5)"
                borderRadius="20px"
                border="1px solid"
                borderColor={styles.cardBorder}
                p="5"
                w="full"
                flex="1"
                display="flex"
                flexDirection="column"
                boxShadow="inset 0px 2px 4px -2px rgba(14, 14, 44, 0.2)"
              >
                <VStack spacing="6" flex="1" overflowY="auto"
                  sx={{
                    '&::-webkit-scrollbar': {
                      width: '4px'
                    },
                    '&::-webkit-scrollbar-track': {
                      background: 'rgba(0,0,0,0.1)',
                      borderRadius: '4px'
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: 'rgba(31, 199, 212, 0.5)',
                      borderRadius: '4px',
                      '&:hover': {
                        background: 'rgba(31, 199, 212, 0.7)'
                      }
                    }
                  }}
                >
                  {/* 统计信息 */}
                  <StatisticsDisplay />

                  {/* 批次列表 */}
                  <VStack spacing="3" align="stretch" w="full">
                    {batches.map((batch) => (
                      <BatchCard
                        key={batch.id}
                        batch={batch}
                        batches={batches}
                        tokenSymbol={tokenSymbol}
                        tokenDecimals={tokenDecimals}
                        setAddressList={setAddressList}
                        setIsAddressLocked={setIsAddressLocked}
                        setIsTransferSuccess={setIsTransferSuccess}
                        setCurrentBatchIndex={setCurrentBatchIndex}
                        styles={styles}
                        onRetry={handleRetry}
                      />
                    ))}
                  </VStack>
                </VStack>
              </Box>
            </VStack>
          </Box>
        </GridItem>
      </Grid>

      {/* 版本号 */}
      <Text
        position="fixed"
        bottom="4"
        right="4"
        fontSize="sm"
        color={styles.textSecondary}
        opacity="0.8"
        _hover={{ opacity: 1 }}
        transition="opacity 0.2s"
      >
        v{VERSION}
      </Text>
    </Box>
  );
}

export default BatchTransfer;
