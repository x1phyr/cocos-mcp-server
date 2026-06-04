const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const KEYWORDS_FILE = path.join(ROOT, '.cursor/identity-keywords.local.txt');

const SCAN_EXTENSIONS = new Set([
    '.md',
    '.mdc',
    '.json',
    '.ts',
    '.js',
    '.html',
    '.css',
    '.toml',
]);

const ALWAYS_IGNORE = new Set([
    'node_modules',
    '.git',
    '.cursor',
    'dist',
    'package-lock.json',
    'local.env.json',
]);

function loadKeywords() {
    if (!fs.existsSync(KEYWORDS_FILE)) {
        console.error(`Missing ${path.relative(ROOT, KEYWORDS_FILE)}.`);
        console.error('Create it locally (gitignored); one forbidden term per line.');
        process.exit(1);
    }
    return fs
        .readFileSync(KEYWORDS_FILE, 'utf8')
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith('#'));
}

function listFilesToCheck() {
    const fromArgs = process.argv.slice(2).filter((arg) => !arg.startsWith('-'));
    if (fromArgs.length > 0) {
        return fromArgs.map((f) => path.resolve(ROOT, f));
    }
    try {
        const out = execSync('git diff --cached --name-only --diff-filter=ACM', {
            cwd: ROOT,
            encoding: 'utf8',
        });
        const files = out
            .split('\n')
            .map((f) => f.trim())
            .filter(Boolean)
            .map((f) => path.join(ROOT, f));
        if (files.length > 0) {
            return files;
        }
    } catch {
        // not a git repo or no staged files
    }
    return walkDir(ROOT);
}

function walkDir(dir, files = []) {
    for (const name of fs.readdirSync(dir)) {
        if (ALWAYS_IGNORE.has(name)) {
            continue;
        }
        const full = path.join(dir, name);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) {
            walkDir(full, files);
        } else if (SCAN_EXTENSIONS.has(path.extname(name))) {
            files.push(full);
        }
    }
    return files;
}

function scanFile(filePath, keywords) {
    const content = fs.readFileSync(filePath, 'utf8');
    const rel = path.relative(ROOT, filePath);
    const hits = [];
    for (const keyword of keywords) {
        const re = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        if (re.test(content)) {
            hits.push(keyword);
        }
    }
    return hits.length ? { rel, hits } : null;
}

function main() {
    const keywords = loadKeywords();
    const files = listFilesToCheck();
    const violations = [];

    for (const file of files) {
        if (!fs.existsSync(file)) {
            continue;
        }
        const hit = scanFile(file, keywords);
        if (hit) {
            violations.push(hit);
        }
    }

    if (violations.length === 0) {
        console.log(`OK: no identity keywords in ${files.length} file(s).`);
        return;
    }

    console.error('Identity keyword check failed:\n');
    for (const { rel, hits } of violations) {
        console.error(`  ${rel}`);
        console.error(`    matched: ${hits.join(', ')}`);
    }
    console.error('\nRemove these terms from files that will be committed.');
    process.exit(1);
}

main();
