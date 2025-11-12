import { WEBAPP_URL, IS_CALCOM } from "./constants";

export const getCalcomUrl = () => {
  if (IS_CALCOM) {
    const hostname = new URL(WEBAPP_URL).hostname;
    if (hostname.endsWith("jeroenandpaws.dev")) {
      return "https://jeroenandpaws.dev";
    }
    if (hostname.endsWith("jeroenandpaws.app")) {
      return "https://jeroenandpaws.app";
    }
    return "https://jeroenandpaws.com";
    }
  return WEBAPP_URL;
};
