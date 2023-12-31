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

# Install Isolated Web App using Signed Web Bundle

Navigate to `chrome://web-app-internals/`, click `Select file...` and select `signed.swbn`.

# TODO

- This should work in the browser.
- Install and run using `deno` without needing to run import the dynamically created bundle `wbn-bundle.js` twice; the first run throwing module not found error. For now generate and import the bundle twice; the first dynamic import in `deno_install.js`, catching the error, to avoid the error for first run being thrown in `rollup.wbn.js` which generates the `signed.swbn` file.
- Install [`wbn-sign-webcrypto`](https://github.com/guest271314/wbn-sign-webcrypto) dependency from GitHub repository using `deno`. Completed.
- Substitute Web Cryptography API for `node:crypto`. Completed.


# License
Do What the Fuck You Want to Public License [WTFPLv2](http://www.wtfpl.net/about/)
