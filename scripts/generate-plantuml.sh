SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

CURRENT_DIR=`pwd`
SPEC_DIR="$SCRIPT_DIR/../specifications"
DATA_DIR="$SCRIPT_DIR/../specifications-data"
PARSER_DIR="$SCRIPT_DIR/../oas-md-parser-python"

cd $PARSER_DIR

# rm "$DATA_DIR/*.puml*" # Not working 🤔
for FILE in `ls $DATA_DIR/*.puml*`
do
  rm $FILE
done

for FILE in `ls $SPEC_DIR/*.md`
do
  DIR="$(dirname "${FILE}")"
  FILENAME=$(basename -- "$FILE")
  VERSION=${FILENAME%%.md}
  echo "Generating PlantUML for $VERSION"
  
  PLANT_UML_FILE=$DATA_DIR/$VERSION.puml
  pipenv run python src/OasMarkdownParserCli.py $FILE $PLANT_UML_FILE
  plantuml -tsvg -o puml $PLANT_UML_FILE
  mv $DATA_DIR/puml/$VERSION.svg $DATA_DIR/$VERSION.puml.svg
  plantuml -tpng -o puml $PLANT_UML_FILE
  mv $DATA_DIR/puml/$VERSION.png $DATA_DIR/$VERSION.puml.png
  
done

rm -rf $DATA_DIR/puml

cd $CURRENT_DIR
