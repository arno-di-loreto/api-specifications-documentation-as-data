SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

if [[ $1 == "--update" ]]
then
  $SCRIPT_DIR/update-asyncapi-md-specifications.sh
  $SCRIPT_DIR/update-openapi-md-specifications.sh
else
  echo "Bypassing MD files update (use --update flag)"
fi

$SCRIPT_DIR/parse-md-specifications.sh
$SCRIPT_DIR/merge-specifications-data.sh
$SCRIPT_DIR/generate-plantuml.sh
$SCRIPT_DIR/generate-mermaidjs.sh