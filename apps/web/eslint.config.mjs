import { nextJsConfig } from "@calcom/eslint-config/next-js";

export default [
  ...nextJsConfig,
  {
    rules: {
      // Disable Next.js rule for old Pages Router — you’re using the App Router
      '@next/next/no-html-link-for-pages': 'off',

      // Disable harmless escaping warnings
      'no-useless-escape': 'off',

      // Disable missing Cal.com rule that’s not defined in your setup
      '@calcom/eslint/no-scroll-into-view-embed': 'off',
    },
  },
];
