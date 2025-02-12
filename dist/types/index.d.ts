import * as babel from '@babel/core';
import type { Plugin, FilterPattern } from 'vite';
export interface ExtensionOptions {
    typescript?: boolean;
}
export interface Options {
    include?: FilterPattern;
    exclude?: FilterPattern;
    extensions?: (string | [string, ExtensionOptions])[];
    babel?: babel.TransformOptions | ((source: string, id: string, ssr: boolean) => babel.TransformOptions) | ((source: string, id: string, ssr: boolean) => Promise<babel.TransformOptions>);
}
export default function mettlePlugin(options?: Partial<Options>): Plugin;
