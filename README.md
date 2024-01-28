### [webbundle](https://github.com/guest271314/webbundle/main/browser) in the browser.

### Usage

Launch Chromium or Chrome with [`--enable-experimental-web-platform-features`](https://peter.sh/experiments/chromium-command-line-switches/#enable-experimental-web-platform-features),
start local `node` server, `node --expreimental-detect-module srever.js`, navigate to `http://localhost:8888/index.html`, click `Bundle` in the HTML document, save the `signed.swbn` file, open `chrome://web-app-internals`, click `Select file...` adjacent to `Install IWA from Signed Web Bundle: ` and select `signed.swbn`.
Navigate to `chrome://apps` and click the `Browser Signed Web Bundle in Isolated Web App` launcher.

### License
Do What the Fuck You Want to Public License [WTFPLv2](http://www.wtfpl.net/about/)

