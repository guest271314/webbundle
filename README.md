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

- Install [`wbn-sign-webcrypto`](https://github.com/guest271314/wbn-sign-webcrypto) dependency from GitHub repository using `deno`.

- Substitute Web Cryptography API for `node:crypto`. Completed.


# License
Do What the Fuck You Want to Public License [WTFPLv2](http://www.wtfpl.net/about/)
