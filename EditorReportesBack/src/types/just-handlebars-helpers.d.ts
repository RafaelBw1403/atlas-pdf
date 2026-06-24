declare module "just-handlebars-helpers" {
  import type Handlebars from "handlebars";

  class H {
    static registerHelpers(
      hbs?: typeof Handlebars
    ): Record<string, Handlebars.HelperDelegate>;
  }

  export default H;
}
