// src/types/just-handlebars-helpers.d.ts
declare module "just-handlebars-helpers" {
  import type Handlebars from "handlebars";

  /**
   * Registers a set of helpers on the provided Handlebars instance.
   * If no instance is provided, implementations commonly return the helpers map.
   */
  export default function registerHelpers(
    hbs?: typeof Handlebars
  ): Record<string, Handlebars.HelperDelegate>;
}
