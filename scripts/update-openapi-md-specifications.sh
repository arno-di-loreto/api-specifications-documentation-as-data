SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

SPEC_DIR=$SCRIPT_DIR/../specifications
GITHUB_DIR=./OpenAPI-Specification
GITHUB_MD_DIR=$GITHUB_DIR/versions
GITHUB=git@github.com:OAI/OpenAPI-Specification.git
FILE_PREFIX=openapi

rm $SPEC_DIR/$FILE_PREFIX*.md

git clone $GITHUB
rm $GITHUB_MD_DIR/1.2.md
files=`ls $GITHUB_MD_DIR/*.md`

for file in $files
do
  filename=`basename $file`
  targetname="$FILE_PREFIX-$filename"
  cp "$file" "$SPEC_DIR/$targetname"
done
rm -rf "$GITHUB_DIR"