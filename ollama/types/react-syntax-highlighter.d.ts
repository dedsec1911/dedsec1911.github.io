// types/react-syntax-highlighter.d.ts
declare module 'react-syntax-highlighter' {
  // minimal – we only need the default export and Prism helper
  // for TypeScript, using `any` is perfectly fine here
  const SyntaxHighlighter: any;
  export const Prism: any;
  export default SyntaxHighlighter;
}

declare module 'react-syntax-highlighter/dist/esm/styles/prism' {
  export const materialLight: any;
}
