SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

$SCRIPT_DIR/generate-json.sh
$SCRIPT_DIR/generate-plantuml.sh
$SCRIPT_DIR/generate-mermaidjs.sh