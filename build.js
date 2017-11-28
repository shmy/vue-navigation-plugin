const { name } = require("./package.json");
const rollup = require("rollup");
const buble = require("rollup-plugin-buble");
const UglifyJS = require("uglify-js");
const { writeFileSync, readFileSync } = require("fs");
const toCamelCase = src => src.replace(/-(\w)/g, ($0, $1) => $1.toUpperCase());

const moduleName = toCamelCase(name);

const files = [
  { file: `dist/${name}.cjs.js`, format: "cjs" },
  { file: `dist/${name}.es.js`, format: "es" },
  { file: `dist/${name}.amd.js`, format: "amd" },
  { file: `dist/${name}.umd.js`, format: "umd" },
  { file: `dist/${name}.iife.js`, format: "iife" }
]
  .map(file => Object.assign(file, { name: moduleName, exports: "auto" }));

const inputOptions = {
  input: "./src/index.js",
  plugins: [
    buble()
  ],
  amd: {
    id: name
  }
};
(async () => {
  const bundle = await rollup.rollup(inputOptions);
  for (let file of files) {
    await bundle.write(file);
  }
  const minifys = files
    .filter(item => item.format !== "es")
    .map(item => ({
      file: item.file,
      output: item.file.replace(/\.js$/, ".min.js").replace(/^dist\//, ""),
      map: item.file.replace(/\.js$/, ".min.js.map").replace(/^dist\//, "")
    }));
  for (let minify of minifys) {
    const result = UglifyJS.minify(
      readFileSync(minify.file, { encoding: "utf-8" }),
      {
        sourceMap: {
          filename: minify.output,
          url: minify.map
        }
      }
    );
    writeFileSync(`dist/${minify.output}`, result.code, { encoding: "utf8" });
    writeFileSync(`dist/${minify.map}`, result.map, { encoding: "utf8" });
  }
})();
