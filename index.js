import * as wbn from "wbn";
import * as wbnSign from "wbn-sign";
import * as fs from "node:fs";

const headers = {
  "content-security-policy":
    "base-uri 'none'; default-src 'self'; object-src 'none'; frame-src 'self' https: blob: data:; connect-src 'self' https:; script-src 'self' 'wasm-unsafe-eval'; img-src 'self' https: blob: data:; media-src 'self' https: blob: data:; font-src 'self' blob: data:; require-trusted-types-for 'script'; frame-ancestors 'self';",
  "cross-origin-embedder-policy": "require-corp",
  "cross-origin-opener-policy": "same-origin",
  "cross-origin-resource-policy": "same-origin",
};

const privateKey = wbnSign.parsePemKey(
  fs.readFileSync("ed25519key.pem", "utf-8"),
);

// Web Bundle ID only:
const webBundleId = new wbnSign.WebBundleId(privateKey).serialize();

// With origin, meaning "isolated-app://" combined with Web Bundle ID:
const webBundleIdWithIWAOrigin = new wbnSign.WebBundleId(
  privateKey,
).serializeWithIsolatedWebAppOrigin();

console.log(webBundleId, webBundleIdWithIWAOrigin);

const builder = new wbn.BundleBuilder();

builder.addExchange(
  webBundleIdWithIWAOrigin + "index.html", // URL
  200, // response code
  { "Content-Type": "text/html", ...headers }, // response headers
  fs.readFileSync("index.html"), // response body (string or Uint8Array)
);

builder.addExchange(
  webBundleIdWithIWAOrigin + "script.js", 
  200,
  { "Content-Type": "text/javascript", ...headers }, 
  fs.readFileSync("script.js"), 
);

builder.addExchange(
  webBundleIdWithIWAOrigin + "manifest.webmanifest", 
  200, 
  { "Content-Type": "application/manifest+json", ...headers }, 
  fs.readFileSync("manifest.webmanifest"), 
);

builder.setPrimaryURL(webBundleIdWithIWAOrigin); 

fs.writeFileSync("out.wbn", builder.createBundle());

const buf = fs.readFileSync("out.wbn");
const bundle = new wbn.Bundle(buf);
const exchanges = [];
for (const url of bundle.urls) {
  const resp = bundle.getResponse(url);
  exchanges.push({
    url,
    status: resp.status,
    headers: resp.headers,
    body: new TextDecoder("utf-8").decode(resp.body),
  });
}
console.log(
  JSON.stringify(
    {
      version: bundle.version, // format version
      exchanges,
    },
    null,
    2,
  ),
);

// Option 1: With the default (`NodeCryptoSigningStrategy`) signing strategy.
const { signedWebBundle } = await new wbnSign.IntegrityBlockSigner(
  buf,
  new wbnSign.NodeCryptoSigningStrategy(privateKey),
).sign();

fs.writeFileSync("signed.swbn", signedWebBundle);
