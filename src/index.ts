// import { getAuthToken } from './auth.js';
// import type { ConnectedAppOptions } from './auth.js';
// import { query } from './graphql.js';

// import fs from 'fs';

// const configRaw = fs.readFileSync(new URL('../config.json', import.meta.url), 'utf8');
// const config = JSON.parse(configRaw) as Record<string, any>;
 
// const [tokenName, endpoint, request] = process.argv.slice(2);
 
// const usage = () => { console.log('\n\u{1F4E2} usage: npm start [token-name] [endpoint] [graphql-request]\n'); process.exit(1); }
// const error = (msg:string) => console.error(`\u{274C} ${msg}`);
 
// if (!tokenName || !request) {
//     error('missing argument');
//     usage();
// }

// const tokenInfo = config[tokenName as string] as ConnectedAppOptions | undefined;
// if (!tokenInfo) {
//     error(`bad token name: ${tokenName}, check your config.json file!`);
//     usage();
// }
 
// (async () => {
//     try {
//         // Pass a meaningful audience — try tokenInfo.url or a specific aud required by your Sage X3 setup
//         const token = getAuthToken(tokenInfo!, tokenInfo!.url);
//         console.log('Generated Token:', token);
//         const result = await query(tokenInfo!.url, endpoint ?? '', token, request!);
//         // query() already returns response.data
//         console.log(JSON.stringify(result, null, 2));
//     } catch (e) {
//         // Show full error message (including the enriched message from graphql.ts)
//         if (e instanceof Error) {
//             error(e.message);
//         } else {
//             error(String(e));
//         }
//     }
// })();

import * as https from "https";
import axios from "axios";
import jwt from "jsonwebtoken";
import fs from "fs";

interface ConnectedAppOptions {
  clientId: string;
  secret: string;
  url: string;
  user: string;
  lifetime: number;
}

// --- Lecture config ---
const configRaw = fs.readFileSync(new URL("../config.json", import.meta.url), "utf8");
const config: Record<string, ConnectedAppOptions> = JSON.parse(configRaw);

// --- Arguments ---
const [tokenName, endpoint, request] = process.argv.slice(2);

if (!tokenName || !request) {
  console.error("❌ Usage: npm start [token-name] [endpoint] [graphql-request]");
  process.exit(1);
}

const tokenInfo = config[tokenName];
if (!tokenInfo) {
  console.error(`❌ Bad token name: ${tokenName}, check your config.json`);
  process.exit(1);
}

// --- Génération du token HS256 ---
function getAuthToken(options: ConnectedAppOptions): string {
  const { clientId, secret, user, lifetime } = options;
  const nowInSeconds = Math.floor(Date.now() / 1000);
  const expInSeconds = nowInSeconds + (lifetime || 300);

  const payload: Record<string, any> = {
    iss: clientId,
    aud: "xtrem",  // ou ""
    iat: nowInSeconds,
    exp: expInSeconds,
    sub: user, // attention à la casse exacte dans X3 (TBC)
  };

  console.log("JWT Payload:", payload);

  return jwt.sign(payload, secret, { algorithm: "HS256" });
}

// --- Axios client HTTPS ---
const client = axios.create({
  httpsAgent: new https.Agent({ rejectUnauthorized: false }), // pour dev / self-signed
});

// --- Fonction query GraphQL ---
async function query(url: string, endpoint: string, token: string, request: string) {
  try {
    console.log("Sending request to:", { url, endpoint, request });
    console.log("Using token:", token);
    const response = await client.post(
      url,
      { query: request },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-xtrem-endpoint": endpoint,
        },
      }
    );
    console.log("✅ Response:", JSON.stringify(response.data, null, 2));
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      console.error(
        `❌ Request failed with status ${err.response?.status}:`,
        JSON.stringify(err.response?.data)
      );
    } else {
      console.error(err);
    }
  }
}

// --- Execution ---
(async () => {
  const token = getAuthToken(tokenInfo);
  await query(tokenInfo.url, endpoint ?? "", token, request!);
})();
