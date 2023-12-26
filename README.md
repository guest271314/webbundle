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

Generate `.pem` file

```
openssl genpkey -algorithm Ed25519 -out ed25519key.pem
```

Entry point is `src` directory, main script is `script.js`.

`assets` directory contains `manifest.webmanifest`, `index.html` and any other scripts or resources to be bundled.

Build the Signed Web Bundle using Rollup

```
node --experimental-default-type=module rollup.wbn.js
```

# Install Isolated Web App using Signed Web Bundle

Navigate to `chrome://web-app-internals/`, click `Select file...` and select `signed.swbn`.

# W.I.P.

`test-wbn-sign-standalone.js` is a work in progress to use only `wbn` and `wbn-sign` packages to build the Signed Web Bundle and Isolated Web App, without using Rollup.

# TODO

This should work in the browser without dependence on `node` or `node_modules`. Substitute Web Cryptography API for `node:crypto`.

# License
Do What the Fuck You Want to Public License [WTFPLv2](http://www.wtfpl.net/about/)
