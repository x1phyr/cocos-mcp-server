const fs = require('fs');
const path = require('path');
const fse = require('fs-extra');
const { loadLocalEnv } = require('./load-local-env');

const ROOT = path.join(__dirname, '..');

const PUBLISH_IGNORE = new Set([
    '.git',
    '.cursor',
    '.DS_Store',
    'local.env.json',
    'local.env.json.example',
    'local.env.project.example.json',
    'DEV.md',
    'examples',
]);

function shouldPublish(relPath) {
    const parts = relPath.split(path.sep).filter(Boolean);
    return !parts.some((part) => PUBLISH_IGNORE.has(part));
}

async function publish() {
    const env = loadLocalEnv();

    if (!fs.existsSync(env.cocosProjectPath)) {
        console.error(`Cocos project not found: ${env.cocosProjectPath}`);
        process.exit(1);
    }

    const extensionsDir = path.join(env.cocosProjectPath, 'extensions');
    const targetDir = path.join(extensionsDir, env.extensionName);

    await fse.ensureDir(extensionsDir);
    await fse.emptyDir(targetDir);

    const entries = await fse.readdir(ROOT);
    for (const entry of entries) {
        if (!shouldPublish(entry)) {
            continue;
        }
        await fse.copy(path.join(ROOT, entry), path.join(targetDir, entry), {
            filter: (srcPath) => {
                const relative = path.relative(ROOT, srcPath);
                if (!relative || relative === '') {
                    return true;
                }
                return shouldPublish(relative);
            },
        });
    }

    console.log(`Published to ${targetDir}`);
}

publish().catch((error) => {
    console.error(error);
    process.exit(1);
});
