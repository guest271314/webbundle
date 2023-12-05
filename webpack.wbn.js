/**
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const WebBundlePlugin = require("webbundle-webpack-plugin");
const { WebBundleId, parsePemKey } = require("wbn-sign");
const { merge } = require("webpack-merge");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const fs = require("fs");
const path = require("path");

const privateKeyFile = "ed25519key.pem";
let privateKey;
if (process.env.ED25519KEY) {
  privateKey = process.env.ED25519KEY;
} else if (fs.existsSync(privateKeyFile)) {
  privateKey = fs.readFileSync(privateKeyFile);
}

let webBundlePlugin;
if (privateKey) {
  const parsedPrivateKey = parsePemKey(privateKey);

  webBundlePlugin = new WebBundlePlugin({
    baseURL: new WebBundleId(
      parsedPrivateKey,
    ).serializeWithIsolatedWebAppOrigin(),
    output: "signed.swbn",
    integrityBlockSign: {
      key: parsedPrivateKey,
    },
  });
} else {
  webBundlePlugin = new WebBundlePlugin({
    baseURL: "/",
    output: "signed.wbn",
  });
}

module.exports = {
  entry: "./src/script.js",
  module: {
    rules: [
      {
        test: /\.html$/,
        loader: "html-loader",
      },
    ],
  },
  mode: "production",
  plugins: [
    webBundlePlugin,
    new HtmlWebpackPlugin({
      template: "src/index.html",
    }),
    new CopyPlugin({
      patterns: [
        { from: "assets" },
      ],
    }),
  ],
  resolve: {
    extensions: [".js"],
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    publicPath: "./",
    trustedTypes: {
      policyName: "webbundle#webpack",
    },
  },
};