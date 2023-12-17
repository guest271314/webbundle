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

`assets` directory contains `manifest.webmanifest` and any other scripts or resources to be bundled.

Compile `src/index.ts` into a module for Rollup usage

```
bun run build-rollup
```

Build the Signed Web Bundle using Webpack. Move `index.html` to `src` directory for Webpack. Remove `<script src="script.js">` from the HTML.

```
node webpack.wbn.js
```

Build the Signed Web Bundle using Rollup. Move `index.html` to `assets` directory for Rollup. Include `<script src="script.js">` in the HTML.

```
node --experimental-default-type=module rollup.wbn.js
```

# W.I.P.

`index.js` is a work in progress to use only `wbn` and `wbn-sign` packages to build the Signed Web Bundle and Isolated Web App, without using `webbundle-webpack-plugin` and the other Webpack plugins currently in `package.json`.

# TODO

This should work in the browser without dependence on `node` or `node_modules`. Substitute Web Cryptography API for `node:crypto`.

# License
Do What the Fuck You Want to Public License [WTFPLv2](http://www.wtfpl.net/about/)
