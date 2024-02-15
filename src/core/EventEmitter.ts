
type RSIEventListener<T> = T extends void ? () => Promise<void> | void : (arg: T) => Promise<void> | void;

console.log('Hello from EventEmitter.ts');

export class AsyncEventEmitter<EventMap extends Record<string, any>> {
  private _events: { [K in keyof EventMap]?: Array<{ listener: RSIEventListener<EventMap[K]>, once: boolean }> } = {};


  public get events() {
    return this._events
  }

  public on<K extends keyof EventMap>(eventName: K, listener: RSIEventListener<EventMap[K]>, options?: { once?: boolean }) {
    const eventListener = {
      listener: listener,
      once: !!options?.once // Convert undefined to false if options or once is not provided
    };

    if (!this._events[eventName]) {
      this._events[eventName] = [];
    }
    this._events[eventName]!.push(eventListener);
  }

  public async emit<K extends keyof EventMap>(eventName: K, arg?: EventMap[K]): Promise<void> {
    const listeners = this._events[eventName];
    if (!listeners) return;

    // Create a copy to avoid issues with modifying the array during iteration
    const listenersCopy = [...listeners];

    for (const { listener, once } of listenersCopy) {
      try {
        await Promise.resolve(listener(arg));
      } catch (error) {
        console.error(`Error in listener for event '${String(eventName)}':`, error);
      } finally {

        if (once) {
          this.off(eventName, listener);
        }
      }
    }
  }

  public off<K extends keyof EventMap>(eventName: K, listener: RSIEventListener<EventMap[K]>) {
    const listeners = this._events[eventName];
    if (!listeners) return;

    const index = listeners.findIndex(eventListener => eventListener.listener === listener);
    if (index !== -1) {
      listeners.splice(index, 1);
    }
  }
}