# Defensive Programming Linting Rules

## Overview
Automated linting configurations to enforce defensive programming patterns and prevent runtime errors. These rules catch unsafe patterns during development before they reach production.

## ESLint Configuration

### Base Configuration (.eslintrc.js)
```javascript
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  plugins: [
    '@typescript-eslint',
    'no-unsafe-chaining'
  ],
  rules: {
    // Enforce optional chaining
    '@typescript-eslint/prefer-optional-chain': 'error',
    
    // Prevent unsafe optional chaining
    'no-unsafe-optional-chaining': ['error', {
      disallowArithmeticOperators: true
    }],
    
    // Require nullish coalescing over OR for defaults
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    
    // Prevent non-null assertions
    '@typescript-eslint/no-non-null-assertion': 'error',
    
    // Require array method return values
    'array-callback-return': ['error', {
      allowImplicit: false,
      checkForEach: true
    }],
    
    // Prevent accessing array index without checks
    'no-unsafe-array-index': 'error',
    
    // Custom rules for API responses
    'no-direct-state-mutation': 'error',
    'require-api-validation': 'error'
  }
};
```

### React-Specific Rules (.eslintrc.react.js)
```javascript
module.exports = {
  extends: [
    'plugin:react/recommended',
    'plugin:react-hooks/recommended'
  ],
  rules: {
    // Require default props
    'react/require-default-props': ['error', {
      forbidDefaultForRequired: true,
      ignoreFunctionalComponents: false
    }],
    
    // Enforce prop types validation
    'react/prop-types': ['error', {
      ignore: [],
      customValidators: [],
      skipUndeclared: false
    }],
    
    // Prevent direct state mutation
    'react/no-direct-mutation-state': 'error',
    
    // Require error boundaries
    'react/require-error-boundary': 'error',
    
    // Prevent array index as key
    'react/no-array-index-key': 'error',
    
    // Enforce safe event handlers
    'react/jsx-no-bind': ['error', {
      allowArrowFunctions: true,
      allowBind: false,
      ignoreRefs: true
    }]
  }
};
```

### Custom ESLint Plugin for Defensive Patterns

#### Plugin Definition (eslint-plugin-defensive/index.js)
```javascript
module.exports = {
  rules: {
    'no-unsafe-property-access': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Disallow unsafe property access without optional chaining',
          recommended: true
        },
        fixable: 'code',
        schema: []
      },
      create(context) {
        return {
          MemberExpression(node) {
            if (!node.optional && 
                node.object.type === 'Identifier' &&
                !isKnownSafeObject(node.object.name)) {
              context.report({
                node,
                message: 'Use optional chaining (?.) for property access',
                fix(fixer) {
                  return fixer.insertTextBefore(node.property, '?');
                }
              });
            }
          }
        };
      }
    },
    
    'require-array-checks': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Require Array.isArray() checks before array methods',
          recommended: true
        },
        schema: []
      },
      create(context) {
        const arrayMethods = ['map', 'filter', 'reduce', 'forEach', 'find', 'some', 'every'];
        
        return {
          CallExpression(node) {
            if (node.callee.type === 'MemberExpression' &&
                arrayMethods.includes(node.callee.property.name)) {
              const parent = node.parent;
              if (!isWrappedInArrayCheck(node)) {
                context.report({
                  node,
                  message: `Array method '${node.callee.property.name}' should be preceded by Array.isArray() check`
                });
              }
            }
          }
        };
      }
    },
    
    'require-api-response-validation': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Require validation of API responses before use',
          recommended: true
        },
        schema: []
      },
      create(context) {
        return {
          AwaitExpression(node) {
            if (isApiCall(node.argument)) {
              const parent = findParentStatement(node);
              if (!hasResponseValidation(parent)) {
                context.report({
                  node,
                  message: 'API response must be validated before use'
                });
              }
            }
          }
        };
      }
    }
  }
};

// Helper functions
function isKnownSafeObject(name) {
  const safeGlobals = ['window', 'document', 'console', 'process', 'Math', 'JSON'];
  return safeGlobals.includes(name);
}

function isWrappedInArrayCheck(node) {
  let parent = node.parent;
  while (parent && parent.type !== 'IfStatement') {
    parent = parent.parent;
  }
  return parent && parent.test.type === 'CallExpression' &&
         parent.test.callee.name === 'Array.isArray';
}

function isApiCall(node) {
  return node.type === 'CallExpression' &&
         (node.callee.name === 'fetch' ||
          (node.callee.type === 'MemberExpression' &&
           ['get', 'post', 'put', 'delete'].includes(node.callee.property.name)));
}
```

## TypeScript Compiler Options

### Strict TypeScript Configuration (tsconfig.json)
```json
{
  "compilerOptions": {
    // Strict type checking
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    
    // Additional checks
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    
    // Defensive programming helpers
    "exactOptionalPropertyTypes": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitOverride": true,
    
    // Other settings
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

### Type Definition Helpers
```typescript
// types/defensive.d.ts

// Safe object access helper types
type SafeGet<T, K extends keyof T> = T[K] | undefined;

// Nullable type helpers
type Nullable<T> = T | null | undefined;
type NonNullable<T> = T extends null | undefined ? never : T;

// Array type guards
type SafeArray<T> = T[] | [];
type NonEmptyArray<T> = [T, ...T[]];

// API response types
interface SafeApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

// React prop helpers
type SafeProps<T> = {
  [K in keyof T]-?: NonNullable<T[K]>;
};
```

## Prettier Configuration

### Defensive Formatting Rules (.prettierrc)
```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf",
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "overrides": [
    {
      "files": "*.{ts,tsx}",
      "options": {
        "parser": "typescript"
      }
    }
  ]
}
```

## Pre-commit Hooks

### Husky Configuration (.huskyrc.js)
```javascript
module.exports = {
  hooks: {
    'pre-commit': 'lint-staged',
    'pre-push': 'npm run type-check && npm run test:defensive'
  }
};
```

### Lint-Staged Configuration (.lintstagedrc.js)
```javascript
module.exports = {
  '*.{js,jsx,ts,tsx}': [
    'eslint --fix',
    'prettier --write',
    'npm run test:defensive -- --findRelatedTests'
  ],
  '*.{json,md}': [
    'prettier --write'
  ]
};
```

## Custom Validation Scripts

### Defensive Pattern Validator (scripts/validate-defensive.js)
```javascript
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { ESLint } = require('eslint');

const DEFENSIVE_RULES = {
  'no-direct-property-access': {
    pattern: /(\w+)\.(\w+)(?!\?)/g,
    message: 'Direct property access found. Use optional chaining.',
    exclude: ['window.', 'document.', 'console.', 'Math.', 'JSON.']
  },
  'no-unguarded-array-methods': {
    pattern: /(?<!Array\.isArray\([^)]+\)\s*\?\s*)(\w+)\.(map|filter|reduce|forEach)\(/g,
    message: 'Array method without Array.isArray check'
  },
  'no-unsafe-destructuring': {
    pattern: /const\s*{\s*(\w+)\s*}\s*=\s*(\w+)(?!\s*\|\|)/g,
    message: 'Destructuring without default values'
  }
};

async function validateDefensivePatterns(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const violations = [];
  
  for (const [ruleName, rule] of Object.entries(DEFENSIVE_RULES)) {
    const matches = content.matchAll(rule.pattern);
    for (const match of matches) {
      if (!rule.exclude?.some(ex => match[0].includes(ex))) {
        violations.push({
          rule: ruleName,
          message: rule.message,
          line: getLineNumber(content, match.index),
          match: match[0]
        });
      }
    }
  }
  
  return violations;
}

function getLineNumber(content, index) {
  return content.substring(0, index).split('\n').length;
}

// Run validation
async function main() {
  const files = process.argv.slice(2);
  let hasErrors = false;
  
  for (const file of files) {
    const violations = await validateDefensivePatterns(file);
    if (violations.length > 0) {
      hasErrors = true;
      console.error(`\n❌ Defensive pattern violations in ${file}:`);
      violations.forEach(v => {
        console.error(`  Line ${v.line}: ${v.message}`);
        console.error(`    Found: ${v.match}`);
      });
    }
  }
  
  if (hasErrors) {
    console.error('\n❌ Defensive pattern validation failed');
    process.exit(1);
  } else {
    console.log('✅ All defensive patterns validated');
  }
}

main().catch(console.error);
```

## IDE Integration

### VS Code Settings (.vscode/settings.json)
```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "files.associations": {
    "*.js": "javascript",
    "*.jsx": "javascriptreact",
    "*.ts": "typescript",
    "*.tsx": "typescriptreact"
  }
}
```

### VS Code Extensions (extensions.json)
```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-tslint-plugin",
    "streetsidesoftware.code-spell-checker",
    "usernamehw.errorlens"
  ]
}
```

## Package.json Scripts

### Linting and Validation Scripts
```json
{
  "scripts": {
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
    "lint:fix": "eslint . --ext .js,.jsx,.ts,.tsx --fix",
    "lint:defensive": "node scripts/validate-defensive.js src/**/*.{js,jsx,ts,tsx}",
    "type-check": "tsc --noEmit",
    "validate": "npm run lint && npm run type-check && npm run lint:defensive",
    "pre-commit": "lint-staged",
    "prepare": "husky install"
  },
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^5.59.0",
    "@typescript-eslint/parser": "^5.59.0",
    "eslint": "^8.40.0",
    "eslint-config-prettier": "^8.8.0",
    "eslint-plugin-react": "^7.32.2",
    "eslint-plugin-react-hooks": "^4.6.0",
    "husky": "^8.0.3",
    "lint-staged": "^13.2.2",
    "prettier": "^2.8.8",
    "typescript": "^5.0.4"
  }
}
```

## CI/CD Integration

### GitHub Actions Workflow (.github/workflows/defensive-checks.yml)
```yaml
name: Defensive Programming Checks

on:
  pull_request:
    types: [opened, synchronize]
  push:
    branches: [main, develop]

jobs:
  defensive-validation:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run ESLint
        run: npm run lint
        
      - name: Run TypeScript checks
        run: npm run type-check
        
      - name: Run defensive pattern validation
        run: npm run lint:defensive
        
      - name: Run tests
        run: npm test -- --coverage
        
      - name: Check coverage thresholds
        run: |
          if [ $(jq '.total.statements.pct' coverage/coverage-summary.json) -lt 80 ]; then
            echo "Coverage below 80%"
            exit 1
          fi
```

---

**Created**: 2025-07-01  
**Version**: 1.0.0  
**Purpose**: Automated enforcement of defensive programming patterns