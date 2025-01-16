import React from 'react';
import { Box, VStack, Heading, Text, Code, UnorderedList, ListItem } from '@chakra-ui/react';

const styles = {
  docBg: 'rgba(19, 23, 64, 0.5)',
  docBorder: 'rgba(255, 255, 255, 0.1)',
  textPrimary: 'white',
  textSecondary: 'rgba(255, 255, 255, 0.6)',
  codeBg: 'rgba(0, 0, 0, 0.3)',
};

function ContractDoc() {
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
        <Heading as="h1" size="xl">批量转账合约文档</Heading>

        <Box>
          <Heading as="h2" size="lg" mb="4">合约信息</Heading>
          <UnorderedList spacing="2">
            <ListItem>合约地址：0x817dDDf620797F2bECf2f3d01D08a1709C372E84</ListItem>
            <ListItem>网络：DFC Chain (chainId: 0x398)</ListItem>
          </UnorderedList>
        </Box>

        <Box>
          <Heading as="h2" size="lg" mb="4">合约接口</Heading>

          <Box mb="6">
            <Heading as="h3" size="md" mb="3">ERC20 代币接口</Heading>
            <Code p="4" borderRadius="md" display="block" whiteSpace="pre" bg={styles.codeBg}>
{`interface IERC20 {
    function name() external view returns (string);
    function symbol() external view returns (string);
    function decimals() external view returns (uint8);
    function totalSupply() external view returns (uint256);
    function balanceOf(address) external view returns (uint256);
    function transfer(address to, uint amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint amount) external returns (bool);
    function transferFrom(address from, address to, uint amount) external returns (bool);
}`}
            </Code>
          </Box>

          <Box mb="6">
            <Heading as="h3" size="md" mb="3">批量转账合约接口</Heading>
            <Code p="4" borderRadius="md" display="block" whiteSpace="pre" bg={styles.codeBg}>
{`interface IBatchTransfer {
    function batchTransfer(
        address token,
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external payable;
    
    function batchTransferWithData(
        address token,
        address[] calldata recipients,
        uint256[] calldata amounts,
        bytes[] calldata data
    ) external payable;
    
    function feePerAddress() external view returns (uint256);
    function owner() external view returns (address);
    function setFeePerAddress(uint256 _feePerAddress) external;
    function withdrawFee() external;
}`}
            </Code>
          </Box>
        </Box>

        <Box>
          <Heading as="h2" size="lg" mb="4">使用说明</Heading>
          <UnorderedList spacing="2">
            <ListItem>每个地址转账需要支付 0.01 DFC 手续费</ListItem>
            <ListItem>单次批量转账最多支持 200 个地址</ListItem>
            <ListItem>需要先授权代币给批量转账合约</ListItem>
            <ListItem>转账时需要附带足够的手续费</ListItem>
          </UnorderedList>
        </Box>
      </VStack>
    </Box>
  );
}

export default ContractDoc; 