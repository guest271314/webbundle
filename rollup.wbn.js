import * as esbuild from "esbuild";
import * as rollup from "rollup";
import * as wbnSign from "wbn-sign-webcrypto";
import * as fs from "node:fs";
import * as path from "node:path";
import * as crypto from "node:crypto";
const { webcrypto } = crypto;
const algorithm = { name: "Ed25519" };

fs.writeFileSync("./src/script.js", `resizeTo(400,300); console.log("Signed Web Bundle for Isolated Web App using ${navigator.userAgent}")`);

// https://github.com/tQsW/webcrypto-curve25519/blob/master/explainer.md
const cryptoKey = await webcrypto.subtle.generateKey(
  algorithm.name,
  true, /* extractable */
  ["sign", "verify"],
);

await esbuild.build({
  entryPoints: ["src/index.ts"],
  platform: "node",
  outfile: "wbn-bundle.js",
  format: "esm",
  packages: "external",
  legalComments: "inline",
  sourcemap: true,
  bundle: true,
  keepNames: true,
  allowOverwrite: true
});

const { default: wbnOutputPlugin} = await import("./wbn-bundle.js");

const build = async () => {
  /*
  const key = parsePemKey(
    privateKey,
  );
  */
  // https://github.com/GoogleChromeLabs/webbundle-plugins/blob/d251f6efbdb41cf8d37b9b7c696fd5c795cdc231/packages/rollup-plugin-webbundle/test/test.js#L408
  // wbn-sign/lib/signers/node-crypto-signing-strategy.js
  class CustomSigningStrategy {
    async sign(data) {
      return new Uint8Array(
        await webcrypto.subtle.sign(algorithm, cryptoKey.privateKey, data),
      );
      // crypto.sign(
      // /*algorithm=*/ //undefined,
      // data,
      // key,
      //);
    }
    async getPublicKey() {
      return cryptoKey.publicKey; // crypto.createPublicKey(key);
    }
  }
  const bundle = await rollup.rollup({
    input: "./src/script.js",
    plugins: [
      wbnOutputPlugin({
        baseURL: await new wbnSign.WebBundleId(
          cryptoKey.publicKey,
        ).serializeWithIsolatedWebAppOrigin(),
        static: { dir: "assets" },
        output: "signed.swbn",
        integrityBlockSign: {
          strategy: new CustomSigningStrategy(), // new wbnSign.NodeCryptoSigningStrategy(key),
        },     
        headerOverride: {
          "cross-origin-embedder-policy": "require-corp",
          "cross-origin-opener-policy": "same-origin",
          "cross-origin-resource-policy": "same-origin",
          "content-security-policy":
            "base-uri 'none'; default-src 'self'; object-src 'none'; frame-src 'self' https: blob: data:; connect-src 'self' https: wss:; script-src 'self' 'wasm-unsafe-eval'; img-src 'self' https: blob: data:; media-src 'self' https: blob: data:; font-src 'self' blob: data:; style-src 'self' 'unsafe-inline'; require-trusted-types-for 'script';",
        },       
      }),
    ],
  });

  const { output } = await bundle.generate({ format: "esm" });
  const [{ fileName, source }] = output;
  fs.writeFileSync(fileName, source);
  return `${fileName}, ${source.byteLength} bytes.`;
};

build()
 .then(console.log).catch(console.error);
