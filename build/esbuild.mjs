import * as esbuild from "esbuild";

/** Bundles the framework-free three.js stage into a single theme asset.
 * IIFE, minified, no external deps at runtime. */
const opts = {
  entryPoints: ["src-stage/main.ts"],
  bundle: true,
  format: "iife",
  target: ["es2019"],
  minify: true,
  sourcemap: false,
  legalComments: "none",
  outfile: "assets/deskpaws-stage.js",
  logLevel: "info",
};

if (process.argv.includes("--watch")) {
  const ctx = await esbuild.context(opts);
  await ctx.watch();
  console.log("watching src-stage → assets/deskpaws-stage.js");
} else {
  await esbuild.build(opts);
}
