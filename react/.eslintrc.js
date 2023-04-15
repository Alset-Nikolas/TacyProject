module.exports = {
    "env": {
        "browser": true,
        "es2021": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:react/recommended",
        "plugin:@typescript-eslint/recommended"
    ],
    overrides: [
        {
          files: ['*.js', '*.jsx', '*.ts', '*.tsx'],
          rules: {
            'no-undef': 'off',
          },
        },
      ],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
    "plugins": [
        "react",
        "@typescript-eslint"
    ],
    "rules": {
        'linebreak-style': ['error', (process.platform === 'win32' ? 'windows' : 'unix')],
        'react/react-in-jsx-scope': 0,
        'react/prop-types': 0,
        'prefer-const': 0,
    },
    "settings": {
        "react": {
            "version": "detect",
        },
    }
}
