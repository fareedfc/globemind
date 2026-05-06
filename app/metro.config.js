const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const fs = require('fs');

const config = getDefaultConfig(__dirname);

// expo-router v6 requires app/app/package.json to exist on disk.
// But having that file makes Metro treat app/app/ as a separate package,
// which breaks relative imports like `../constants/colors` from route files.
//
// Fix: intercept all relative imports from within the routes directory and
// resolve them directly via the real filesystem, bypassing Metro's package
// boundary detection entirely.

const ROUTES_DIR = path.join(__dirname, 'app'); // → /abs/path/app/app/

const SOURCE_EXTS = [
  '.ios.tsx', '.ios.ts', '.ios.jsx', '.ios.js',
  '.native.tsx', '.native.ts', '.native.jsx', '.native.js',
  '.tsx', '.ts', '.jsx', '.js', '.json',
];

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const { originModulePath } = context;
  const isRelative = moduleName.startsWith('./') || moduleName.startsWith('../');
  const isFromRoutes = originModulePath.startsWith(ROUTES_DIR + path.sep);

  if (isRelative && isFromRoutes) {
    const base = path.resolve(path.dirname(originModulePath), moduleName);

    // Try exact-match extensions
    for (const ext of SOURCE_EXTS) {
      const candidate = base + ext;
      if (fs.existsSync(candidate)) {
        return { type: 'sourceFile', filePath: candidate };
      }
    }

    // Try index file in directory
    for (const ext of SOURCE_EXTS) {
      const candidate = path.join(base, 'index' + ext);
      if (fs.existsSync(candidate)) {
        return { type: 'sourceFile', filePath: candidate };
      }
    }
  }

  // Default Metro resolution for everything else
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
