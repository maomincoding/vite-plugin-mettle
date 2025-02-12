import * as babel from '@babel/core';
import mettle from 'babel-preset-mettle';
import { createFilter } from 'vite';
import type { Plugin, FilterPattern } from 'vite';

export interface ExtensionOptions {
  typescript?: boolean;
}

export interface Options {
  include?: FilterPattern;
  exclude?: FilterPattern;
  extensions?: (string | [string, ExtensionOptions])[];
  babel?:
    | babel.TransformOptions
    | ((source: string, id: string, ssr: boolean) => babel.TransformOptions)
    | ((source: string, id: string, ssr: boolean) => Promise<babel.TransformOptions>);
}

function getExtension(filename: string): string {
  const index = filename.lastIndexOf('.');
  return index < 0 ? '' : filename.substring(index).replace(/\?.+$/, '');
}

export default function mettlePlugin(options: Partial<Options> = {}): Plugin {
  const filter = createFilter(options.include, options.exclude);
  let projectRoot = process.cwd();

  return {
    name: 'mettle',
    enforce: 'pre',
    async transform(source, id) {
      const currentFileExtension = getExtension(id);
      const extensionsToWatch = options.extensions || [];
      const allExtensions = extensionsToWatch.map((extension) =>
        typeof extension === 'string' ? extension : extension[0]
      );

      if (
        !filter(id) ||
        !(/\.[mc]?[tj]sx$/i.test(id) || allExtensions.includes(currentFileExtension))
      ) {
        return null;
      }

      id = id.replace(/\?.+$/, '');

      const shouldBeProcessedWithTypescript =
        /\.[mc]?tsx$/i.test(id) ||
        extensionsToWatch.some((extension) => {
          if (typeof extension === 'string') {
            return extension.includes('tsx');
          }

          const [extensionName, extensionOptions] = extension;
          if (extensionName !== currentFileExtension) return false;

          return extensionOptions.typescript;
        });
      const plugins: NonNullable<NonNullable<babel.TransformOptions['parserOpts']>['plugins']> = [
        'jsx',
      ];

      if (shouldBeProcessedWithTypescript) {
        plugins.push('typescript');
      }

      const opts: babel.TransformOptions = {
        root: projectRoot,
        filename: id,
        sourceFileName: id,
        presets: [[mettle]],
        ast: false,
        sourceMaps: true,
        configFile: false,
        babelrc: false,
        parserOpts: {
          plugins,
        },
      };

      const { code, map } = await babel.transformAsync(source, opts);

      return { code, map };
    },
  };
}
