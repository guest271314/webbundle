// import crypto from "node:crypto";
// import read from "read";
// const { webcrypto } = crypto;
// A helper function that can be used to read the passphrase to decrypt a
// password-decrypted private key.
export async function readPassphrase() {
/*
  try {
    const passphrase = await read({
      prompt: "Passphrase for the key: ",
      silent: true,
      replace: "*",
      // Output must be != `stdout`. Otherwise saving the `wbn-dump-id`
      // result into a file or an environment variable also includes the prompt.
      output: process.stderr,
    });
    return passphrase;
  } catch (er) {
    throw new Error("Reading passphrase failed.");
  }
*/
}
// A helper function which can be used to parse string formatted keys to
// KeyObjects.
export function parsePemKey(unparsedKey, passphrase) {
  // TODO Use webcrypto
  /* return crypto.createPrivateKey({
       key: unparsedKey,
       passphrase,
     });
  */
}
export async function getRawPublicKey(publicKey) {
  // Currently this is the only way for us to get the raw 32 bytes of the public key.
  return new Uint8Array(await crypto.subtle.exportKey("spki", publicKey))
    .slice(-32);
}
// Throws an error if the key is not a valid Ed25519 key of the specified type.
export function checkIsValidEd25519Key(expectedKeyType, key) {
  if (key.type !== expectedKeyType) {
    throw new Error(
      `Expected key type to be ${expectedKeyType}, but it was "${key.type}".`,
    );
  }
  if (key.algorithm.name /*asymmetricKeyType !== 'ed25519'*/ !== "Ed25519") {
    throw new Error(
      `Expected algorithm name to be "Ed25519", but it was "${key.asymmetricKeyType}".`,
    );
  }
}