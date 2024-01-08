try {
  console.log(
    await Bun.build({
      entrypoints: ["./src/index.ts"],
      outdir: ".",
      sourcemap: "external",
      splitting: false,
      target: "bun",
      format: "esm",
      // minify: true,
      external: ["mime", "base32-encode", "wbn-sign-webcrypto", "wbn"],
      naming: {
        entry: "[dir]/wbn-bundle.[ext]",
      },
    }),
  );
} catch (e) {
  console.log(e);
}
