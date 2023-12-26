import * as esbuild from "esbuild";
import * as wbnSign from "wbn-sign";
import * as rollup from "rollup";
import base32Encode from "base32-encode";
import * as fs from "node:fs";
import * as path from "node:path";
import * as util from "node:util";
import * as crypto from "node:crypto";
import { exec } from "node:child_process";

const execAsync = util.promisify(exec);
const generateKeyCommand =
  `openssl genpkey -algorithm ed25519 -out private.pem`;
const { stderr } = await execAsync(generateKeyCommand);
const privateKeyFile = "private.pem";
const privateKey = fs.readFileSync(privateKeyFile);

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
});

const { default: wbnOutputPlugin } = await import("./wbn-bundle.js");

// wbn-sign/lib/utils/utils.js
// A helper function which can be used to parse string formatted keys to
// KeyObjects.
function parsePemKey(unparsedKey, passphrase) {
  return crypto.createPrivateKey({
    key: unparsedKey,
    passphrase,
  });
}
function getRawPublicKey(publicKey) {
  // Currently this is the only way for us to get the raw 32 bytes of the public key.
  return new Uint8Array(
    publicKey.export({ type: "spki", format: "der" }).slice(-32),
  );
}
// Throws an error if the key is not a valid Ed25519 key of the specified type.
function checkIsValidEd25519Key(expectedKeyType, key) {
  if (key.type !== expectedKeyType) {
    throw new Error(
      `Expected key type to be ${expectedKeyType}, but it was "${key.type}".`,
    );
  }
  if (key.asymmetricKeyType !== "ed25519") {
    throw new Error(
      `Expected asymmetric key type to be "ed25519", but it was "${key.asymmetricKeyType}".`,
    );
  }
}
// wbn-sign/lib/web-bundle-id.js
// Web Bundle ID is a base32-encoded (without padding) ed25519 public key
// transformed to lowercase. More information:
// https://github.com/WICG/isolated-web-apps/blob/main/Scheme.md#signed-web-bundle-ids
class WebBundleId {
  // https://github.com/WICG/isolated-web-apps/blob/main/Scheme.md#suffix
  appIdSuffix = [0x00, 0x01, 0x02];
  scheme = "isolated-app://";
  key;
  constructor(ed25519key) {
    if (ed25519key.asymmetricKeyType !== "ed25519") {
      throw new Error(
        `WebBundleId: Only ed25519 keys are currently supported. Your key's type is ${ed25519key.asymmetricKeyType}.`,
      );
    }
    if (ed25519key.type === "private") {
      this.key = crypto.createPublicKey(ed25519key);
    } else {
      this.key = ed25519key;
    }
  }
  serialize() {
    return base32Encode(
      new Uint8Array([...getRawPublicKey(this.key), ...this.appIdSuffix]),
      "RFC4648",
      { padding: false },
    ).toLowerCase();
  }
  serializeWithIsolatedWebAppOrigin() {
    return `${this.scheme}${this.serialize()}/`;
  }
  toString() {
    return `\
  Web Bundle ID: ${this.serialize()}
  Isolated Web App Origin: ${this.serializeWithIsolatedWebAppOrigin()}`;
  }
}

const build = async () => {
  const key = parsePemKey(
    privateKey,
  );
  // https://github.com/GoogleChromeLabs/webbundle-plugins/blob/d251f6efbdb41cf8d37b9b7c696fd5c795cdc231/packages/rollup-plugin-webbundle/test/test.js#L408
  // wbn-sign/lib/signers/node-crypto-signing-strategy.js
  class CustomSigningStrategy {
    async sign(data) {
      return crypto.sign(
        /*algorithm=*/ undefined,
        data,
        key,
      );
    }
    async getPublicKey() {
      return crypto.createPublicKey(key);
    }
  }
  const bundle = await rollup.rollup({
    input: "./src/script.js",
    plugins: [
      wbnOutputPlugin({
        baseURL: new WebBundleId(
          key,
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
  return { fileName, source };
};

build()
  .then(console.log).catch(console.error);
