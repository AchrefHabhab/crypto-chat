import nextConfig from 'eslint-config-next';
import prettierConfig from 'eslint-config-prettier';

const eslintConfig = [
  {
    ignores: [
      '**/._*',
      '**/.DS_Store',
      '.next/**',
      'out/**',
      'dist/**',
      'build/**',
      'node_modules/**',
      '.env*',
      'src/generated/**',
    ],
  },
  ...nextConfig,
  prettierConfig,
  {
    rules: {
      semi: ['error', 'always'],
      'prefer-arrow-callback': 'error',
      'prefer-template': 'off',
    },
  },
];

export default eslintConfig;
