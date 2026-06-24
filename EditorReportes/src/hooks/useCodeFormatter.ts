// hooks/useCodeFormatter.ts
import { html_beautify, css_beautify, js_beautify } from 'js-beautify';

type Language = 'html' | 'css' | 'json';

interface FormatOptions {
    indent_size?: number;
    indent_with_tabs?: boolean;
    wrap_line_length?: number;
}

const defaultOptions: FormatOptions = {
    indent_size: 2,
    indent_with_tabs: false,
    wrap_line_length: 80
};

export const useCodeFormatter = () => {
    const formatCode = (code: string, language: Language, options: FormatOptions = {}): string => {
        const formatOptions = { ...defaultOptions, ...options };
        
        try {
        switch (language) {
            case 'html':
            return html_beautify(code, {
                ...formatOptions,
                indent_inner_html: true,
                indent_char: ' ',
                extra_liners: []
            });

            case 'css':
            return css_beautify(code, {
                ...formatOptions,
                indent_char: ' ',
                selector_separator_newline: true
            });

            case 'json':
            // Para JSON usamos js_beautify o JSON.stringify
            return js_beautify(code, {
                ...formatOptions,
                indent_char: ' '
            });

            default:
            return code;
        }
        } catch (error) {
        console.error(`Error formateando ${language}:`, error);
        return code; // Fallback al código original
        }
    };

    const isValidCode = (code: string, language: Language): boolean => {
        try {
        if (language === 'json') {
            JSON.parse(code);
            return true;
        }
        return true; // Para HTML/CSS, la validación es más compleja
        } catch {
        return false;
        }
    };

    return {
        formatCode,
        isValidCode
    };
};