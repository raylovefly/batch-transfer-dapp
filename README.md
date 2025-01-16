# DFC Chain 批量转账 DApp

一个基于 DFC Chain 的批量转账工具，支持 ERC20 代币批量转账，具有完善的错误处理机制和用户友好的界面。

## 主要特性

- 支持多地址批量转账（最多2000个地址）
- 智能批次管理（每批次200个地址）
- 实时进度追踪
- 智能 Gas 优化
- 错误自动处理
- 数据持久化

## 技术栈

- 前端：React + Ethers.js + Chakra UI
- 智能合约：Solidity 0.8.19
- 开发环境：Node.js v16.20.2

## 快速开始

1. 克隆仓库
```bash
git clone https://github.com/raylovefly/batch-transfer-dapp.git
cd batch-transfer-dapp
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量
```bash
cp .env.example .env
```
4. 启动开发服务器
```bash
npm start
```

## 使用要求

- Node.js v16.20.2 或以上
- MetaMask 钱包
- DFC Chain 网络支持

## 合约信息

- 网络：DFC Chain (chainId: 920)
- 合约地址：0x1E511E790Dc2CbDd6DA739b20e8a441Ccef1d9f8

## 版本信息

当前版本：2.5.0
最后更新：2024-03-18

## 新增特性

- 强化批次管理系统
- 改进错误处理机制
- 本地存储优化
- 性能优化
- 用户体验提升

## 安全说明

- 请勿在代码中硬编码或提交任何私钥或敏感信息
- 使用 `.env` 文件存储敏感配置，并确保它被添加到 `.gitignore`
- 定期更新依赖包以修复潜在的安全漏洞

## 许可证

MIT License
