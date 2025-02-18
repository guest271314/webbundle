### webbundle
Web Bundle and Isolated Web App experiments

### Install dependencies

#### Fetch dependencies using `package.json`

```
bun install
```

or 

```
npm install
```

#### Programmatically create `node_modules` folder and add `wbn-sign-webcrypto` to the folder from the GitHub repository

```
deno run -A deno_install.js
```

#### Dynamically fetch dependencies without creating a `node_modules` folder and create the `.swbn` file and IWA.

```
deno run -A --unstable-byonm --import-map=deno.json index.js
```

### Signed Web Bundle/Isolated Web App source files

Entry point is `assets` directory; contains `manifest.webmanifest`, `index.html`, `script.js` and any other scripts or resources to be bundled. 

### Generate private and public keys, write to file system 

This only has to be done once.

```
node --experimental-default-type=module generateWebCryptoKeys.js
```

### Build the Signed Web Bundle and Isolated Web App

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

### Install Isolated Web App using Signed Web Bundle

Navigate to `chrome://web-app-internals/`, click `Select file...` and select `signed.swbn`.

### Build/rebuild `wbn-bundle.js` from `src/index.ts` with `bun`

```
try {
  console.log(
    await Bun.build({
      entrypoints: ["./src/index.ts"],
      outdir: ".",
      sourcemap: "external",
      splitting: false,
      target: "bun" // or "node"
      format: "esm",
      // minify: true,
      external: ["mime", "base32-encode", "wbn-sign-webcrypto", "wbn"],
      naming: {
        entry: "[dir]/wbn-bundle.[ext]",
      },
    }),
  );
} catch (e) {
  console.log(e);
}
```

### Dynamically build/rebuild `wbn-bundle.js` from `src/index.ts` with `esbuild` and run

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

### Compile `index.js` to a standalone executable

#### Deno 
Note, this is possible using Deno without `node_modules` in the current directory, using the import map in `deno.json`. `deno` creates a `node_modules` folder, fetches and populate with the compile dependencies `@types/node`, `undici-types`, then compiles and outputs the self-contained executable, 96.8 MB (after `strip deno`).

```
 deno compile -A --output deno_webbundle ./index.js

```
#### Bun

When `node_modules` populated with dependencies, creates a 89.1 MB (after `strip bun`) standalone binary.

```
bun build ./index.js --compile --outfile=bun_webbundle

```

## Examples

- [telnet-client](https://github.com/guest271314/telnet-client)
- [direct-sockets-http-ws-server](https://github.com/guest271314/direct-sockets-http-ws-server)


### TODO

- This should work in the browser.
- Install and run using `deno` without needing to run import the dynamically created bundle `wbn-bundle.js` twice; the first run throwing module not found error. For now generate and import the bundle twice; the first dynamic import in `deno_install.js`, catching the error, to avoid the error for first run being thrown in `rollup.wbn.js` which generates the `signed.swbn` file. Completed (see [this commit](https://github.com/guest271314/webbundle/commit/1623ecb09d12464234f2b17d888e66f652acdb07)).
- Install [`wbn-sign-webcrypto`](https://github.com/guest271314/wbn-sign-webcrypto) dependency from GitHub repository using `deno`. Completed.
- Substitute Web Cryptography API for `node:crypto`. Completed.


### License
Do What the Fuck You Want to Public License [WTFPLv2](http://www.wtfpl.net/about/)
