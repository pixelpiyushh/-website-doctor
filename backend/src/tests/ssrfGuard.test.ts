import { describe, it, expect } from 'vitest';
import { validateUrlForSSRF } from '../services/ssrfGuard.js';

describe('SSRF Guard Security Protection', () => {
  it('should block localhost and loopback domains', async () => {
    const res1 = await validateUrlForSSRF('http://localhost:3000');
    expect(res1.isValid).toBe(false);

    const res2 = await validateUrlForSSRF('http://127.0.0.1/admin');
    expect(res2.isValid).toBe(false);

    const res3 = await validateUrlForSSRF('http://sub.localhost');
    expect(res3.isValid).toBe(false);
  });

  it('should block AWS / Cloud metadata service IP 169.254.169.254', async () => {
    const res = await validateUrlForSSRF('http://169.254.169.254/latest/meta-data/');
    expect(res.isValid).toBe(false);
    expect(res.error).toContain('private/reserved network range');
  });

  it('should block private Class A (10.x), Class B (172.16.x), and Class C (192.168.x)', async () => {
    const res10 = await validateUrlForSSRF('http://10.0.0.1');
    expect(res10.isValid).toBe(false);

    const res172 = await validateUrlForSSRF('http://172.20.0.5');
    expect(res172.isValid).toBe(false);

    const res192 = await validateUrlForSSRF('http://192.168.1.254');
    expect(res192.isValid).toBe(false);
  });

  it('should allow valid public domains and normalize protocol', async () => {
    const res = await validateUrlForSSRF('example.com');
    expect(res.isValid).toBe(true);
    expect(res.normalizedUrl).toBe('https://example.com/');
  });

  it('should reject invalid protocols like ftp:// or file://', async () => {
    const resFtp = await validateUrlForSSRF('ftp://files.example.com');
    expect(resFtp.isValid).toBe(false);

    const resFile = await validateUrlForSSRF('file:///etc/passwd');
    expect(resFile.isValid).toBe(false);
  });
});
