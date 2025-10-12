// src/types/react-native-event-source.d.ts
declare module "react-native-event-source" {
  type EventListener = (event: any) => void;

  export default class RNEventSource {
    constructor(url: string, options?: any);
    addEventListener(event: string, listener: EventListener): void;
    removeEventListener(event: string, listener: EventListener): void;
    close(): void;
    onmessage?: EventListener;
    onerror?: EventListener;
  }
}
