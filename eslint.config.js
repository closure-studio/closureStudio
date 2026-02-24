import pluginVue from "eslint-plugin-vue";
import vueTsEslintConfig from "@vue/eslint-config-typescript";

export default [
    {
        ignores: ["dist/**", "coverage/**"],
    },
    ...pluginVue.configs["flat/essential"],
    ...vueTsEslintConfig({
        rules: {
            "@typescript-eslint/ban-ts-comment": "off",
            "@typescript-eslint/no-empty-object-type": "off",
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-namespace": "off",
            "@typescript-eslint/no-unused-vars": "off",
            "prefer-const": "off",
            "vue/block-lang": "off",
            "vue/multi-word-component-names": "off",
            "vue/no-deprecated-slot-attribute": "off",
            "vue/no-mutating-props": "off",
            "vue/no-unused-vars": "off",
            "vue/no-side-effects-in-computed-properties": "off",
            "vue/require-v-for-key": "off",
            "vue/require-valid-default-prop": "off",
            "vue/valid-template-root": "off",
        },
    }),
    {
        files: ["src/**/*.{ts,tsx,vue,d.ts}"],
        rules: {
            "@typescript-eslint/ban-ts-comment": "off",
            "@typescript-eslint/no-empty-object-type": "off",
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-namespace": "off",
            "@typescript-eslint/no-unused-vars": "off",
            "prefer-const": "off",
            "vue/block-lang": "off",
            "vue/multi-word-component-names": "off",
            "vue/no-deprecated-slot-attribute": "off",
            "vue/no-mutating-props": "off",
            "vue/no-unused-vars": "off",
            "vue/no-side-effects-in-computed-properties": "off",
            "vue/require-v-for-key": "off",
            "vue/require-valid-default-prop": "off",
            "vue/valid-template-root": "off",
        },
    },
];
