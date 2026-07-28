// src/global.d.ts
declare module "*.css";
declare module "*.mp3" {
  const value: string;
  export default value;
}
declare module "*.wav" {
  const value: string;
  export default value;
}

