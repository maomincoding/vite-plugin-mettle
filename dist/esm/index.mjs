import * as babel from '@babel/core';
import mettle from 'babel-preset-mettle';
import { createFilter } from 'vite';

function getExtension(filename) {
  const index = filename.lastIndexOf('.');
  return index < 0 ? '' : filename.substring(index).replace(/\?.+$/, '');
}
function mettlePlugin(options = {}) {
  const filter = createFilter(options.include, options.exclude);
  let projectRoot = process.cwd();
  return {
    name: 'mettle',
    enforce: 'pre',
    async transform(source, id) {
      const currentFileExtension = getExtension(id);
      const extensionsToWatch = options.extensions || [];
      const allExtensions = extensionsToWatch.map(extension => typeof extension === 'string' ? extension : extension[0]);
      if (!filter(id) || !(/\.[mc]?[tj]sx$/i.test(id) || allExtensions.includes(currentFileExtension))) {
        return null;
      }
      id = id.replace(/\?.+$/, '');
      const shouldBeProcessedWithTypescript = /\.[mc]?tsx$/i.test(id) || extensionsToWatch.some(extension => {
        if (typeof extension === 'string') {
          return extension.includes('tsx');
        }
        const [extensionName, extensionOptions] = extension;
        if (extensionName !== currentFileExtension) return false;
        return extensionOptions.typescript;
      });
      const plugins = ['jsx'];
      if (shouldBeProcessedWithTypescript) {
        plugins.push('typescript');
      }
      const opts = {
        root: projectRoot,
        filename: id,
        sourceFileName: id,
        presets: [[mettle]],
        ast: false,
        sourceMaps: true,
        configFile: false,
        babelrc: false,
        parserOpts: {
          plugins
        }
      };
      const {
        code,
        map
      } = await babel.transformAsync(source, opts);
      return {
        code,
        map
      };
    }
  };
}

export { mettlePlugin as default };
//# sourceMappingURL=index.mjs.map
