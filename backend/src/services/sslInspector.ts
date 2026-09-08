import tls from 'node:tls';
import http from 'node:http';
import { URL } from 'node:url';

export interface SSLCheckResult {
  hasSsl: boolean;
  status: 'valid' | 'expiring_soon' | 'expired' | 'invalid' | 'none';
  statusText: string;
  issuer: string;
  subject: string;
  validFrom: string;
  validTo: string;
  daysRemaining: number;
  protocol: string;
  cipherName: string;
  subjectAltNames: string[];
  httpToHttpsRedirect: boolean;
  error?: string;
}

/**
 * Checks if http://domain cleanly redirects to https://
 */
async function checkHttpToHttpsRedirect(hostname: string): Promise<boolean> {
  return new Promise((resolve) => {
    const req = http.request(
      `http://${hostname}`,
      {
        method: 'HEAD',
        timeout: 4000,
        headers: { 'User-Agent': 'WebsiteDoctor/1.0' },
      },
      (res) => {
        const statusCode = res.statusCode || 0;
        const location = res.headers.location || '';
        if ([301, 302, 307, 308].includes(statusCode) && location.startsWith('https://')) {
          resolve(true);
        } else {
          resolve(false);
        }
      }
    );
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
    req.end();
  });
}

/**
 * Connects via TLS and analyzes certificate details safely.
 */
export async function inspectSSL(targetUrl: string): Promise<SSLCheckResult> {
  let hostname = '';
  try {
    const parsed = new URL(targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`);
    hostname = parsed.hostname;
  } catch (err) {
    return {
      hasSsl: false,
      status: 'invalid',
      statusText: 'Invalid hostname for SSL check',
      issuer: 'None',
      subject: 'None',
      validFrom: '',
      validTo: '',
      daysRemaining: 0,
      protocol: '',
      cipherName: '',
      subjectAltNames: [],
      httpToHttpsRedirect: false,
      error: 'Invalid hostname',
    };
  }

  const httpToHttpsRedirect = await checkHttpToHttpsRedirect(hostname);

  return new Promise<SSLCheckResult>((resolve) => {
    const socket = tls.connect(
      {
        host: hostname,
        port: 443,
        servername: hostname,
        rejectUnauthorized: false, // We check authorization status manually so we can inspect details even if self-signed
        timeout: 5000,
      },
      () => {
        const cert = socket.getPeerCertificate(true);
        const protocol = socket.getProtocol() || 'TLS';
        const cipher = socket.getCipher()?.name || '';
        const isAuthorized = socket.authorized;
        const authError = socket.authorizationError;

        socket.end();

        if (!cert || Object.keys(cert).length === 0) {
          resolve({
            hasSsl: false,
            status: 'none',
            statusText: 'No SSL certificate found on port 443',
            issuer: 'None',
            subject: 'None',
            validFrom: '',
            validTo: '',
            daysRemaining: 0,
            protocol: '',
            cipherName: '',
            subjectAltNames: [],
            httpToHttpsRedirect,
            error: 'No certificate presented',
          });
          return;
        }

        const validFrom = cert.valid_from;
        const validTo = cert.valid_to;
        const expiryDate = new Date(validTo);
        const now = new Date();
        const diffMs = expiryDate.getTime() - now.getTime();
        const daysRemaining = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

        let status: 'valid' | 'expiring_soon' | 'expired' | 'invalid' = 'valid';
        let statusText = 'SSL Certificate Valid';

        if (!isAuthorized) {
          status = 'invalid';
          statusText = `SSL Certificate Invalid: ${authError?.message || 'Untrusted Authority'}`;
        } else if (diffMs <= 0) {
          status = 'expired';
          statusText = 'SSL Certificate Expired';
        } else if (daysRemaining <= 14) {
          status = 'expiring_soon';
          statusText = `SSL Certificate Expiring Soon (${daysRemaining} days left)`;
        }

        const toStr = (v: string | string[] | undefined): string => (Array.isArray(v) ? v.join(', ') : v || '');
        const issuerVal = cert.issuer ? (toStr(cert.issuer.O) || toStr(cert.issuer.CN) || toStr(cert.issuer.OU)) : '';
        const issuerString = issuerVal || 'Standard Certificate Authority';
        const subjectString = toStr(cert.subject?.CN) || hostname;
        const sans = cert.subjectaltname
          ? cert.subjectaltname.split(', ').map((s) => s.replace(/^DNS:/, ''))
          : [];

        resolve({
          hasSsl: true,
          status,
          statusText,
          issuer: issuerString,
          subject: subjectString,
          validFrom: new Date(validFrom).toISOString().split('T')[0],
          validTo: expiryDate.toISOString().split('T')[0],
          daysRemaining,
          protocol,
          cipherName: cipher,
          subjectAltNames: sans.slice(0, 15),
          httpToHttpsRedirect,
        });
      }
    );

    socket.on('timeout', () => {
      socket.destroy();
      resolve({
        hasSsl: false,
        status: 'none',
        statusText: 'Connection timed out during SSL handshake',
        issuer: 'None',
        subject: 'None',
        validFrom: '',
        validTo: '',
        daysRemaining: 0,
        protocol: '',
        cipherName: '',
        subjectAltNames: [],
        httpToHttpsRedirect,
        error: 'TLS Handshake Timeout',
      });
    });

    socket.on('error', (err) => {
      resolve({
        hasSsl: false,
        status: 'none',
        statusText: `Failed to establish SSL connection: ${err.message}`,
        issuer: 'None',
        subject: 'None',
        validFrom: '',
        validTo: '',
        daysRemaining: 0,
        protocol: '',
        cipherName: '',
        subjectAltNames: [],
        httpToHttpsRedirect,
        error: err.message,
      });
    });
  });
}
