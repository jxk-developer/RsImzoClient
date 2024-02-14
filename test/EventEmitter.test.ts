import { describe, expect, it, vi } from 'vitest'
import { AsyncEventEmitter } from '../src/core/EventEmitter'

describe('AsyncEventEmitter', () => {

  it('should call an event listener when the event is emitted', async () => {
    const emitter = new AsyncEventEmitter();
    const listener = vi.fn();
    emitter.on('test', listener);
    await emitter.emit('test');
    expect(listener).toHaveBeenCalled();
  });

  it('should pass event arguments to listeners', async () => {
    const emitter = new AsyncEventEmitter();
    const listener = vi.fn();
    const eventData = { key: 'value' };
    emitter.on('test', listener);
    await emitter.emit('test', eventData);
    expect(listener).toHaveBeenCalledWith(eventData);
  });

  it('should remove an event listener correctly', async () => {
    const emitter = new AsyncEventEmitter();
    const listener = vi.fn();
    emitter.on('test', listener);
    emitter.off('test', listener);
    await emitter.emit('test');
    expect(listener).not.toHaveBeenCalled();
  });

  it('should call listener only once', async () => {
    const emitter = new AsyncEventEmitter();
    const listener = vi.fn();
    emitter.on('test', listener, { once: true });
    await emitter.emit('test');
    await emitter.emit('test');
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('should not fail when emitting an event with no listeners', async () => {
    const emitter = new AsyncEventEmitter();
    await expect(emitter.emit('test')).resolves.not.toThrow();
  });

  it('should handle errors thrown in listeners', async () => {
    const emitter = new AsyncEventEmitter();
    const errorListener = vi.fn(() => {
      throw new Error('Test error');
    });
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
    emitter.on('test', errorListener);
    await emitter.emit('test');
    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it('should support multiple listeners for the same event', async () => {
    const emitter = new AsyncEventEmitter();
    const listenerOne = vi.fn();
    const listenerTwo = vi.fn();
    emitter.on('test', listenerOne);
    emitter.on('test', listenerTwo);
    await emitter.emit('test');
    expect(listenerOne).toHaveBeenCalled();
    expect(listenerTwo).toHaveBeenCalled();
  });

  it('should remove once-only listeners after they are called to prevent potential memory leaks', async () => {
    const emitter = new AsyncEventEmitter();
    const listener = vi.fn();
    emitter.on('event', listener, { once: true });
    await emitter.emit('event');
    expect(listener).toHaveBeenCalledTimes(1);
    const listenersForEvent = emitter.events['event'];
    expect(listenersForEvent).toBeDefined();
    expect(listenersForEvent).toHaveLength(0);
  });

  it('should allow multiple emissions for non-once listeners', async () => {
    const emitter = new AsyncEventEmitter();
    const listener = vi.fn();
    emitter.on('event', listener);
    await emitter.emit('event');
    await emitter.emit('event');
    expect(listener).toHaveBeenCalledTimes(2);
    const listenersForEvent = emitter.events['event'];
    expect(listenersForEvent).toBeDefined();
    expect(listenersForEvent).toHaveLength(1);
  });
  
});
