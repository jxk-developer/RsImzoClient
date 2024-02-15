import { describe, it, expect, vi, afterEach } from 'vitest';
import { Client } from '../src/core/RsImzoClient'

describe('RsImzoClient', () => {

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates and appends an iframe to the document body on initialization', () => {
    const client = new Client();
    expect(document.body.contains(client['providerIframe'])).toBe(true);
  });

  it('emits a "ready" event if the iframe window is loaded', async () => {
    const client = new Client();
    const readyHandler = vi.fn();
    client.on('ready', readyHandler);
    client['checkWindowLoadedViaHandshake'] = vi.fn().mockResolvedValue(true);
    await client['appendProviderIframe']();
    expect(readyHandler).toHaveBeenCalled();
  });

  it('removes the iframe from the document body on cleanup', () => {
    const client = new Client();
    client['init']();
    client.cleanup();

    expect(document.body.contains(client['providerIframe'])).toBe(false);
  });

});
