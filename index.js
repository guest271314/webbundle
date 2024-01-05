import bundleIsolatedWebApp from "./wbn-bundle.js";
import * as wbnSign from "wbn-sign-webcrypto";
import * as fs from "node:fs";
import * as path from "node:path";
import * as crypto from "node:crypto";
const { webcrypto } = crypto;
const algorithm = { name: "Ed25519" };

fs.writeFileSync("./assets/script.js", `resizeTo(400,300); console.log("Signed Web Bundle for Isolated Web App using ${navigator.userAgent}")`);

// https://github.com/tQsW/webcrypto-curve25519/blob/master/explainer.md
const cryptoKey = await webcrypto.subtle.generateKey(
  algorithm.name,
  true, /* extractable */
  ["sign", "verify"],
);

const { fileName, source } = await bundleIsolatedWebApp({
  baseURL: await new WebBundleId(
    cryptoKey.publicKey,
  ).serializeWithIsolatedWebAppOrigin(),
  static: { dir: "assets" },
  formatVersion: "b2",
  output: "signed.swbn",
  integrityBlockSign: {
    isIwa: true,
    // https://github.com/GoogleChromeLabs/webbundle-plugins/blob/d251f6efbdb41cf8d37b9b7c696fd5c795cdc231/packages/rollup-plugin-webbundle/test/test.js#L408
    // wbn-sign/lib/signers/node-crypto-signing-strategy.js
    strategy: new (class CustomSigningStrategy {
      async sign(data) {
        return new Uint8Array(
          await webcrypto.subtle.sign(algorithm, cryptoKey.privateKey, data),
        );
      }
      async getPublicKey() {
        return cryptoKey.publicKey;
      }
    })(),
  },
  headerOverride: {
    "cross-origin-embedder-policy": "require-corp",
    "cross-origin-opener-policy": "same-origin",
    "cross-origin-resource-policy": "same-origin",
    "content-security-policy":
      "base-uri 'none'; default-src 'self'; object-src 'none'; frame-src 'self' https: blob: data:; connect-src 'self' https: wss:; script-src 'self' 'wasm-unsafe-eval'; img-src 'self' https: blob: data:; media-src 'self' https: blob: data:; font-src 'self' blob: data:; style-src 'self' 'unsafe-inline'; require-trusted-types-for 'script';",
  },
});
fs.writeFileSync(fileName, source);
console.log(`${fileName}, ${source.byteLength} bytes.`);
