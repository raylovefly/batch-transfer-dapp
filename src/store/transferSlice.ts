interface BatchStatus {
  batchId: number;
  status: 'pending' | 'processing' | 'failed' | 'completed';
  errorMessage?: string;
  canRetry?: boolean;
}

interface TransferState {
  batches: BatchStatus[];
  currentBatch: number;
  isProcessing: boolean;
} 
interface BatchStatus {
    batchId: number;
    status: 'pending' | 'processing' | 'failed' | 'completed';
    errorMessage?: string;
    canRetry?: boolean;
  }
  
  interface TransferState {
    batches: BatchStatus[];
    currentBatch: number;
    isProcessing: boolean;
  }