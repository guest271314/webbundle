import base32Encode from "base32-encode";
import { getRawPublicKey } from "./utils/utils.js";
// Web Bundle ID is a base32-encoded (without padding) ed25519 public key
// transformed to lowercase. More information:
export class WebBundleId {
  // https://github.com/WICG/isolated-web-apps/blob/main/Scheme.md#suffix
  appIdSuffix = [0x00, 0x01, 0x02];
  scheme = "isolated-app://";
  key;
  constructor(ed25519key) {
    if (
      ed25519key.algorithm.name /*asymmetricKeyType*/ !==
        "Ed25519" /*"ed25519"*/
    ) {
      throw new Error(
        `WebBundleId: Only ed25519 keys are currently supported. Your key's type is ${ed25519key.asymmetricKeyType}.`,
      );
    }
    if (ed25519key.type === "private") {
      this.key = ed25519key.publicKey; // crypto.createPublicKey(ed25519key);
    } else {
      this.key = ed25519key;
    }
  }
  async serialize() {
    return base32Encode(
      new Uint8Array([
        ...(await getRawPublicKey(this.key)),
        ...this.appIdSuffix,
      ]),
      "RFC4648",
      { padding: false },
    ).toLowerCase();
  }
  async serializeWithIsolatedWebAppOrigin() {
    return `${this.scheme}${await this.serialize()}/`;
  }
  async toString() {
    return `\
  Web Bundle ID: ${await this.serialize()}
  Isolated Web App Origin: ${await this.serializeWithIsolatedWebAppOrigin()}`;
  }
}
