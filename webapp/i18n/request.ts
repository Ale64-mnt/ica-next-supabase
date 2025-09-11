import {getRequestConfig} from "next-intl/server";

export default getRequestConfig(async ({locale}) => {
  try {
    const mod = await import(`../messages/${locale}.json`);
    return { locale, messages: mod.default };
  } catch {
    const mod = await import("../messages/it.json");
    return { locale: "it", messages: mod.default };
  }
});