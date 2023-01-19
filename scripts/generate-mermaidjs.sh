SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

CURRENT_DIR=`pwd`
SPEC_DIR="$SCRIPT_DIR/../specifications"
DATA_DIR="$SCRIPT_DIR/../specifications-data"
PARSER_DIR="$SCRIPT_DIR/../oas-md-parser-python"

cd $PARSER_DIR

# rm "$DATA_DIR/*.puml*" # Not working 🤔
for FILE in `ls $DATA_DIR/*.mmd*`
do
  rm $FILE
done

for FILE in `ls $SPEC_DIR/*.md`
do
  DIR="$(dirname "${FILE}")"
  FILENAME=$(basename -- "$FILE")
  VERSION=${FILENAME%%.md}
  echo "Generating MermaidJS for $VERSION"
  
  MERMAIDJS_FILE=$DATA_DIR/$VERSION.mmd
  pipenv run python src/OasMarkdownParserCli.py $FILE $MERMAIDJS_FILE
  npx @mermaid-js/mermaid-cli -i $MERMAIDJS_FILE -o $MERMAIDJS_FILE.svg
  npx @mermaid-js/mermaid-cli -i $MERMAIDJS_FILE -o $MERMAIDJS_FILE.png --scale 4

done

cd $CURRENT_DIR
