#!/usr/bin/env node

/**
 * Translation Script for MDX Documentation
 * 
 * Translates Spanish MDX files to English, Portuguese, and Romanian
 * while preserving MDX syntax, frontmatter, and JSX components.
 * 
 * Usage:
 *   node scripts/translate-docs.js [file-path]
 * 
 * Examples:
 *   node scripts/translate-docs.js                           # Translate all files
 *   node scripts/translate-docs.js guides/get-started        # Translate specific folder
 *   node scripts/translate-docs.js guides/get-started/introduction.mdx  # Translate single file
 * 
 * Environment:
 *   OPENAI_API_KEY - Required OpenAI API key
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
    sourceDir: path.join(__dirname, '..'),
    targetLanguages: {
        en: 'English',
        pt: 'Portuguese (European)',
        ro: 'Romanian',
        fr: 'French',
        de: 'German',
        it: 'Italian',
        ch: 'Chinese',
        hr: 'Croatian'
    },
    // Directories to translate (relative to sourceDir)
    translateDirs: ['guides'],
    // Skip these directories
    skipDirs: ['en', 'pt', 'ro', 'fr', 'de', 'it', 'ch', 'hr', 'node_modules', '.git', 'scripts', 'images', 'logo']
};

// OpenAI API call
async function translateWithOpenAI(content, targetLang, targetCode) {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
        throw new Error('OPENAI_API_KEY environment variable is required');
    }

    const systemPrompt = `You are a professional translator specializing in technical documentation. 
Translate the following MDX documentation from Spanish to ${targetLang}.

CRITICAL RULES:
1. Preserve ALL MDX/JSX syntax exactly as-is: <Card>, <CardGroup>, href attributes, etc.
2. Keep ALL URLs, paths, and image references unchanged
3. Keep ALL code blocks and inline code unchanged
4. Translate the "title" field in the frontmatter (between --- markers)
5. Translate text content inside JSX components (like Card titles and descriptions)
6. Preserve markdown formatting (**, *, [], etc.)
7. Keep technical terms like "API", "Sandbox", "PCI-DSS", "MoTo", "POS" unchanged
8. For ${targetCode === 'en' ? 'English' : targetCode === 'pt' ? 'Portuguese' : 'Romanian'} anchor links in href="#...", translate the anchor to match the translated heading (lowercase, hyphens for spaces)

Return ONLY the translated content, nothing else.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: content }
            ],
            temperature: 0.3
        })
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

// Find all MDX files in a directory
function findMdxFiles(dir, baseDir = dir) {
    const files = [];

    if (!fs.existsSync(dir)) {
        return files;
    }

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            if (!CONFIG.skipDirs.includes(entry.name)) {
                files.push(...findMdxFiles(fullPath, baseDir));
            }
        } else if (entry.name.endsWith('.mdx')) {
            files.push(path.relative(baseDir, fullPath));
        }
    }

    return files;
}

// Translate a single file to all target languages
async function translateFile(relativePath) {
    const sourcePath = path.join(CONFIG.sourceDir, relativePath);

    if (!fs.existsSync(sourcePath)) {
        console.error(`❌ Source file not found: ${sourcePath}`);
        return false;
    }

    const content = fs.readFileSync(sourcePath, 'utf-8');
    console.log(`\n📄 Translating: ${relativePath}`);

    for (const [langCode, langName] of Object.entries(CONFIG.targetLanguages)) {
        const targetPath = path.join(CONFIG.sourceDir, langCode, relativePath);
        const targetDir = path.dirname(targetPath);

        try {
            console.log(`   → ${langName}...`);

            // Translate
            const translated = await translateWithOpenAI(content, langName, langCode);

            // Create directory if needed
            fs.mkdirSync(targetDir, { recursive: true });

            // Write translated file
            fs.writeFileSync(targetPath, translated);
            console.log(`   ✅ ${langCode}/${relativePath}`);

        } catch (error) {
            console.error(`   ❌ ${langName}: ${error.message}`);
        }
    }

    return true;
}

// Main function
async function main() {
    const args = process.argv.slice(2);
    let filesToTranslate = [];

    console.log('🌐 MDX Documentation Translator');
    console.log('================================\n');

    // Check for API key
    if (!process.env.OPENAI_API_KEY) {
        console.error('❌ Error: OPENAI_API_KEY environment variable is required');
        console.log('\nSet it with:');
        console.log('  export OPENAI_API_KEY="your-api-key"');
        process.exit(1);
    }

    if (args.length > 0) {
        // Translate specific file or directory
        const targetPath = args[0];

        if (targetPath.endsWith('.mdx')) {
            filesToTranslate = [targetPath];
        } else {
            // It's a directory
            const fullDir = path.join(CONFIG.sourceDir, targetPath);
            filesToTranslate = findMdxFiles(fullDir, CONFIG.sourceDir);
        }
    } else {
        // Translate all files in configured directories
        for (const dir of CONFIG.translateDirs) {
            const fullDir = path.join(CONFIG.sourceDir, dir);
            const files = findMdxFiles(fullDir, CONFIG.sourceDir);
            filesToTranslate.push(...files);
        }
    }

    if (filesToTranslate.length === 0) {
        console.log('No MDX files found to translate.');
        return;
    }

    console.log(`Found ${filesToTranslate.length} file(s) to translate:\n`);
    filesToTranslate.forEach(f => console.log(`  - ${f}`));

    // Translate each file
    let successCount = 0;
    for (const file of filesToTranslate) {
        const success = await translateFile(file);
        if (success) successCount++;
    }

    console.log(`\n================================`);
    console.log(`✅ Completed: ${successCount}/${filesToTranslate.length} files translated`);
}

main().catch(console.error);
