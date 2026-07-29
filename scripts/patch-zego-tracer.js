const fs = require("node:fs");
const path = require("node:path");

const sdkPath = path.resolve(
  __dirname,
  "..",
  "node_modules",
  "@zegocloud",
  "zego-uikit-prebuilt",
  "zego-uikit-prebuilt.js",
);

const unsafeCreateSpan =
  "static createSpan(e,t){return this.tracer.createSpan(0,e,{kind:2,attributes:t})}";
const safeCreateSpan =
  "static createSpan(e,t){const i=()=>({end(){},setAttribute(){return this},setAttributes(){return this},addEvent(){return this},setStatus(){return this},updateName(){return this},recordException(){return this},isRecording(){return!1},spanContext(){return{}}});if(!this.tracer)return i();try{return this.tracer.createSpan(0,e,{kind:2,attributes:t})}catch(e){return i()}}";

if (!fs.existsSync(sdkPath)) {
  throw new Error(`[patch-zego-tracer] SDK file not found: ${sdkPath}`);
}

const sdkSource = fs.readFileSync(sdkPath, "utf8");

if (sdkSource.includes(safeCreateSpan)) {
  console.log("[patch-zego-tracer] ZEGOCLOUD tracer is already null-safe.");
  process.exit(0);
}

const firstMatch = sdkSource.indexOf(unsafeCreateSpan);
const secondMatch = sdkSource.indexOf(
  unsafeCreateSpan,
  firstMatch + unsafeCreateSpan.length,
);

if (firstMatch < 0 || secondMatch >= 0) {
  throw new Error(
    "[patch-zego-tracer] Expected exactly one ZEGOCLOUD createSpan implementation. Review the SDK before building.",
  );
}

fs.writeFileSync(
  sdkPath,
  sdkSource.replace(unsafeCreateSpan, safeCreateSpan),
  "utf8",
);

console.log("[patch-zego-tracer] Applied null-safe ZEGOCLOUD tracer patch.");
