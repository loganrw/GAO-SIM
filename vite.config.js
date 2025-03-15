import { defineConfig } from 'vite';
import externals from 'vite-plugin-externals';
import file from 'vite-plugin-file';

export default defineConfig({
    plugins: [
        externals({}),
        file({
            assetsDir: 'extra',
            outputDir: 'dist',
            assetsInlineLimit: 0,
            esModule: false,
        }),
    ],
});