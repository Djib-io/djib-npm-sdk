import { defineConfig } from "vite"
import dts from "vite-plugin-dts"
import path from "path"

export default ({ mode }) => {
    return defineConfig({
        plugins: [
            dts({
                insertTypesEntry: true,
            }),
        ],
        build: {
            lib: {
                entry: path.resolve(__dirname, "lib", "index.ts"),
                name: "djib",
                formats: ["es", "cjs"],
                fileName: "main",
            },
        },
    })
}
