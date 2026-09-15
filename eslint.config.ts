import tseslint from "typescript-eslint"

export default tseslint.config(
  { ignores: ["node_modules/**", "coverage/**", "repomix-temp.*/**"] },
  ...tseslint.configs.recommended,
)
