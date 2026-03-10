const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Workaround for Metro bundler issue with folder names containing spaces
config.resolver = {
    ...config.resolver,
    resolveRequest: (context, moduleName, platform) => {
        // Skip problematic node: modules for web
        if (platform === 'web' && moduleName.startsWith('node:')) {
            return {
                type: 'empty',
            };
        }
        return context.resolveRequest(context, moduleName, platform);
    },
};

module.exports = config;
