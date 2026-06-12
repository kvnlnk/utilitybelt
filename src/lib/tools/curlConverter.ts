import { Result, ok, err } from './types';

// ---------------------------------------------------------------------------
// cURL parser — extracts request components from a cURL command string
// ---------------------------------------------------------------------------

export interface ParsedCurl {
  method: string;
  url: string;
  headers: Record<string, string>;
  body: string;
  auth: { type: string; value: string } | null;
  insecure: boolean;
}

/**
 * Parse a cURL command string into its components.
 */
export function parseCurl(input: string): Result<ParsedCurl> {
  try {
    let remaining = input.trim();

    // Normalise line continuations
    remaining = remaining.replace(/\\\n\s*/g, ' ').replace(/\\\r\n\s*/g, ' ');

    // Must start with "curl"
    if (!/^curl\b/i.test(remaining)) {
      return err('Command must start with "curl"');
    }
    remaining = remaining.replace(/^curl\s+/i, '');

    const headers: Record<string, string> = {};
    let body = '';
    let method = 'GET';
    let auth: { type: string; value: string } | null = null;
    let insecure = false;

    // Use a simple tokeniser for flag-value pairs
    const tokens: string[] = [];
    let current = '';
    let inSingle = false;
    let inDouble = false;

    for (let i = 0; i < remaining.length; i++) {
      const ch = remaining[i];
      if (ch === "'" && !inDouble) { inSingle = !inSingle; current += ch; continue; }
      if (ch === '"' && !inSingle) { inDouble = !inDouble; current += ch; continue; }
      if (/\s/.test(ch) && !inSingle && !inDouble) {
        if (current) { tokens.push(current); current = ''; }
        continue;
      }
      current += ch;
    }
    if (current) tokens.push(current);

    for (let i = 0; i < tokens.length; i++) {
      const tok = tokens[i];

      // -X / --request
      if (/^-X$|^--request$/i.test(tok)) {
        method = (tokens[++i] || 'GET').toUpperCase().replace(/['"]/g, '');
        continue;
      }

      // -H / --header
      if (/^-H$|^--header$/i.test(tok)) {
        const headerStr = (tokens[++i] || '').replace(/^['"]|['"]$/g, '');
        const colonIdx = headerStr.indexOf(':');
        if (colonIdx > 0) {
          const key = headerStr.slice(0, colonIdx).trim();
          const val = headerStr.slice(colonIdx + 1).trim();
          headers[key] = val;
        }
        continue;
      }

      // -d / --data / --data-raw / --data-binary
      if (/^-d$|^--data(-raw|-binary)?$|^--data$/i.test(tok)) {
        let dataVal = (tokens[++i] || '').replace(/^['"]|['"]$/g, '');
        // URL-encoded data
        if (dataVal.startsWith('@')) {
          // File reference — skip
          body = '[FILE: ' + dataVal.slice(1) + ']';
        } else {
          body = dataVal;
        }
        if (method === 'GET') method = 'POST';
        continue;
      }

      // -u / --user (basic auth)
      if (/^-u$|^--user$/i.test(tok)) {
        const userVal = (tokens[++i] || '').replace(/^['"]|['"]$/g, '');
        auth = { type: 'Basic', value: userVal };
        continue;
      }

      // --bearer
      if (/^--bearer$/i.test(tok)) {
        const bearerVal = (tokens[++i] || '').replace(/^['"]|['"]$/g, '');
        auth = { type: 'Bearer', value: bearerVal };
        headers['Authorization'] = `Bearer ${bearerVal}`;
        continue;
      }

      // -k / --insecure
      if (/^-k$|^--insecure$/i.test(tok)) {
        insecure = true;
        continue;
      }

      // -L / --location (follow redirects) — informational
      if (/^-L$|^--location$/i.test(tok)) {
        continue;
      }

      // -i / --include (show headers) — informational
      if (/^-i$|^--include$/i.test(tok)) {
        continue;
      }

      // -s / --silent / -S / --show-error
      if (/^-s$|^--silent$|^-S$|^--show-error$/i.test(tok)) {
        continue;
      }

      // --compressed
      if (/^--compressed$/i.test(tok)) {
        continue;
      }

      // First non-flag token is the URL
      if (!/^-/.test(tok)) {
        const urlCandidate = tok.replace(/^['"]|['"]$/g, '');
        // Only set URL if it looks like one
        if (/^https?:\/\//i.test(urlCandidate) || /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(urlCandidate)) {
          // Save headers inferred from method
          if (body && !headers['Content-Type']) {
            // Check if body looks like JSON
            if (/^[{[]/.test(body)) {
              headers['Content-Type'] = 'application/json';
            } else {
              headers['Content-Type'] = 'application/x-www-form-urlencoded';
            }
          }
          return ok({
            url: urlCandidate.startsWith('http') ? urlCandidate : `https://${urlCandidate}`,
            method: body ? (method === 'GET' ? 'POST' : method) : method,
            headers,
            body,
            auth,
            insecure,
          });
        }
        // If it's not a URL and not a flag, skip (might be a file ref or other arg)
      }
    }

    return err('Could not find a valid URL in the cURL command');
  } catch (e: any) {
    return err(`Parse error: ${e.message}`);
  }
}

// ---------------------------------------------------------------------------
// Code generators — output parsed cURL as different languages
// ---------------------------------------------------------------------------

export type CodeTarget = 'fetch' | 'axios' | 'python' | 'go';

interface GenerateOptions {
  pretty?: boolean;
}

function indent(str: string, level: number): string {
  const prefix = '  '.repeat(level);
  return prefix + str;
}

function quote(s: string): string {
  return JSON.stringify(s);
}

function generateFetch(parsed: ParsedCurl, opts: GenerateOptions): string {
  const lines: string[] = [];
  const p = opts.pretty ? 1 : 0;

  lines.push(`const response = await fetch(${quote(parsed.url)}, {`);
  if (parsed.method !== 'GET') {
    lines.push(indent(`method: ${quote(parsed.method)},`, p));
  }
  lines.push(indent('headers: {', p));
  for (const [k, v] of Object.entries(parsed.headers)) {
    lines.push(indent(`${quote(k)}: ${quote(v)},`, p + 1));
  }
  lines.push(indent('},', p));
  if (parsed.body) {
    const bodyArg = /^[{[]/.test(parsed.body)
      ? parsed.body
      : quote(parsed.body);
    lines.push(indent(`body: ${bodyArg},`, p));
  }
  if (parsed.insecure) {
    lines.push(indent('// Note: --insecure flag ignored in browser fetch', p));
  }
  lines.push('});');
  if (p > 0) lines.push('');
  lines.push('const data = await response.json();');

  return lines.join('\n');
}

function generateAxios(parsed: ParsedCurl, opts: GenerateOptions): string {
  const lines: string[] = [];
  const p = opts.pretty ? 1 : 0;

  lines.push('// npm install axios');
  lines.push('import axios from "axios";');
  lines.push('');

  const configLines: string[] = [];
  configLines.push(indent(`method: ${quote(parsed.method)},`, p));
  configLines.push(indent(`url: ${quote(parsed.url)},`, p));

  if (Object.keys(parsed.headers).length > 0) {
    configLines.push(indent('headers: {', p));
    for (const [k, v] of Object.entries(parsed.headers)) {
      configLines.push(indent(`${quote(k)}: ${quote(v)},`, p + 1));
    }
    configLines.push(indent('},', p));
  }

  if (parsed.body) {
    const bodyArg = /^[{[]/.test(parsed.body)
      ? parsed.body
      : quote(parsed.body);
    configLines.push(indent(`data: ${bodyArg},`, p));
  }

  lines.push(`axios(${quote(parsed.url)}, {`);
  lines.push(configLines.join('\n'));
  lines.push('})');
  lines.push(indent('.then(res => console.log(res.data))', p));
  lines.push(indent('.catch(err => console.error(err));', p));

  return lines.join('\n');
}

function generatePython(parsed: ParsedCurl, opts: GenerateOptions): string {
  const lines: string[] = [];
  const p = opts.pretty ? 1 : 0;

  lines.push('# pip install requests');
  lines.push('import requests');
  lines.push('');

  const args: string[] = [];
  args.push(indent(`"${parsed.url}"`, p));
  args.push(indent(`method="${parsed.method}"`, p));

  if (Object.keys(parsed.headers).length > 0) {
    args.push(indent('headers={', p));
    for (const [k, v] of Object.entries(parsed.headers)) {
      args.push(indent(`    "${k}": "${v}",`, p + 1));
    }
    args.push(indent('}', p));
  }

  if (parsed.body) {
    if (/^[{[]/.test(parsed.body)) {
      args.push(indent(`json=${parsed.body},`, p));
    } else {
      args.push(indent(`data="${parsed.body}",`, p));
    }
  }

  if (parsed.insecure) {
    args.push(indent('verify=False,  # equivalent to --insecure', p));
  }

  lines.push(`response = requests.request(`);
  lines.push(args.join(',\n'));
  lines.push(`)`);
  lines.push('');
  lines.push('print(response.status_code)');
  lines.push('print(response.text)');

  return lines.join('\n');
}

function generateGo(parsed: ParsedCurl, opts: GenerateOptions): string {
  const lines: string[] = [];
  const p = opts.pretty ? 1 : 0;

  lines.push('package main');
  lines.push('');
  lines.push('import (');
  lines.push(indent('"fmt"', p));
  lines.push(indent('"io/ioutil"', p));  // nolint
  lines.push(indent('"net/http"', p));
  if (parsed.body) {
    lines.push(indent('"strings"', p));
  }
  lines.push(')');
  lines.push('');

  lines.push('func main() {');
  lines.push(indent(`url := "${parsed.url}"`, p));

  if (parsed.body) {
    lines.push(indent(`payload := strings.NewReader(${quote(parsed.body)})`, p));
  }

  lines.push(indent(`req, _ := http.NewRequest("${parsed.method}", url`, p));
  if (parsed.body) {
    lines.push(indent(', payload', p + 10));
  }
  lines.push(indent(')', p));

  for (const [k, v] of Object.entries(parsed.headers)) {
    lines.push(indent(`req.Header.Add("${k}", "${v}")`, p));
  }

  lines.push('');

  const clientArg = parsed.insecure ? '&http.Transport{...} // TODO: TLS skip verify' : '';
  lines.push(indent(`client := &http.Client{${clientArg}}`, p));
  lines.push(indent('resp, err := client.Do(req)', p));
  lines.push(indent('if err != nil {', p));
  lines.push(indent('panic(err)', p + 1));
  lines.push(indent('}', p));
  lines.push(indent('defer resp.Body.Close()', p));
  lines.push(indent('body, _ := ioutil.ReadAll(resp.Body)', p));
  lines.push(indent('fmt.Println(string(body))', p));
  lines.push('}');

  return lines.join('\n');
}

const GENERATORS: Record<CodeTarget, (p: ParsedCurl, o: GenerateOptions) => string> = {
  fetch: generateFetch,
  axios: generateAxios,
  python: generatePython,
  go: generateGo,
};

/**
 * Convert a parsed cURL command to the target language.
 */
export function generateCode(
  parsed: ParsedCurl,
  target: CodeTarget,
  opts: GenerateOptions = { pretty: true },
): Result<string> {
  try {
    const gen = GENERATORS[target];
    if (!gen) return err(`Unknown target: ${target}`);
    return ok(gen(parsed, opts));
  } catch (e: any) {
    return err(`Code generation error: ${e.message}`);
  }
}
