import sanitizeHtml from 'sanitize-html';

export const SecurityService = {
  /**
   * Sanitiza HTML de forma ligera.
   */
  sanitizeContent: (html: string) => {
    return sanitizeHtml(html, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(['html', 'head', 'body', 'style', 'img', 'table', 'tr', 'td', 'meta']),
      allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        '*': ['style', 'class'], // Permitir estilos inline para el diseño del PDF
        'img': ['src', 'width', 'height'],
        'meta': ['charset', 'name', 'content']
      },
      allowedStyles: {
        '*': {
          // Permitir propiedades comunes de diseño
          'color': [/^#(0x)?[0-9a-f]+$/i, /^rgb\(/],
          'text-align': [/^left$/, /^right$/, /^center$/, /^justify$/],
          'font-size': [/^\d+(px|em|pt|%)$/],
          'margin': [/.*/],
          'padding': [/.*/],
          'border': [/.*/],
          'background-color': [/.*/]
        }
      }
    });
  },

  /**
   * Evita referencias circulares y profundidad excesiva.
   */
  validateJsonData: (data: any, maxDepth = 10) => {
    try {
      // Detecta referencias circulares
      JSON.stringify(data);
      
      const checkDepth = (obj: any, depth: number): void => {
        if (depth > maxDepth) throw new Error('Exceso de profundidad en JSON');
        if (obj && typeof obj === 'object') {
          Object.values(obj).forEach(v => checkDepth(v, depth + 1));
        }
      };
      checkDepth(data, 0);
    } catch (err: any) {
      throw new Error(`Data inválida: ${err.message}`);
    }
  }
};