import { ARK_RESOURCE_DOMAIN } from "@/constants/api";
import { getArkDataUrl, getArkResourceUrl } from "@/utils/resource";

describe("resource", () => {
  it("generates R2 asset URLs under the assets directory", () => {
    expect(getArkResourceUrl("items/GOLD")).toBe(`${ARK_RESOURCE_DOMAIN}/assets/items/GOLD.webp`);
  });

  it("keeps explicit asset file extensions when generating R2 asset URLs", () => {
    expect(getArkResourceUrl("/avatar/DEFAULT/avatar_def_mc.webp")).toBe(
      `${ARK_RESOURCE_DOMAIN}/assets/avatar/DEFAULT/avatar_def_mc.webp`
    );
  });

  it("generates R2 data URLs under the data directory", () => {
    expect(getArkDataUrl("item_table.json")).toBe(`${ARK_RESOURCE_DOMAIN}/data/item_table.json`);
    expect(getArkDataUrl("stage_table.json")).toBe(`${ARK_RESOURCE_DOMAIN}/data/stage_table.json`);
    expect(getArkDataUrl("character_table.json")).toBe(
      `${ARK_RESOURCE_DOMAIN}/data/character_table.json`
    );
  });
});
