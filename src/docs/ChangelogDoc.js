import React from 'react';
import { Box, VStack, Heading, Text } from '@chakra-ui/react';

const styles = {
  docBg: 'rgba(19, 23, 64, 0.5)',
  docBorder: 'rgba(255, 255, 255, 0.1)',
  textPrimary: 'white',
  textSecondary: 'rgba(255, 255, 255, 0.6)',
};

const ChangelogEntry = ({ date, changes }) => (
  <Box mb="6">
    <Heading as="h3" size="md" mb="3" color={styles.textPrimary}>
      {date}
    </Heading>
    {Object.entries(changes).map(([type, items]) => (
      <Box key={type} mb="4">
        <Text fontWeight="bold" color={styles.textPrimary} mb="2">
          {type}
        </Text>
        <VStack align="stretch" spacing="1" pl="4">
          {items.map((item, index) => (
            <Text key={index} color={styles.textSecondary}>
              - {item}
            </Text>
          ))}
        </VStack>
      </Box>
    ))}
  </Box>
);

function ChangelogDoc() {
  const changelog = [
    {
      date: '[2024-01-xx]',
      changes: {
        '添加': [
          '实现基础的批量转账功能',
          '添加钱包连接功能',
          '添加网络切换功能'
        ]
      }
    },
    {
      date: '[2024-01-xx]',
      changes: {
        '修复': [
          '修复地址格式验证问题',
          '修复金额计算错误',
          '添加 gas 限制参数'
        ]
      }
    },
    {
      date: '[2024-01-xx]',
      changes: {
        '优化': [
          '优化地址粘贴功能',
          '改进错误提示信息',
          '添加批次处理进度显示'
        ]
      }
    },
    {
      date: '[2024-01-xx]',
      changes: {
        '修复': [
          '修复合约调用参数错误',
          '修复手续费计算问题',
          '优化 gas 估算逻辑'
        ]
      }
    },
    {
      date: '[2024-01-xx]',
      changes: {
        '改进': [
          '改进 UI 设计',
          '添加批次状态显示',
          '优化错误处理逻辑'
        ]
      }
    }
  ];

  return (
    <Box
      bg={styles.docBg}
      borderRadius="24px"
      border="1px solid"
      borderColor={styles.docBorder}
      p="6"
      color={styles.textPrimary}
    >
      <VStack align="stretch" spacing="6">
        <Heading as="h1" size="xl">修改日志</Heading>

        {changelog.map((entry, index) => (
          <ChangelogEntry
            key={index}
            date={entry.date}
            changes={entry.changes}
          />
        ))}
      </VStack>
    </Box>
  );
}

export default ChangelogDoc; 