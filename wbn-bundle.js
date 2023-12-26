var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/index.ts
import { BundleBuilder as BundleBuilder2 } from "wbn";

// shared/utils.ts
import * as fs from "fs";
import * as path from "path";
import mime from "mime";
import { combineHeadersForUrl } from "wbn";
import { IntegrityBlockSigner, WebBundleId } from "wbn-sign";

// shared/iwa-headers.ts
/*!
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var coep = Object.freeze({
  "cross-origin-embedder-policy": "require-corp"
});
var coop = Object.freeze({
  "cross-origin-opener-policy": "same-origin"
});
var corp = Object.freeze({
  "cross-origin-resource-policy": "same-origin"
});
var CSP_HEADER_NAME = "content-security-policy";
var csp = Object.freeze({
  [CSP_HEADER_NAME]: "base-uri 'none'; default-src 'self'; object-src 'none'; frame-src 'self' https: blob: data:; connect-src 'self' https: wss:; script-src 'self' 'wasm-unsafe-eval'; img-src 'self' https: blob: data:; media-src 'self' https: blob: data:; font-src 'self' blob: data:; style-src 'self' 'unsafe-inline'; require-trusted-types-for 'script'; frame-ancestors 'self';"
});
var invariableIwaHeaders = Object.freeze({
  ...coep,
  ...coop,
  ...corp
});
var iwaHeaderDefaults = Object.freeze({
  ...csp,
  ...invariableIwaHeaders
});
function headerNamesToLowerCase(headers) {
  const lowerCaseHeaders = {};
  for (const [headerName, headerValue] of Object.entries(headers)) {
    lowerCaseHeaders[headerName.toLowerCase()] = headerValue;
  }
  return lowerCaseHeaders;
}
__name(headerNamesToLowerCase, "headerNamesToLowerCase");
var ifNotIwaMsg = "If you are bundling a non-IWA, set `integrityBlockSign: { isIwa: false }` in the plugin's configuration.";
function checkAndAddIwaHeaders(headers) {
  const lowerCaseHeaders = headerNamesToLowerCase(headers);
  for (const [iwaHeaderName, iwaHeaderValue] of Object.entries(
    iwaHeaderDefaults
  )) {
    if (!lowerCaseHeaders[iwaHeaderName]) {
      console.log(
        `For Isolated Web Apps, ${iwaHeaderName} header was automatically set to ${iwaHeaderValue}. ${ifNotIwaMsg}`
      );
      headers[iwaHeaderName] = iwaHeaderValue;
    }
  }
  for (const [iwaHeaderName, iwaHeaderValue] of Object.entries(
    invariableIwaHeaders
  )) {
    if (lowerCaseHeaders[iwaHeaderName] && lowerCaseHeaders[iwaHeaderName].toLowerCase() !== iwaHeaderValue) {
      throw new Error(
        `For Isolated Web Apps ${iwaHeaderName} should be ${iwaHeaderValue}. Now it is ${headers[iwaHeaderName]}. ${ifNotIwaMsg}`
      );
    }
  }
}
__name(checkAndAddIwaHeaders, "checkAndAddIwaHeaders");

// shared/utils.ts
/*!
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function addAsset(builder, baseURL, relativeAssetPath, assetContentBuffer, pluginOptions) {
  const parsedAssetPath = path.parse(relativeAssetPath);
  const isIndexHtmlFile = parsedAssetPath.base === "index.html";
  const shouldCheckIwaHeaders = typeof pluginOptions.headerOverride === "function" && "integrityBlockSign" in pluginOptions && pluginOptions.integrityBlockSign.isIwa;
  if (isIndexHtmlFile) {
    const combinedIndexHeaders = combineHeadersForUrl(
      { Location: "./" },
      pluginOptions.headerOverride,
      baseURL + relativeAssetPath
    );
    if (shouldCheckIwaHeaders)
      checkAndAddIwaHeaders(combinedIndexHeaders);
    builder.addExchange(
      baseURL + relativeAssetPath,
      301,
      combinedIndexHeaders,
      ""
      // Empty content.
    );
  }
  const baseURLWithAssetPath = baseURL + (isIndexHtmlFile ? parsedAssetPath.dir : relativeAssetPath);
  const combinedHeaders = combineHeadersForUrl(
    {
      "Content-Type": mime.getType(relativeAssetPath) || "application/octet-stream"
    },
    pluginOptions.headerOverride,
    baseURLWithAssetPath
  );
  if (shouldCheckIwaHeaders)
    checkAndAddIwaHeaders(combinedHeaders);
  builder.addExchange(
    baseURLWithAssetPath,
    200,
    combinedHeaders,
    assetContentBuffer
  );
}
__name(addAsset, "addAsset");
function addFilesRecursively(builder, baseURL, dir, pluginOptions, recPath = "") {
  const files = fs.readdirSync(dir);
  files.sort();
  for (const fileName of files) {
    const filePath = path.join(dir, fileName);
    if (fs.statSync(filePath).isDirectory()) {
      addFilesRecursively(
        builder,
        baseURL,
        filePath,
        pluginOptions,
        recPath + fileName + "/"
      );
    } else {
      const fileContent = fs.readFileSync(filePath);
      addAsset(
        builder,
        baseURL,
        recPath + fileName,
        fileContent,
        pluginOptions
      );
    }
  }
}
__name(addFilesRecursively, "addFilesRecursively");
async function getSignedWebBundle(webBundle, opts, infoLogger2) {
  const { signedWebBundle } = await new IntegrityBlockSigner(
    webBundle,
    opts.integrityBlockSign.strategy
  ).sign();
  const origin = new WebBundleId(
    await opts.integrityBlockSign.strategy.getPublicKey()
  ).serializeWithIsolatedWebAppOrigin();
  infoLogger2(origin);
  return signedWebBundle;
}
__name(getSignedWebBundle, "getSignedWebBundle");

// shared/types.ts
import { KeyObject } from "crypto";
import * as z from "zod";
import {
  NodeCryptoSigningStrategy,
  WebBundleId as WebBundleId2
} from "wbn-sign";
/*!
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var headersSchema = z.record(z.string());
var baseOptionsSchema = z.strictObject({
  static: z.strictObject({
    dir: z.string(),
    baseURL: z.string().optional()
  }).optional(),
  baseURL: z.string().default(""),
  output: z.string().default("out.wbn"),
  formatVersion: z.enum(["b1", "b2"]).default("b2"),
  headerOverride: z.union([z.function().returns(headersSchema), headersSchema]).optional()
});
var nonSigningSchema = baseOptionsSchema.extend({
  primaryURL: z.string().optional()
});
var baseIntegrityBlockSignSchema = z.strictObject({
  isIwa: z.boolean().default(true)
});
var keyBasedIntegrityBlockSignSchema = baseIntegrityBlockSignSchema.extend({
  // Unfortunately we cannot use `KeyObject` directly within `instanceof()`,
  // because its constructor is private.
  key: z.instanceof(Object).refine((key) => key instanceof KeyObject, {
    message: `Key must be an instance of "KeyObject"`
  })
}).transform((ibSignOpts) => {
  return {
    isIwa: ibSignOpts.isIwa,
    strategy: new NodeCryptoSigningStrategy(ibSignOpts.key)
  };
});
var strategyBasedIntegrityBlockSignSchema = baseIntegrityBlockSignSchema.extend({
  strategy: z.instanceof(Object).refine(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (strategy) => {
      return ["getPublicKey", "sign"].every(
        (func) => func in strategy && typeof strategy[func] === "function"
      );
    },
    { message: `Strategy must implement "ISigningStrategy"` }
  )
});
var signingSchema = baseOptionsSchema.extend({
  integrityBlockSign: keyBasedIntegrityBlockSignSchema.or(
    strategyBasedIntegrityBlockSignSchema
  )
}).superRefine(async (opts, ctx) => {
  const publicKey = await opts.integrityBlockSign.strategy.getPublicKey();
  const expectedOrigin = new WebBundleId2(
    publicKey
  ).serializeWithIsolatedWebAppOrigin();
  if (opts.baseURL !== "" && opts.baseURL !== expectedOrigin) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `The provided "baseURL" option (${opts.baseURL}) does not match the expected base URL (${expectedOrigin}) derived from the public key.`
    });
  }
}).transform((opts, ctx) => {
  if (!opts.integrityBlockSign.isIwa) {
    return opts;
  }
  if (opts.headerOverride === void 0) {
    console.info(
      `Setting the empty headerOverrides to IWA defaults. To bundle a non-IWA, set \`integrityBlockSign { isIwa: false }\` in your plugin configs. Defaults are set to:
 ${JSON.stringify(
        iwaHeaderDefaults
      )}`
    );
    opts.headerOverride = iwaHeaderDefaults;
  } else if (typeof opts.headerOverride === "object") {
    try {
      checkAndAddIwaHeaders(opts.headerOverride);
    } catch (err) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: String(err)
      });
    }
  }
  return opts;
});
var optionsSchema = z.union([nonSigningSchema, signingSchema]);
var getValidatedOptionsWithDefaults = optionsSchema.parseAsync;

// src/index.ts
/*!
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var consoleLogColor = { green: "\x1B[32m", reset: "\x1B[0m" };
function infoLogger(text) {
  console.log(`${consoleLogColor.green}${text}${consoleLogColor.reset}
`);
}
__name(infoLogger, "infoLogger");
function wbnOutputPlugin(rawOpts) {
  return {
    name: "wbn-output-plugin",
    enforce: "post",
    async generateBundle(_, bundle) {
      const opts = await getValidatedOptionsWithDefaults(rawOpts);
      const builder = new BundleBuilder2(opts.formatVersion);
      if ("primaryURL" in opts && opts.primaryURL) {
        builder.setPrimaryURL(opts.primaryURL);
      }
      if (opts.static) {
        addFilesRecursively(
          builder,
          opts.static.baseURL ?? opts.baseURL,
          opts.static.dir,
          opts
        );
      }
      for (const name of Object.keys(bundle)) {
        const asset = bundle[name];
        const content = asset.type === "asset" ? asset.source : asset.code;
        addAsset(
          builder,
          opts.baseURL,
          asset.fileName,
          // This contains the relative path to the base dir already.
          content,
          opts
        );
        delete bundle[name];
      }
      let webBundle = builder.createBundle();
      if ("integrityBlockSign" in opts) {
        webBundle = await getSignedWebBundle(webBundle, opts, infoLogger);
      }
      this.emitFile({
        fileName: opts.output,
        type: "asset",
        source: Buffer.from(
          webBundle,
          webBundle.byteOffset,
          webBundle.byteLength
        )
      });
    }
  };
}
__name(wbnOutputPlugin, "wbnOutputPlugin");
export {
  wbnOutputPlugin as default
};
//# sourceMappingURL=wbn-bundle.js.map
