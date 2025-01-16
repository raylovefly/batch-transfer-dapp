import React from 'react';
import { Box, VStack, Heading, Text, Code, UnorderedList, ListItem } from '@chakra-ui/react';

const styles = {
  docBg: 'rgba(19, 23, 64, 0.5)',
  docBorder: 'rgba(255, 255, 255, 0.1)',
  textPrimary: 'white',
  textSecondary: 'rgba(255, 255, 255, 0.6)',
};

function ProjectDoc() {
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
        <Heading as="h1" size="xl">批量转账工具项目文档</Heading>

        <Box>
          <Heading as="h2" size="lg" mb="4">项目概述</Heading>
          <UnorderedList spacing="2">
            <ListItem>项目名称：批量转账工具</ListItem>
            <ListItem>技术栈：React + Ethers.js + Chakra UI</ListItem>
            <ListItem>开发环境：Node.js</ListItem>
          </UnorderedList>
        </Box>

        <Box>
          <Heading as="h2" size="lg" mb="4">项目结构</Heading>
          <Code p="4" borderRadius="md" display="block" whiteSpace="pre">
{`src/
├── components/
│   └── BatchTransfer.js    # 主要的批量转账组件
├── utils/
│   └── abis.js            # 合约 ABI 定义
└── App.js                  # 应用入口和路由配置`}
          </Code>
        </Box>

        <Box>
          <Heading as="h2" size="lg" mb="4">主要功能</Heading>
          
          <Box mb="4">
            <Heading as="h3" size="md" mb="2">1. 钱包连接</Heading>
            <UnorderedList>
              <ListItem>MetaMask 钱包集成</ListItem>
              <ListItem>自动网络切换</ListItem>
              <ListItem>账户状态监听</ListItem>
            </UnorderedList>
          </Box>

          <Box mb="4">
            <Heading as="h3" size="md" mb="2">2. 代币管理</Heading>
            <UnorderedList>
              <ListItem>ERC20 代币支持</ListItem>
              <ListItem>代币余额查询</ListItem>
              <ListItem>代币授权管理</ListItem>
            </UnorderedList>
          </Box>

          <Box mb="4">
            <Heading as="h3" size="md" mb="2">3. 批量转账</Heading>
            <UnorderedList>
              <ListItem>支持大批量地址导入</ListItem>
              <ListItem>自动分批处理（每批200个地址）</ListItem>
              <ListItem>实时转账状态追踪</ListItem>
              <ListItem>Gas 费用估算</ListItem>
            </UnorderedList>
          </Box>
        </Box>

        <Box>
          <Heading as="h2" size="lg" mb="4">部署要求</Heading>
          <UnorderedList>
            <ListItem>Node.js >= 14.0.0</ListItem>
            <ListItem>MetaMask 钱包</ListItem>
            <ListItem>DFC Chain 网络支持</ListItem>
          </UnorderedList>
        </Box>
      </VStack>
    </Box>
  );
}

export default ProjectDoc; 