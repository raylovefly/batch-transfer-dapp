import React from 'react';
import { Box, VStack, Heading, UnorderedList, ListItem } from '@chakra-ui/react';

const styles = {
  docBg: 'rgba(19, 23, 64, 0.5)',
  docBorder: 'rgba(255, 255, 255, 0.1)',
  textPrimary: 'white',
  textSecondary: 'rgba(255, 255, 255, 0.6)',
};

function RequirementsDoc() {
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
        <Heading as="h1" size="xl">批量转账工具需求文档</Heading>

        <Box>
          <Heading as="h2" size="lg" mb="4">功能需求</Heading>

          <Box mb="6">
            <Heading as="h3" size="md" mb="3">1. 钱包连接</Heading>
            <UnorderedList spacing="2">
              <ListItem>支持 MetaMask 钱包连接</ListItem>
              <ListItem>自动检测并切换到 DFC Chain 网络</ListItem>
              <ListItem>显示当前连接的钱包地址</ListItem>
              <ListItem>监听钱包账户变化</ListItem>
            </UnorderedList>
          </Box>

          <Box mb="6">
            <Heading as="h3" size="md" mb="3">2. 地址管理</Heading>
            <UnorderedList spacing="2">
              <ListItem>支持批量导入地址和金额</ListItem>
              <ListItem>支持多种格式的地址输入（空格分隔、换行分隔、逗号分隔）</ListItem>
              <ListItem>自动格式化和验证地址格式</ListItem>
              <ListItem>保持地址输入时的序号连续性</ListItem>
              <ListItem>支持追加新地址而不清除现有地址</ListItem>
            </UnorderedList>
          </Box>

          <Box mb="6">
            <Heading as="h3" size="md" mb="3">3. 转账功能</Heading>
            <UnorderedList spacing="2">
              <ListItem>支持 ERC20 代币批量转账</ListItem>
              <ListItem>自动分批处理（每批200个地址）</ListItem>
              <ListItem>显示每批次的转账状态</ListItem>
              <ListItem>显示总转账进度</ListItem>
              <ListItem>支持转账失败时的错误提示</ListItem>
            </UnorderedList>
          </Box>

          <Box mb="6">
            <Heading as="h3" size="md" mb="3">4. 界面展示</Heading>
            <UnorderedList spacing="2">
              <ListItem>显示代币余额</ListItem>
              <ListItem>显示总转账金额</ListItem>
              <ListItem>显示批次处理进度</ListItem>
              <ListItem>显示 Gas 消耗统计</ListItem>
              <ListItem>显示每个批次的详细信息</ListItem>
            </UnorderedList>
          </Box>

          <Box mb="6">
            <Heading as="h3" size="md" mb="3">5. 安全性</Heading>
            <UnorderedList spacing="2">
              <ListItem>地址格式验证</ListItem>
              <ListItem>金额格式验证</ListItem>
              <ListItem>余额充足性检查</ListItem>
              <ListItem>授权额度检查</ListItem>
            </UnorderedList>
          </Box>
        </Box>
      </VStack>
    </Box>
  );
}

export default RequirementsDoc; 