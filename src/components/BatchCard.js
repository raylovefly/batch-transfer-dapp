import React, { useCallback } from 'react';
import { ethers } from 'ethers';
import {
  Box,
  Button,
  Text,
  VStack,
  HStack,
  Alert,
  AlertIcon,
  Badge,
  Flex,
  useToast
} from '@chakra-ui/react';

// 批次状态枚举
export const BatchStatus = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  STOPPED: 'STOPPED',
};

const BatchCard = ({
  batch,
  batches,
  tokenSymbol,
  tokenDecimals,
  setAddressList,
  setIsAddressLocked,
  setIsTransferSuccess,
  setCurrentBatchIndex,
  styles,
  onRetry
}) => {
  const toast = useToast();
  const { id, addresses, amounts, status, error, txHash } = batch;

  const handleCopyAddresses = useCallback(() => {
    // 如果是失败状态，直接触发重试
    if (status === BatchStatus.FAILED) {
      onRetry(id);
      return;
    }

    // 只有在状态为 PENDING 且是下一个待执行的批次时才允许复制
    const prevBatch = batches.find(b => b.id === id - 1);
    const canCopy = status === BatchStatus.PENDING && (!prevBatch || prevBatch.status === BatchStatus.COMPLETED);
    
    if (!canCopy) {
      return;
    }

    const addressList = addresses.map((addr, idx) => {
      const amount = ethers.utils.formatUnits(amounts[idx], tokenDecimals);
      return `${addr} ${amount}`;
    }).join('\n');

    setAddressList(addressList);
    setIsAddressLocked(true);
    setIsTransferSuccess(true);
    setCurrentBatchIndex(batches.findIndex(b => b.id === id));

    // 复制到剪贴板
    navigator.clipboard.writeText(addressList);

    // 显示提示
    toast({
      title: `已复制第 ${id + 1} 批次地址`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  }, [addresses, amounts, id, tokenDecimals, setAddressList, setIsAddressLocked, setIsTransferSuccess, setCurrentBatchIndex, batches, status, toast, onRetry]);

  // 计算批次总金额
  const batchTotal = amounts.reduce((sum, amount) => sum.add(amount), ethers.BigNumber.from(0));
  const formattedTotal = ethers.utils.formatUnits(batchTotal, tokenDecimals);

  // 获取状态样式
  const getStatusStyle = () => {
    switch (status) {
      case BatchStatus.COMPLETED:
        return {
          borderColor: 'rgb(49, 208, 170)',
          boxShadow: '0 0 8px rgba(49, 208, 170, 0.2)',
          bg: 'rgba(49, 208, 170, 0.1)'
        };
      case BatchStatus.PROCESSING:
        return {
          borderColor: 'rgb(31, 199, 212)',
          boxShadow: '0 0 8px rgba(31, 199, 212, 0.2)',
          bg: 'rgba(31, 199, 212, 0.1)',
          animation: 'processing 2s linear infinite'
        };
      case BatchStatus.FAILED:
        return {
          borderColor: 'rgb(237, 75, 158)',
          boxShadow: '0 0 8px rgba(237, 75, 158, 0.2)',
          bg: 'rgba(237, 75, 158, 0.1)'
        };
      case BatchStatus.STOPPED:
        return {
          borderColor: 'rgb(128, 128, 128)',
          boxShadow: '0 0 8px rgba(128, 128, 128, 0.2)',
          bg: 'rgba(128, 128, 128, 0.1)'
        };
      case BatchStatus.PENDING:
      default:
        return {
          borderColor: 'rgba(255, 255, 255, 0.1)',
          boxShadow: 'none',
          bg: 'transparent'
        };
    }
  };

  return (
    <Box
      p="4"
      borderRadius="xl"
      border="1px solid"
      borderColor={getStatusStyle().borderColor || styles.cardBorder}
      boxShadow={getStatusStyle().boxShadow}
      bg={styles.cardBg}
      transition="all 0.3s"
      position="relative"
      overflow="hidden"
    >
      <VStack spacing="3" align="stretch">
        <Flex justify="space-between" align="center">
          <HStack>
            <Text color={styles.textPrimary} fontWeight="600">
              批次 #{id + 1}
            </Text>
            <Badge
              colorScheme={
                status === BatchStatus.COMPLETED ? 'green' :
                status === BatchStatus.PROCESSING ? 'blue' :
                status === BatchStatus.FAILED ? 'red' :
                status === BatchStatus.STOPPED ? 'gray' :
                'yellow'
              }
            >
              {status === BatchStatus.COMPLETED ? '完成' :
               status === BatchStatus.PROCESSING ? '执行中' :
               status === BatchStatus.FAILED ? '失败' :
               status === BatchStatus.STOPPED ? '已终止' : 
               '等待中'}
            </Badge>
          </HStack>
          {status !== BatchStatus.COMPLETED && (
            <Button
              size="sm"
              colorScheme="blue"
              onClick={handleCopyAddresses}
              isDisabled={
                status === BatchStatus.PROCESSING ||
                (status === BatchStatus.PENDING && batches.some(b => 
                  b.id < id && b.status !== BatchStatus.COMPLETED))
              }
            >
              {status === BatchStatus.PROCESSING ? '执行中' :
               (status === BatchStatus.PENDING && batches.some(b => 
                 b.id < id && b.status !== BatchStatus.COMPLETED)) ? '等待执行' :
               status === BatchStatus.FAILED ? '再次执行' : '执行'}
            </Button>
          )}
        </Flex>

        <HStack justify="space-between" fontSize="sm">
          <Text color={styles.textSecondary}>
            地址数量: {addresses.length}
          </Text>
          <Text color={styles.textSecondary}>
            总金额: {formattedTotal} {tokenSymbol}
          </Text>
        </HStack>

        {error && status !== BatchStatus.COMPLETED && (
          <Alert 
            status="error" 
            borderRadius="md" 
            py="1"
            px="3"
            position="fixed" 
            top="4" 
            left="4" 
            zIndex="toast"
            size="sm"
            variant="solid"
            width="auto"
          >
            <AlertIcon boxSize="4" />
            <Text fontSize="xs">
              {error === '等待前序交易完成' ? '等待前序批次' : 
               error === '用户拒绝了交易' ? '用户已拒绝' : 
               error}
            </Text>
          </Alert>
        )}

        {txHash && (
          <Text 
            fontSize="sm" 
            color={styles.textSecondary} 
            cursor="pointer"
            textDecoration="underline"
            onClick={() => window.open(`https://dfscan.dfcscan.io/tx/${txHash}`, '_blank')}
            _hover={{ color: 'rgb(31, 199, 212)' }}
          >
            查看交易详情
          </Text>
        )}
      </VStack>
    </Box>
  );
};

export default BatchCard; 