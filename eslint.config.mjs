import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      // Allow console.log in server actions and API routes
      'no-console': 'off',
      // Allow any type in specific cases (like global augmentation)
      '@typescript-eslint/no-explicit-any': 'warn',
      // Allow prefer-const warnings to not break builds
      'prefer-const': 'warn'
    }
  }
];

export default eslintConfig;
