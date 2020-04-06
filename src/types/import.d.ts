import {} from 'three';
declare global {
    interface Window { 
        CAF: ((handle: number) => void) & ((handle: number) => void);
        RAF: ((callback: FrameRequestCallback) => number) & ((callback: FrameRequestCallback) => number);
     }
  }