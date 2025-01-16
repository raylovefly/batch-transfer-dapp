import React from 'react';
import { useDispatch } from 'react-redux';
import { Button, Box, Typography, Alert } from '@mui/material';
import { resumeBatch, stopBatch } from '../store/actions';

const BatchStatus = ({ batch }: { batch: BatchStatus }) => {
  const dispatch = useDispatch();
  
  const handleRetry = () => {
    dispatch(resumeBatch(batch.batchId));
  };
  
  const handleStop = () => {
    dispatch(stopBatch(batch.batchId));
  };

  const getErrorMessage = (error: string) => {
    if (error.includes('user rejected transaction')) {
      return '用户拒绝了交易请求';
    }
    if (error.includes('insufficient funds')) {
      return 'DFC余额不足';
    }
    if (error.includes('allowance')) {
      return 'ERC20代币授权额度不足';
    }
    return '交易执行失败，请检查网络连接或余额是否充足';
  };
  
  return (
    <Box className="batch-status" sx={{ mb: 2, p: 2, border: '1px solid #eee', borderRadius: 1 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="h6">批次 #{batch.batchId}</Typography>
        <Typography 
          sx={{
            px: 2,
            py: 0.5,
            borderRadius: 1,
            backgroundColor: batch.status === 'failed' ? '#ffebee' : 
                           batch.status === 'completed' ? '#e8f5e9' : 
                           batch.status === 'processing' ? '#e3f2fd' : '#fafafa'
          }}
        >
          {batch.status === 'failed' ? '失败' : 
           batch.status === 'completed' ? '完成' : 
           batch.status === 'processing' ? '处理中' : '等待中'}
        </Typography>
      </Box>
      
      {batch.status === 'failed' && (
        <Box mt={2}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {getErrorMessage(batch.errorMessage || '')}
          </Alert>
          <Box display="flex" gap={2}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleRetry}
              sx={{ flex: 1 }}
            >
              继续执行
            </Button>
            <Button 
              variant="outlined" 
              color="error" 
              onClick={handleStop}
              sx={{ flex: 1 }}
            >
              中断批次
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default BatchStatus; 