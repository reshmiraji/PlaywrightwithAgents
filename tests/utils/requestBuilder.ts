import { APIRequestContext, APIResponse } from '@playwright/test';
import getAuthTokens from './getAuthTokens';


export enum ContentType {
  JSON = 'application/json',
  FORM = 'application/x-www-form-urlencoded',
}

type HeaderMap = Record<string, string>;

class RequestBuilder {
  private request?: APIRequestContext;
  private headers: HeaderMap = {};
  private payload: any;

  constructor(request?: APIRequestContext) {
    this.request = request;
  }

  // Allow passing Playwright's APIRequestContext at any time
  withRequest(request: APIRequestContext) {
    this.request = request;
    return this;
  }

  contentType(ct: ContentType) {
    this.headers['Content-Type'] = ct;
    return this;
  }

  accept(ct: ContentType | string) {
    this.headers['Accept'] = ct;
    return this;
  }

  header(name: string, value: string) {
    this.headers[name] = value;
    return this;
  }

  body(payload: any) {
    this.payload = payload;
    return this;
  }

  when() {
    // syntactic sugar to match the fluent style
    return this;
  }

  async post(endpoint: string): Promise<APIResponse> {
    if (!this.request) throw new Error('APIRequestContext is required. Call given(request) or withRequest(request) first.');

    const opts: any = { headers: this.headers };

    // Playwright's APIRequestContext will serialize `data` automatically for JSON
    if (this.payload !== undefined) {
      opts.data = this.payload;
    }

    return this.request.post(endpoint, opts);
  }

  // Add GET method to mirror post behavior and support query params
  async get(endpoint: string, params?: Record<string, string | number | boolean>): Promise<APIResponse> {
    if (!this.request) throw new Error('APIRequestContext is required. Call given(request) or withRequest(request) first.');

    const opts: any = { headers: this.headers };
    if (params) {
      opts.params = params;
    }

    return this.request.get(endpoint, opts);
  }
}

export function given(request?: APIRequestContext) {
  return new RequestBuilder(request);
}

export default given;

/**
 * Convenience helper that posts a JSON payload to (baseUrl + endpoint).
 * - request: Playwright APIRequestContext
 * - baseUrl: base URL (e.g. https://api.example.com)
 * - endpoint: path or full path to post to (if full URL provided, baseUrl will be ignored)
 * - payload: object to send as JSON
 * - accessToken/idToken: optional tokens to add as headers
 */
export async function postRequest(
  request: APIRequestContext,
  baseUrl: string,
  endpoint: string,
  payload: any
): Promise<APIResponse> {
  if (!request) throw new Error('APIRequestContext is required');
  const url = endpoint.startsWith('http') ? endpoint : `${baseUrl.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;

  // obtain tokens via helper
  const tokens = await getAuthTokens(request);
  const accessToken = tokens?.accessToken;
  const idToken = tokens?.idToken;

  const builder = given(request).contentType(ContentType.JSON).accept(ContentType.JSON).body(payload);
  if (accessToken) builder.header('Authorization', `Bearer ${accessToken}`);
  if (idToken) builder.header('id_token', idToken);
       console.log('url :', url);

  return builder.when().post(url);
}

// New: GET convenience helper mirroring postRequest
export async function getRequest(
  request: APIRequestContext,
  baseUrl: string,
  endpoint: string,
  params?: Record<string, string | number | boolean>,
  pathParams?: Record<string, string | number>
): Promise<APIResponse> {
   if (!request) throw new Error('APIRequestContext is required');
  
  // Replace path parameters in endpoint if provided
  let finalEndpoint = endpoint;
  if (pathParams) {
    Object.entries(pathParams).forEach(([key, value]) => {
      finalEndpoint = finalEndpoint.replace(`{${key}}`, String(value));
      finalEndpoint = finalEndpoint.replace(`:${key}`, String(value));
    });
  }
  
  const url = finalEndpoint.startsWith('http') 
    ? finalEndpoint 
    : `${baseUrl.replace(/\/$/, '')}/${finalEndpoint.replace(/^\//, '')}`;

  // Build query string for logging
  const queryString = params 
    ? '?' + Object.entries(params).map(([key, value]) => `${key}=${value}`).join('&')
    : '';

  // obtain tokens via helper
  const tokens = await getAuthTokens(request);
  const accessToken = tokens?.accessToken;
  const idToken = tokens?.idToken;

  const builder = given(request).accept(ContentType.JSON);
  if (accessToken) builder.header('Authorization', `Bearer ${accessToken}`);
  if (idToken) builder.header('id_token', idToken);

  //console.log('\n🌐 GET REQUEST:');
  console.log(`   Full URL: ${url}${queryString}`);
  if (pathParams) {
   // console.log(`   Path Parameters:`, pathParams);
  }
  if (params) {
    //console.log(`   Query Parameters:`, params);
  }

  return builder.when().get(url, params);
}
