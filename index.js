// globalThis.Buffer ??= (await import("node:buffer")).Buffer; // For Deno
//import { Buffer } from "Buffer";
//globalThis.Buffer = Buffer;
import bundleIsolatedWebApp from "./wbn-bundle.js";
import { WebBundleId } from "./web-bundle-id.js";
document.querySelector("h1").addEventListener("click", async () => {
  const { Buffer } = await import("Buffer");

  Buffer.prototype.readBigUint64BE = Buffer.prototype.readBigUInt64BE;
  globalThis.Buffer = Buffer;

  //import * as fs from "node:fs";
  // import * as path from "node:path";
  //import * as crypto from "node:crypto";
  const webcrypto = crypto;
  const algorithm = { name: "Ed25519" };
  const decoder = new TextDecoder();
  /*
const controller = fs.readFileSync("./direct-sockets/direct-socket-controller.js");
const script = fs.readFileSync("./assets/script.js");
const privateKey = fs.readFileSync("./privateKey.json");
const publicKey = fs.readFileSync("./publicKey.json");

// https://github.com/tQsW/webcrypto-curve25519/blob/master/explainer.md
const cryptoKey = {
  privateKey: await webcrypto.subtle.importKey(
    "jwk",
    JSON.parse(decoder.decode(privateKey)),
    algorithm.name,
    true,
    ["sign"],
  ),
  publicKey: await webcrypto.subtle.importKey(
    "jwk",
    JSON.parse(decoder.decode(publicKey)),
    algorithm.name,
    true,
    ["verify"],
  ),
};
  */

  const cryptoKey = await webcrypto.subtle.generateKey(
    algorithm,
    true, /* extractable */
    ["sign", "verify"],
  );
  const isolatedWebAppURL = await new WebBundleId(
    cryptoKey.publicKey,
  ).serializeWithIsolatedWebAppOrigin();

  console.log({ bundleIsolatedWebApp, isolatedWebAppURL });
  /*
fs.writeFileSync(
  "./direct-sockets/direct-socket-controller.js",
  decoder.decode(controller).replace(
    "IWA_URL",
    `isolated-app://${new URL(isolatedWebAppURL).hostname}`
  )
);

fs.writeFileSync(
  "./assets/script.js",
  decoder.decode(script).replace(
     /USER_AGENT\s=\s"?.+"/g,
    `USER_AGENT = "Built with ${navigator.userAgent}"`,
  ),
);
  */
  const { fileName, source } = await bundleIsolatedWebApp({
    baseURL: isolatedWebAppURL,
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
  // fs.writeFileSync(fileName, source);
  const handle = await showSaveFilePicker({
    startIn: "downloads",
    suggestedName: "signed.swbn",
  });

  await new Blob([source], { type: "application/octet-stream" })
    .stream().pipeTo(await handle.createWritable());
});
//globalThis._u = source;
// console.log(globalThis._u);

/*
undefined
var blob = new Blob([new Uint8Array(u)], {type:"application/octet-stream"});
var handle = await showSaveFilePicker({
  suggestedName: "browser-test.swbn",
  startIn: "documents"
});

var writable = await handle.createWritable();
await blob.stream().pipeTo(writable);
*/
