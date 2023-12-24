import * as esbuild from "esbuild";
import * as wbnSign from "wbn-sign";
import * as rollup from "rollup";
import * as fs from "node:fs";
import * as path from "node:path";

const privateKeyFile = "ed25519key.pem";
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

const {default: wbnOutputPlugin} = await import("./wbn-bundle.js");

const build = async () => {
  const key = wbnSign.parsePemKey(
    privateKey
  );

  const bundle = await rollup.rollup({
    input: "./src/script.js",
    plugins: [
      wbnOutputPlugin({
        baseURL: new wbnSign.WebBundleId(
          key,
        ).serializeWithIsolatedWebAppOrigin(),
        static: { dir: "assets" },
        output: "signed.swbn",
        integrityBlockSign: {
          strategy: new wbnSign.NodeCryptoSigningStrategy(key),
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

  const { output } = await bundle.generate({ format: 'esm' });
  const [{ fileName, source }] = output;
  fs.writeFileSync(fileName, source);
  return { fileName, source }
};

build()
.then(console.log).catch(console.error);
