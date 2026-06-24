import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { json } from '@codemirror/lang-json';
import { linter, lintGutter } from '@codemirror/lint';

export const jsonLinter = () =>
  linter(view => {
    try {
      JSON.parse(view.state.doc.toString());
      return [];
    } catch (e: any) {
      return [{
        from: 0,
        to: view.state.doc.length,
        message: e.message,
        severity: "error"
      }];
    }
  });

export const getExtensions = {
  html: () => [html(), lintGutter()],
  css: () => [css()],
  json: () => [json(), lintGutter(), jsonLinter()]
};
