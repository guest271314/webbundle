## webbundle
Web Bundle and Isolated Web App experiments

## Usage

Fetch dependencies

```
bun install
```

or 

```
npm install
```

or 

```
deno run -A deno_install.js
```

Entry point is `assets` directory; contains `manifest.webmanifest`, `index.html`, `script.js` and any other scripts or resources to be bundled. 

## Generate private and public keys, write to file system 

This only has to be done once.

```
node --experimental-default-type=module generateWebCryptoKeys.js
```

## Build the Signed Web Bundle and Isolated Web App

Write `signed.swbn` to current directory

Node.js 
```
node --experimental-default-type=module index.js
```

Bun
```
bun run index.js
```

Deno
```
deno run --unstable-byonm -A index.js
```

# Install Isolated Web App using Signed Web Bundle

Navigate to `chrome://web-app-internals/`, click `Select file...` and select `signed.swbn`.

## Dynamically build/rebuild `wbn-bundle.js` from `src/index.ts` with `esbuild` and run

```
// import bundleIsolatedWebApp from "./wbn-bundle.js";
import * as esbuild from "esbuild";

// Deno-specific workaround for dynamic imports. 
const dynamicImport = "./wbn-bundle.js";

await esbuild.build({
  entryPoints: ["src/index.ts"],
  platform: "node",
  outfile: dynamicImport,
  format: "esm",
  packages: "external",
  legalComments: "inline",
  sourcemap: true,
  bundle: true,
  keepNames: true,
  allowOverwrite: true,
});

// https://github.com/denoland/deno/issues/20945
// "" + "/path" and "/path" + "": Deno-specific workaround to avoid module not found error
 const { default: bundleIsolatedWebApp } = await import(dynamicImport);
```

## Build/rebuild `wbn-bundle.js` from `src/index.ts` with `bun`

```
bun build ./src/index.ts --target bun --format esm --outfile wbn-bundle.js -e cborg -e base32-encode --minify
```

## TODO

- This should work in the browser.
- Install and run using `deno` without needing to run import the dynamically created bundle `wbn-bundle.js` twice; the first run throwing module not found error. For now generate and import the bundle twice; the first dynamic import in `deno_install.js`, catching the error, to avoid the error for first run being thrown in `rollup.wbn.js` which generates the `signed.swbn` file. Completed (see [this commit](https://github.com/guest271314/webbundle/commit/1623ecb09d12464234f2b17d888e66f652acdb07)).
- Install [`wbn-sign-webcrypto`](https://github.com/guest271314/wbn-sign-webcrypto) dependency from GitHub repository using `deno`. Completed.
- Substitute Web Cryptography API for `node:crypto`. Completed.


## License
Do What the Fuck You Want to Public License [WTFPLv2](http://www.wtfpl.net/about/)
