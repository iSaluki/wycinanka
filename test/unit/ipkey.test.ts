import { describe, expect, it } from 'vitest';
import { ipKey } from '../../src/shared/ip';

describe('throttling key for an address', () => {
  it('keeps IPv4 addresses whole', () => {
    expect(ipKey('203.0.113.7')).toBe('203.0.113.7');
  });
  it('groups IPv6 addresses by their /64 network, however they are written', () => {
    const key = ipKey('2001:db8:85a3:12::8a2e:370:7334');
    expect(key).toBe('2001:db8:85a3:12::/64');
    expect(ipKey('2001:0db8:85a3:0012:ffff:0:0:1')).toBe(key);
    expect(ipKey('2001:db8::1')).toBe('2001:db8:0:0::/64');
    expect(ipKey('::1')).toBe('0:0:0:0::/64');
  });
});
