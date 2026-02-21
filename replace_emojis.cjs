const fs = require('fs');
const path = require('path');

const emojiMap = {
    '🚀': 'Rocket',
    '🔌': 'Plug',
    '🐧': 'Terminal',
    '🔬': 'Microscope',
    '🔍': 'Search',
    '⚡': 'Zap',
    '🧮': 'Calculator',
    '🔧': 'Wrench',
    '✅': 'CheckCircle2',
    '🎯': 'Target',
    '🌐': 'Globe',
    '🧠': 'Brain',
    '💾': 'HardDrive',
    '📡': 'Radio',
    '🔥': 'Flame',
    '🔗': 'Link',
    '🧪': 'FlaskConical',
    '🔄': 'RefreshCw',
    '⛔': 'Ban',
    '⏰': 'Clock',
    '🎉': 'PartyPopper',
    '🧩': 'Puzzle',
    '🏢': 'Building',
    '📮': 'Mail',
    '📖': 'BookOpen',
    '💡': 'Lightbulb',
    '🐛': 'Bug',
    '❓': 'HelpCircle',
    '💼': 'Briefcase',
    '📍': 'MapPin',
    '🧭': 'Compass',
    '📐': 'Ruler'
};

function walk(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
    });
}

const targetDirs = [
    path.join(__dirname, 'client/src/data'),
    path.join(__dirname, 'client/src/pages'),
    path.join(__dirname, 'client/src/components'),
    path.join(__dirname, 'client/src/lib'),
    path.join(__dirname, 'client/src/App.tsx')
];

targetDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
        if (fs.statSync(dir).isDirectory()) {
            walk(dir, processFile);
        } else {
            processFile(dir);
        }
    }
});

function processFile(filePath) {
    if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) return;

    let code = fs.readFileSync(filePath, 'utf8');
    let original = code;

    for (const [emoji, name] of Object.entries(emojiMap)) {
        // Replace exact occurrences inside quotes used for icons
        code = code.replace(new RegExp(`icon:\\s*['"]${emoji}['"]`, 'g'), `icon: '${name}'`);
        code = code.replace(new RegExp(`"\\s*${emoji}\\s*"`, 'g'), `"${name}"`);
        code = code.replace(new RegExp(`'\\s*${emoji}\\s*'`, 'g'), `'${name}'`);
    }

    // Handle specific cases
    code = code.replace(/💡\s*({q\.hint}|{hint}|{current\.hint})/g, "$1");
    code = code.replace(/🐛\s*({lesson\.debugExercise\.title})/g, "$1");
    code = code.replace(/❓\s*({lesson\.debugExercise\.question})/g, "$1");
    code = code.replace(/💼\s*({.*?amdContext})/g, "$1");
    code = code.replace(/🔍\s*({t\("search\.button"\)})/g, "$1");

    // Remove standalone emojis in text nodes that are plain strings
    const simpleRemove = ['🎉', '💡', '🐛', '❓', '💼', '✅', '❌', '⛔', '⏰', '🔍'];
    simpleRemove.forEach(emj => {
        code = code.replace(new RegExp(emj + '\\s*', 'g'), '');
    });

    if (code !== original) {
        fs.writeFileSync(filePath, code, 'utf8');
        console.log(`Updated ${filePath}`);
    }
}
