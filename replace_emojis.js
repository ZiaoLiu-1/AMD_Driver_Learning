const fs = require('fs');
const path = require('path');

const emojiMap = {
  '🚀': 'Rocket',
  '🔌': 'Plug',
  '🐧': 'Linux', // changed to Terminal or Box? Lucide doesn't have Linux. Let's use 'Terminal'
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
  '��': 'Flame',
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

emojiMap['🐧'] = 'Terminal';

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

const targetDirs = [
  './client/src/data',
  './client/src/pages',
  './client/src/components',
  './client/src/lib',
  './client/src/App.tsx'
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

  // Replace all isolated emoji icons (e.g. icon: '🚀', icon: "🚀", title: "🚀", etc.)
  for (const [emoji, name] of Object.entries(emojiMap)) {
    // For data files that define icon string: icon: '🚀' -> icon: 'Rocket'
    // Specifically target icon strings
    const iconRegex = new RegExp(`icon:\\s*['"]${emoji}['"]`, 'g');
    code = code.replace(iconRegex, `icon: '${name}'`);

    // We can also target specific things like "📖" in searchIndex
    code = code.replace(new RegExp(`"\\s*${emoji}\\s*"`, 'g'), `"${name}"`);
    code = code.replace(new RegExp(`'\\s*${emoji}\\s*'`, 'g'), `'${name}'`);
  }

  // Remove common emojis in plain text or strings like "💡 {hint}" -> "{hint}", or "合并进 Linux 主线 🎉"
  const removeEmojis = ['🎉', '💡', '🐛', '❓', '💼', '✅', '❌', '⛔', '⏰'];
  removeEmojis.forEach(emj => {
    code = code.replace(new RegExp(emj + '\\s*', 'g'), '');
  });

  if (code !== original) {
    fs.writeFileSync(filePath, code, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}
