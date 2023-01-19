SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

SPEC_DIR=$SCRIPT_DIR/../specifications

rm $SPEC_DIR/*.md
git clone git@github.com:OAI/OpenAPI-Specification.git
cp ./OpenAPI-Specification/versions/*.md $SPEC_DIR
rm $SPEC_DIR/1.2.md
rm -rf OpenAPI-Specification