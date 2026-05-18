import { ARK_RESOURCE_DOMAIN } from "@/constants/api";
import { getArkDataUrl, getArkResourceUrl, getGameAvatarUrl } from "@/utils/resource";

describe("resource", () => {
  it("generates R2 asset URLs under the assets directory", () => {
    expect(getArkResourceUrl("items/GOLD")).toBe(`${ARK_RESOURCE_DOMAIN}/assets/items/GOLD.webp`);
  });

  it("keeps explicit asset file extensions when generating R2 asset URLs", () => {
    expect(getArkResourceUrl("/avatar/DEFAULT/avatar_def_01.webp")).toBe(
      `${ARK_RESOURCE_DOMAIN}/assets/avatar/DEFAULT/avatar_def_01.webp`
    );
  });

  it("generates R2 data URLs under the data directory", () => {
    expect(getArkDataUrl("item_table.json")).toBe(`${ARK_RESOURCE_DOMAIN}/data/item_table.json`);
    expect(getArkDataUrl("stage_table.json")).toBe(`${ARK_RESOURCE_DOMAIN}/data/stage_table.json`);
    expect(getArkDataUrl("character_table.json")).toBe(
      `${ARK_RESOURCE_DOMAIN}/data/character_table.json`
    );
  });

  it("uses the default doctor avatar when game avatar data is empty", () => {
    expect(getGameAvatarUrl({ type: "", id: "" })).toBe(
      `${ARK_RESOURCE_DOMAIN}/assets/avatar/DEFAULT/avatar_def_01.webp`
    );
  });

  it("normalizes game avatar ids and maps icon avatars to default resources", () => {
    expect(getGameAvatarUrl({ type: "ICON", id: "avatar@foo#bar" })).toBe(
      `${ARK_RESOURCE_DOMAIN}/assets/avatar/DEFAULT/avatar_foo_bar.webp`
    );
  });

  it("maps non-icon game avatars to assistant resources", () => {
    expect(getGameAvatarUrl({ type: "ASSISTANT", id: "char_002_amiya" })).toBe(
      `${ARK_RESOURCE_DOMAIN}/assets/avatar/ASSISTANT/char_002_amiya.webp`
    );
  });

  it("maps assistant skin avatar ids to resource indexes", () => {
    expect(getGameAvatarUrl({ type: "ASSISTANT", id: "char_1041_angel2#1" })).toBe(
      `${ARK_RESOURCE_DOMAIN}/assets/avatar/ASSISTANT/char_1041_angel2_2.webp`
    );
  });
});
