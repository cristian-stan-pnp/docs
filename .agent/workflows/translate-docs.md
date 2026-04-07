---
description: Translate Spanish MDX documentation to EN, PT, and RO
---

# Translate Documentation

This workflow translates MDX files from Spanish to English, Portuguese, and Romanian.

## Prerequisites

Set your OpenAI API key:
```bash
export OPENAI_API_KEY="your-api-key"
```

## Usage

### Translate all files
// turbo
```bash
node scripts/translate-docs.js
```

### Translate a specific folder
```bash
node scripts/translate-docs.js guides/get-started
```

### Translate a single file
```bash
node scripts/translate-docs.js guides/get-started/introduction.mdx
```

## Notes

- Source files are in the root `guides/` directory (Spanish)
- Translations are output to `en/`, `pt/`, `ro/` directories
- The script preserves MDX syntax, frontmatter, and JSX components
- Technical terms like API, Sandbox, PCI-DSS are kept unchanged
