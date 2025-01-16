import React, { useState } from 'react';
import { Route, Routes, Link, useLocation } from 'react-router-dom';
import { ChakraProvider, useToast, Box, VStack, HStack, Text } from '@chakra-ui/react';
import DeployContract from './components/DeployContract';
import BatchTransfer from './components/BatchTransfer';
import ProjectDoc from './docs/ProjectDoc';
import RequirementsDoc from './docs/RequirementsDoc';
import ContractDoc from './docs/ContractDoc';
import ChangelogDoc from './docs/ChangelogDoc';

// 导航栏样式
const styles = {
  navBg: 'rgba(19, 23, 64, 0.9)',
  navBorder: 'rgba(255, 255, 255, 0.1)',
  navHover: 'rgba(31, 199, 212, 0.1)',
  navActive: 'rgba(31, 199, 212, 0.2)',
  textPrimary: 'white',
  textSecondary: 'rgba(255, 255, 255, 0.6)',
};

// 导航链接组件
const NavLink = ({ to, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link to={to}>
      <Box
        p="3"
        borderRadius="md"
        bg={isActive ? styles.navActive : 'transparent'}
        _hover={{ bg: styles.navHover }}
        color={isActive ? styles.textPrimary : styles.textSecondary}
        transition="all 0.2s"
      >
        {children}
      </Box>
    </Link>
  );
};

function App() {
  const [account, setAccount] = useState('');
  const toast = useToast();

  // 连接钱包
  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        throw new Error('请安装 MetaMask 钱包');
      }

      // 请求账户连接
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      setAccount(accounts[0]);

      // 监听账户变化
      window.ethereum.on('accountsChanged', (accounts) => {
        setAccount(accounts[0] || '');
      });

    } catch (error) {
      console.error('连接钱包失败:', error);
      toast({
        title: '连接失败',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // 检查并切换网络
  const checkAndSwitchNetwork = async () => {
    try {
      if (!window.ethereum) {
        throw new Error('请安装 MetaMask 钱包');
      }

      // DFC 主网络参数
      const dfcChainId = '0x398'; // 920 的十六进制
      const dfcNetworkParams = {
        chainId: dfcChainId,
        chainName: 'DFC Chain',
        nativeCurrency: {
          name: 'DFC',
          symbol: 'DFC',
          decimals: 18
        },
        rpcUrls: ['https://node.dragonfly-chain.com'],
        blockExplorerUrls: ['https://dfscan.dfcscan.io']
      };

      try {
        // 尝试切换到 DFC 网络
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: dfcChainId }]
        });
        
        toast({
          title: '网络切换成功',
          description: '已切换到 DFC Chain',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        if (error.code === 4902) {
          try {
            // 如果网络不存在，添加网络
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [dfcNetworkParams]
            });
            
            toast({
              title: '网络添加成功',
              description: '已添加并切换到 DFC Chain',
              status: 'success',
              duration: 3000,
              isClosable: true,
            });
          } catch (addError) {
            console.error('添加网络失败:', addError);
            throw new Error('添加 DFC Chain 网络失败，请手动添加');
          }
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('切换网络失败:', error);
      toast({
        title: '网络切换失败',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      throw error;
    }
  };

  return (
    <ChakraProvider>
      <HStack align="stretch" spacing="0" minH="100vh">
        {/* 左侧导航栏 */}
        <Box
          w="250px"
          bg={styles.navBg}
          borderRight="1px solid"
          borderColor={styles.navBorder}
          p="4"
          position="fixed"
          left="0"
          top="0"
          bottom="0"
          overflowY="auto"
        >
          <VStack spacing="2" align="stretch">
            <Text
              fontSize="xl"
              fontWeight="bold"
              color={styles.textPrimary}
              p="3"
              mb="4"
            >
              批量转账工具
            </Text>
            
            <NavLink to="/">转账工具</NavLink>
            <NavLink to="/project-doc">项目文档</NavLink>
            <NavLink to="/requirements-doc">需求文档</NavLink>
            <NavLink to="/contract-doc">合约文档</NavLink>
            <NavLink to="/changelog">修改日志</NavLink>
          </VStack>
        </Box>

        {/* 主内容区域 */}
        <Box ml="250px" flex="1" p="4">
          <Routes>
            <Route 
              path="/" 
              element={
                <BatchTransfer
                  account={account}
                  connectWallet={connectWallet}
                  checkAndSwitchNetwork={checkAndSwitchNetwork}
                />
              } 
            />
            <Route path="/project-doc" element={<ProjectDoc />} />
            <Route path="/requirements-doc" element={<RequirementsDoc />} />
            <Route path="/contract-doc" element={<ContractDoc />} />
            <Route path="/changelog" element={<ChangelogDoc />} />
            <Route path="/deploy" element={<DeployContract />} />
          </Routes>
        </Box>
      </HStack>
    </ChakraProvider>
  );
}

export default App;
