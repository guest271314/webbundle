import { build } from "esbuild";

try {
  console.log(await build({
    entryPoints: ["src/index.ts"],
    platform: "node",
    outfile: "./wbn-bundle.js",
    format: "esm",
    packages: "external",
    legalComments: "inline",
    sourcemap: true,
    bundle: true,
    keepNames: true,
    allowOverwrite: true,
  }));
} catch (e) {
  console.log(e);
}
