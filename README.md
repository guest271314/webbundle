# webbundle
Web Bundle and Isolated Web App experiments

# Usage

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

Entry point is `src` directory, main script is `script.js`.

`assets` directory contains `manifest.webmanifest`, `index.html` and any other scripts or resources to be bundled.

# Build the Signed Web Bundle and Isolated Web App using Rollup

Write `signed.swbn` to current directory

Node.js 
```
node --experimental-default-type=module rollup.wbn.js
```

Bun
```
bun run rollup.wbn.js
```

Deno
```
deno run --unstable-byonm -A rollup.wbn.js
```
Note: `deno run --unstable-byonm -A rollup.wbn.js` currently needs to be run twice to generate `signed.swbn`; the first time a module not found error is thrown for the dynamic bundle import `const { default: wbnOutputPlugin} = await import("./wbn-bundle.js")` in `rollup.wbn.js`.

# Install Isolated Web App using Signed Web Bundle

Navigate to `chrome://web-app-internals/`, click `Select file...` and select `signed.swbn`.

# TODO

- This should work in the browser.
- Install and run using `deno` without needing to run `deno run --unstable-byonm -A rollup.wbn.js` twice, the first run throwing module not found error for dynamic import of bundle `wbn-bundle.js`.
- Install [`wbn-sign-webcrypto`](https://github.com/guest271314/wbn-sign-webcrypto) dependency from GitHub repository using `deno`. Completed.
- Substitute Web Cryptography API for `node:crypto`. Completed.


# License
Do What the Fuck You Want to Public License [WTFPLv2](http://www.wtfpl.net/about/)
