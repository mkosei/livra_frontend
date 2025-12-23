// src/types/react-syntax-highlighter.d.ts
declare module "react-syntax-highlighter" {
  import * as React from "react";
  export const Prism: React.ComponentType<any>;
  export const Light: React.ComponentType<any>;
  const SyntaxHighlighter: React.ComponentType<any>;
  export default SyntaxHighlighter;
}

// Prism スタイル用
declare module "react-syntax-highlighter/dist/esm/styles/prism/*" {
  const styles: any;
  export default styles;
}
