import { createAction } from '@reduxjs/toolkit';

export const resumeBatch = createAction<number>('batch/resume');
export const stopBatch = createAction<number>('batch/stop');
export const updateBatchStatus = createAction<{
  batchId: number;
  status: 'pending' | 'processing' | 'failed' | 'completed';
  errorMessage?: string;
}>('batch/updateStatus'); 