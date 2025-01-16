export function analyzeTransactionError(error: any): {
  message: string;
  type: 'USER_REJECTED' | 'INSUFFICIENT_FUNDS' | 'INSUFFICIENT_ALLOWANCE' | 'NETWORK_ERROR' | 'UNKNOWN';
  canRetry: boolean;
} {
  // 用户拒绝交易
  if (error.code === 4001 || error.code === 'ACTION_REJECTED' || 
      error.message?.includes('user rejected') || error.message?.includes('User denied')) {
    return {
      message: "用户拒绝了交易",
      type: 'USER_REJECTED',
      canRetry: true
    };
  }

  // 余额不足
  if (error.message?.includes('insufficient funds')) {
    return {
      message: "DFC余额不足支付gas费",
      type: 'INSUFFICIENT_FUNDS',
      canRetry: true
    };
  }

  // 授权额度不足
  if (error.message?.includes('allowance') || error.message?.includes('ERC20: insufficient allowance')) {
    return {
      message: "ERC20代币授权额度不足",
      type: 'INSUFFICIENT_ALLOWANCE',
      canRetry: true
    };
  }

  // 网络错误
  if (error.message?.includes('network') || error.message?.includes('timeout') || 
      error.message?.includes('connection') || error.message?.includes('disconnected')) {
    return {
      message: "网络连接错误，请检查网络后重试",
      type: 'NETWORK_ERROR',
      canRetry: true
    };
  }

  // 未知错误
  return {
    message: "交易执行失败，请检查网络连接或余额是否充足",
    type: 'UNKNOWN',
    canRetry: false
  };
} 