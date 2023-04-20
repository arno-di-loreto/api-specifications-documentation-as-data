This folder contains various utility bash script to install and run the (working) modules of this repository:

- `serve.sh`: Starts a web server showing the `../data-viewer-web-component`website.
- `install.sh`: Install the dependencies for modules used by the following scripts.
- `update-asyncapi-md-specifications.sh` pulls AyncAPI Specification Markdown documents from the [AsyncAPI website repository](https://github.com/asyncapi/website) to update the `../specifications` folder.
- `update-openapi-md-specifications.sh` pulls Markdown documents from the [OpenAPI Specification GitHub repository](https://github.com/OAI/OpenAPI-Specification/tree/main/versions) to update the `../specifications` folder.
- `generate-all-data.sh` extract data from MD files, generate cross versions data (merge), and generate PlantUML and MermaidJS diagrams. Use the `--update` flag to update MD files before generation.
- `parse-md-specifications-data.sh`: Parse the MD files under `../specifications` to extract data to `../specifications-data/*.json` files.
- `merge-specifications-data.sh`: Create cross-version data for OpenAPI 2.0, 3.0, and 3.1, and for AsyncAPI 2.0 to 2.6 by merging the JSON files from `../specifications-data` into `openapi-merges.json` and `asyncapi-merged.json` files.
- `generate-plantuml.sh` generates [PlantUML](https://plantuml.com/) class diagram (+ SVG and PNG images) for each Markdown document located in `../specifications` (`plantuml` command line tool must be available in PATH, can be installed with `brew install plantuml` on macOS).
- `generate-mermaid.sh` generate [MermaidJS](https://mermaid.js.org/) class diagram (+ SVG and PNG images) for each Markdown document located in `../specifications` (requires `npx` which comes with `npm`).
