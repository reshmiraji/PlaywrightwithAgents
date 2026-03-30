import { APIRequestContext } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// Safe env accessor — some static analysis environments don't provide `process`.
const envGet = (k: string, d: string) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p: any = typeof process !== 'undefined' ? (process as any) : undefined;
  return p && p.env && typeof p.env[k] !== 'undefined' ? p.env[k] : d;
};

// Function to read credentials from properties file
const readCredentials = () => {
  const credPath = path.resolve(__dirname, '../../credential_TST.properties');
  const credContent = fs.readFileSync(credPath, 'utf-8');
  const creds: { [key: string]: string } = {};
  credContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) creds[key.trim()] = value.trim();
  });
  return creds;
};

const credentials = readCredentials();

// Defaults from credential.properties; can be overridden via environment variables
const TOKEN_URL = envGet('TOKEN_URL', credentials.TOKEN_URL );
const CLIENT_ID = envGet('CLIENT_ID', credentials.CLIENT_ID || 'jEEsCZFrCR5cdemcQc6ORQPkZMoJmM8y');
const CLIENT_SECRET = envGet('CLIENT_SECRET', credentials.CLIENT_SECRET || 'vM8Jnm8L2HILZt86ZlyeHdxLNlxhpZudb8IVUIberLhuHgdokpGXsGQTzyJf1nt_');
const AUDIENCE = envGet('AUDIENCE', credentials.AUDIENCE || 'https://origin-tst');
const SCOPE = envGet('SCOPE', credentials.SCOPE || 'openid');
const ENCODED_EMAIL = envGet('ENCODED_EMAIL', credentials.ENCODED_EMAIL) ;
const ENCODED_PASSWORD = envGet('ENCODED_PASSWORD', credentials.ENCODED_PASSWORD );

function b64Decode(input: string) {
  return Buffer.from(input, 'base64').toString('utf8');}

export type TokenResult = {
  accessToken: string;
  idToken?: string;
  raw: any;
};

/**
 * Obtain OAuth tokens (access_token and id_token) using the Resource Owner Password grant.
 * Use Playwright's APIRequestContext to perform the HTTP call (so it works inside Playwright tests).
 */
export async function getAuthTokens(request: APIRequestContext): Promise<TokenResult> {
  if (!request) throw new Error('APIRequestContext is required');

  const username = b64Decode(ENCODED_EMAIL);
  const password = b64Decode(ENCODED_PASSWORD);

  const body = new URLSearchParams({
    grant_type: 'password',
    username,
    password,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    audience: AUDIENCE,
    scope: SCOPE,
  }).toString();

  const resp = await request.post(TOKEN_URL, {
    data: body,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
  });

  if (!resp.ok()) {
    const txt = await resp.text().catch(() => '');
    throw new Error(`Token endpoint returned ${resp.status()}: ${txt}`);
  }

  const json = await resp.json();
  const accessToken = json.access_token;
  const idToken = json.id_token;
  if (!accessToken) throw new Error(`No access_token in response: ${JSON.stringify(json)}`);
  return { accessToken, idToken, raw: json };
}

export default getAuthTokens;
