export const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)"
];

export const BATCH_TRANSFER_ABI = [
  {
    "inputs": [],
    "name": "feePerAddress",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  "function setFeePerAddress(uint256 _feePerAddress) external",
  "function batchTransfer(address token, address[] calldata recipients, uint256[] calldata amounts) external payable",
  "function withdrawFee() external",
  "event BatchTransferExecuted(address indexed token, address indexed sender, uint256 totalAmount, uint256 recipientCount)",
  "event FeeWithdrawn(address indexed owner, uint256 amount)"
];

export const BATCH_TRANSFER_CONTRACT = "0x1E511E790Dc2CbDd6DA739b20e8a441Ccef1d9f8"; 