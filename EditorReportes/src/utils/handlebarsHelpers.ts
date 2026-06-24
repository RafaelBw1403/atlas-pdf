import Handlebars from "handlebars";
import moment from "moment";
import H from "just-handlebars-helpers";

let helpersRegistered = false;

export const setupHandlebarsHelpers = () => {
  if (helpersRegistered) return;
  helpersRegistered = true;

  // 1. Helpers de just-handlebars-helpers (pueden fallar, se maneja con catch)
  try {
    (H as any).registerHelpers(Handlebars);
  } catch (error) {
    console.error("Error registrando helpers de just-handlebars-helpers:", error);
  }

  // 2. Aliases para nombres comunes (siempre se registran)
  Handlebars.registerHelper("multiply", Handlebars.helpers.multiplication || ((a: number, b: number) => +a * +b));
  Handlebars.registerHelper("divide", Handlebars.helpers.division || ((a: number, b: number) => +a / +b));
  Handlebars.registerHelper("add", Handlebars.helpers.sum || ((a: number, b: number) => +a + +b));
  Handlebars.registerHelper("subtract", Handlebars.helpers.difference || ((a: number, b: number) => +a - +b));

  // 3. Helpers custom (sobrescriben los de la librería si hay conflicto)
  registerComparisonHelpers();
  registerLogicalHelpers();
  registerArrayHelpers();
  registerStringHelpers();
  registerDateHelpers();
  registerCustomCompareHelper();
};

const registerComparisonHelpers = () => {
  const helpers = {
    eq: (a: any, b: any) => a === b,
    ne: (a: any, b: any) => a !== b,
    lt: (a: any, b: any) => a < b,
    gt: (a: any, b: any) => a > b,
    lte: (a: any, b: any) => a <= b,
    gte: (a: any, b: any) => a >= b,
    not: (a: any) => !a,
    defined: (value: any) => value !== undefined && value !== null,
    isEven: (n: number) => n % 2 === 0
  };

  Object.entries(helpers).forEach(([name, helper]) => {
    Handlebars.registerHelper(name, helper);
  });
};

const registerLogicalHelpers = () => {
  Handlebars.registerHelper('and', function(this: any, ...args: any[]) {
    const options = args.pop();
    return args.every(Boolean) ? options.fn(this) : options.inverse(this);
  });

  Handlebars.registerHelper('or', function(this: any, ...args: any[]) {
    const options = args.pop();
    return args.some(Boolean) ? options.fn(this) : options.inverse(this);
  });

  Handlebars.registerHelper('not', function(this: any, value: any, options: any) {
    return !value ? options.fn(this) : options.inverse(this);
  });
};

const registerArrayHelpers = () => {
  Handlebars.registerHelper('each', function(this: any, context: any, options: Handlebars.HelperOptions) {
    if (!context || !Array.isArray(context)) {
      return options.inverse(this);
    }

    let result = '';
    for (let i = 0; i < context.length; i++) {
      result += options.fn(context[i], {
        data: {
          index: i,
          first: i === 0,
          last: i === context.length - 1,
          length: context.length
        }
      });
    }
    return result;
  });

  Handlebars.registerHelper('currency', (currency: string, amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currency || 'MXN'
    }).format(amount || 0);
  });

  Handlebars.registerHelper('length', (array: any[]) => {
    return Array.isArray(array) ? array.length : 0;
  });

  Handlebars.registerHelper('first', (array: any[]) => {
    return Array.isArray(array) && array.length > 0 ? array[0] : undefined;
  });

  Handlebars.registerHelper('last', (array: any[]) => {
    return Array.isArray(array) && array.length > 0 ? array[array.length - 1] : undefined;
  });
};

const registerStringHelpers = () => {
  Handlebars.registerHelper('concat', (...args: any[]) => {
    const values = args.slice(0, -1);
    return values.join('');
  });

  Handlebars.registerHelper('lowercase', (str: string) => {
    return typeof str === 'string' ? str.toLowerCase() : str;
  });

  Handlebars.registerHelper('uppercase', (str: string) => {
    return typeof str === 'string' ? str.toUpperCase() : str;
  });

  Handlebars.registerHelper('capitalize', (str: string) => {
    return typeof str === 'string' ? str.charAt(0).toUpperCase() + str.slice(1) : str;
  });
};

const registerDateHelpers = () => {
  Handlebars.registerHelper("dateFormat", (date: any, format: string = "YYYY-MM-DD") => {
    if (!date) return '';
    return moment(date).format(format);
  });

  Handlebars.registerHelper("now", (format: string = "YYYY-MM-DD") => {
    return moment().format(format);
  });

  Handlebars.registerHelper("addDays", (date: any, days: number, format: string = "YYYY-MM-DD") => {
    if (!date) return '';
    return moment(date).add(days, 'days').format(format);
  });
};

const registerCustomCompareHelper = () => {
  Handlebars.registerHelper(
    "compare",
    function (
      this: any,
      a: any,
      operator: string,
      b: any,
      options: Handlebars.HelperOptions
    ) {
      switch (operator) {
        case ">":   return a >  b ? options.fn(this) : options.inverse(this);
        case "<":   return a <  b ? options.fn(this) : options.inverse(this);
        case ">=":  return a >= b ? options.fn(this) : options.inverse(this);
        case "<=":  return a <= b ? options.fn(this) : options.inverse(this);
        case "==":  return a ==  b ? options.fn(this) : options.inverse(this);
        case "!=":  return a !=  b ? options.fn(this) : options.inverse(this);
        case "===": return a === b ? options.fn(this) : options.inverse(this);
        case "!==": return a !== b ? options.fn(this) : options.inverse(this);
        default:
          return options.inverse(this);
      }
    }
  );
};
