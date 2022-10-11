# OpenAPI Specification Markdown Parser

Parses OpenAPI Specification markdown documentation to extract data and save them in a json file.
Works only with OpenAPI `2.0`, `3.0` and `3.1` markdown documents.
Warning: This project is in early alpha stage. Data format is not stabilized (and not defined)

## Installation

Run the following command to download dependencies (check [pipenv](https://pipenv-fork.readthedocs.io/en/latest/basics.html) documentation)

```
pipenv install
```

## Usage

Runs with the following command line:

```
pipenv run python src/OasMarkdownParserCli.py <source md file> <optional output json file>
```

The following command prints the data extracted from `../specifications/3.1.0.md` to the terminal:

```
pipenv run python src/OasMarkdownParserCli.py ../specifications/3.1.0.md
```

The following command saves the data extracted from `../specifications/3.1.0.md` to `../specifications-data/3.1.0.json`:

```
pipenv run python src/OasMarkdownParserCli.py ../specifications/3.1.0.md ../specifications-data/3.1.0.json
```
