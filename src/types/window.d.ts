interface Window {
  ethereum?: {
    request: (args: { method: string; params?: any[] }) => Promise<any>;
    chainId?: string;
  };
}

declare module 'ethers' {
  export interface Web3Provider {
    getSigner(): Signer;
  }
} 