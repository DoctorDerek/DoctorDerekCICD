import { createJiti } from "jiti"

const { default: createPreviewTest } = createJiti(import.meta.url)(
  "./createPreviewTest.ts",
)

export default createPreviewTest
