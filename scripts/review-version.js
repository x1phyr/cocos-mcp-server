#!/usr/bin/env node
/**
 * Post-release version/doc review (see .cursor/skills/cocos-mcp-versioning/SKILL.md).
 * Exit 0 when all checks pass. With --commit, stages and commits if there are changes.
 */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..');

function fail(msg) {
    console.error(`[review-version] FAIL: ${msg}`);
    process.exit(1);
}

function ok(msg) {
    console.log(`[review-version] OK: ${msg}`);
}

function readJson(rel) {
    return JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
}

function runReview() {
    const pkg = readJson('package.json');
    const version = pkg.version;
    if (!version) {
        fail('package.json missing version');
    }
    ok(`package.json version ${version}`);

    const lock = readJson('package-lock.json');
    if (lock.version !== version) {
        fail(`package-lock.json root version is ${lock.version}, expected ${version}`);
    }
    const pkgEntry = lock.packages && lock.packages[''];
    if (pkgEntry && pkgEntry.version !== version) {
        fail(`package-lock packages[""].version is ${pkgEntry.version}, expected ${version}`);
    }
    ok('package-lock.json in sync');

    if (fs.existsSync(path.join(ROOT, 'ROADMAP.md'))) {
        fail('ROADMAP.md must not exist; use DEV.md § 版本规划');
    }
    ok('no ROADMAP.md');

    const readme = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8');
    const readmeEn = fs.readFileSync(path.join(ROOT, 'README.EN.md'), 'utf8');
    const currentCn = (readme.match(/当前版本/g) || []).length;
    const currentEn = (readmeEn.match(/Current version/g) || []).length;
    if (currentCn !== 1) {
        fail(`README.md should have exactly one "当前版本", found ${currentCn}`);
    }
    if (currentEn !== 1) {
        fail(`README.EN.md should have exactly one "Current version", found ${currentEn}`);
    }
    if (!readme.includes(`### v${version}`) || !readme.includes('当前版本')) {
        fail(`README.md top changelog should be v${version} (当前版本)`);
    }
    if (!readmeEn.includes(`### v${version}`) || !readmeEn.includes('Current version')) {
        fail(`README.EN.md top changelog should be v${version} (Current version)`);
    }
    ok('README changelog current-version headers');

    const dev = fs.readFileSync(path.join(ROOT, 'DEV.md'), 'utf8');
    if (!dev.includes(`**v${version}**`)) {
        fail(`DEV.md header should include **v${version}**`);
    }
    if (!dev.includes(`**本仓库 Git 当前**：v${version}`)) {
        fail(`DEV.md 版本说明 should say 本仓库 Git 当前 v${version}`);
    }
    ok('DEV.md version lines');

    const identity = spawnSync(process.execPath, [path.join(__dirname, 'check-identity-keywords.js')], {
        cwd: ROOT,
        stdio: 'inherit',
    });
    if (identity.status !== 0) {
        fail('check:identity failed');
    }

    const distMcp = fs.readFileSync(path.join(ROOT, 'dist/mcp/server.js'), 'utf8');
    if (!distMcp.includes('PACKAGE_VERSION')) {
        fail('dist/mcp/server.js should use PACKAGE_VERSION (run npm run build)');
    }
    ok('dist/mcp/server uses PACKAGE_VERSION');

    console.log('[review-version] All checks passed.');
    return version;
}

function tryCommit(message) {
    const status = spawnSync('git', ['status', '--porcelain'], { cwd: ROOT, encoding: 'utf8' });
    if (status.status !== 0) {
        fail('git status failed');
    }
    const lines = status.stdout.trim();
    if (!lines) {
        console.log('[review-version] Nothing to commit (working tree clean).');
        return;
    }

    const add = spawnSync('git', ['add', '-A'], { cwd: ROOT, stdio: 'inherit' });
    if (add.status !== 0) {
        fail('git add failed');
    }

    const commit = spawnSync('git', ['commit', '-m', message], { cwd: ROOT, stdio: 'inherit' });
    if (commit.status !== 0) {
        fail('git commit failed');
    }
    ok('committed');
}

const args = process.argv.slice(2);
const doCommit = args.includes('--commit');
const msgIdx = args.indexOf('--message');
const commitMessage =
    msgIdx >= 0 && args[msgIdx + 1]
        ? args[msgIdx + 1]
        : 'chore: version and docs sync after review-version';

runReview();

if (doCommit) {
    tryCommit(commitMessage);
}
