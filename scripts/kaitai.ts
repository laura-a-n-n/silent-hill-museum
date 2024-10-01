#!/usr/bin/env tsx
import fs from "fs";
import { execSync } from "child_process";

const DEFAULT_KSY_FILE = new URL("../ksy/mdl.ksy", import.meta.url).pathname;
const BUILD_DIR = new URL("../build", import.meta.url).pathname;
const JS_OUTPUT_PATH = "../src/kaitai";
const JS_OUTPUT_DIR = new URL(JS_OUTPUT_PATH, import.meta.url).pathname;
const TS_TYPES_DIR = new URL("../src/kaitai", import.meta.url).pathname;
const DEFAULT_COMPILER = "kaitai-struct-compiler";
const TS_COMPILER = new URL(
  "../kaitai_struct_compiler/jvm/target/universal/stage/bin/kaitai-struct-compiler",
  import.meta.url
).pathname;
const JS_COMPILER = TS_COMPILER;
const KSC_ARGS = "--read-write --ksc-exceptions";
const KAITAI_RUNTIME_PATH = "./runtime/KaitaiStream";

const args = process.argv.slice(2);
const action = args[0] || "";
const customKsyFile = args[1]
  ? new URL(args[1], import.meta.url).pathname
  : DEFAULT_KSY_FILE;
const ksyBasename = customKsyFile.split("/").pop()?.split(".")[0] ?? "mdl";
const ksyCapitalBasename =
  ksyBasename[0].toUpperCase() + ksyBasename?.substring(1);

/**
 * Regex that attempts to capture a UMD definition start.
 */
const UMD_START_REGEX =
  /\(function\s*\(root\s*,\s*factory\s*\)\s*\{[\s\S]*?function\s*\([\s\S]*?\)\s*\{/;
/**
 * Regex to capture a UMD definition end.
 */
const UMD_END_REGEX = /return\s+(\w+)\s*;\s*\}\)\)\s*;\s*[\s\S]*$/;

const runCommand = (cmd: string) => {
  try {
    console.log(`Executing: ${cmd}`);
    execSync(cmd, { stdio: "inherit" });
    return 0;
  } catch (error) {
    return 1;
  }
};

const umdToEs6 = (filePath: string) => {
  const fileContent = fs.readFileSync(filePath, "utf8");
  const result = fileContent
    .replace(
      UMD_START_REGEX,
      `import KaitaiStream from "${KAITAI_RUNTIME_PATH}";\n`
    )
    .replace(
      UMD_END_REGEX,
      (_, identifier) => `export default ${identifier};\n`
    );
  fs.writeFileSync(filePath, result, "utf8");
};

const compileKsy = (
  target: string,
  outdir: string,
  ksyFile: string,
  compiler = DEFAULT_COMPILER,
  options = " "
) => {
  const cmd = `${compiler} --target ${target}${
    target !== "typescript" ? " " + KSC_ARGS : ""
  } --outdir ${outdir} ${ksyFile}`;
  runCommand(cmd);
};

type Action = "all" | "js" | "ts" | "museum";
const actions: { [A in Action]: () => void } = {
  all: () => compileKsy("all", BUILD_DIR, customKsyFile),
  js: () => {
    compileKsy("javascript", JS_OUTPUT_DIR, customKsyFile, JS_COMPILER);
    umdToEs6(
      new URL(`${JS_OUTPUT_PATH}/${ksyCapitalBasename}.js`, import.meta.url)
        .pathname
    );
  },
  ts: () => compileKsy("typescript", TS_TYPES_DIR, customKsyFile, TS_COMPILER),
  museum: () => {
    actions.ts();
    actions.js();
  },
};

if (action in actions) {
  actions[action]();
} else {
  console.error(`Unknown action: ${action}`);
  process.exit(1);
}
