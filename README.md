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

Build the Signed Web Bundle

```
node webpack.wbn.js
```

# W.I.P.

`index.js` is a work in progress to use only `wbn` and `wbn-sign` packages to build the Signed Web Bundle and Isolated Web App, without using `webbundle-webpack-plugin` and the other Webpack plugins currently in `package.json`.

# License
Do What the Fuck You Want to Public License [WTFPLv2](http://www.wtfpl.net/about/)
