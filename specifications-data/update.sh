cd ../oas-md-parser-python
pipenv run python src/OasMarkdownParserCli.py ../specifications/3.1.0.md ../specifications-data/3.1.0.json
pipenv run python src/OasMarkdownParserCli.py ../specifications/3.0.3.md ../specifications-data/3.0.3.json
pipenv run python src/OasMarkdownParserCli.py ../specifications/2.0.md ../specifications-data/2.0.json
cd ../specifications-data