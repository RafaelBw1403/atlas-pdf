import { useEffect } from "react";
import { setupHandlebarsHelpers } from "../utils/handlebarsHelpers";

export const useHandlebarsSetup = () => {
  useEffect(() => {
    setupHandlebarsHelpers();
  }, []);
};
