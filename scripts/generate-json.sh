SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

CURRENT_DIR=`pwd`
SPEC_DIR=$SCRIPT_DIR/../specifications
DATA_DIR=$SCRIPT_DIR/../specifications-data
PARSER_DIR=$SCRIPT_DIR/../oas-md-parser-python

cd $PARSER_DIR

rm $DATA_DIR/*.json

for FILE in `ls $SPEC_DIR/*.md`
do
  DIR="$(dirname "${FILE}")"
  FILENAME=$(basename -- "$FILE")
  VERSION=${FILENAME%%.md}
  echo "Generating JSON for $VERSION"
  # JSON
  pipenv run python src/OasMarkdownParserCli.py $FILE $DATA_DIR/$VERSION.json  
done

cd $CURRENT_DIR

