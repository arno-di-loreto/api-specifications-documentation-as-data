SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

SPEC_DIR=$SCRIPT_DIR/../specifications
GITHUB_DIR=./website
GITHUB_MD_DIR=$GITHUB_DIR/pages/docs/reference/specification
GITHUB=git@github.com:asyncapi/website.git
FILE_PREFIX=asyncapi

rm $SPEC_DIR/$FILE_PREFIX*.md

git clone $GITHUB
rm $GITHUB_MD_DIR/_section.md
files=`ls $GITHUB_MD_DIR/*.md`

for file in $files
do
  filename=`basename $file`
  if [[ $filename = v3* ]]
  then
    tmp="dummy"
    # do nothing for now (parser not working)
  else
    targetname="$FILE_PREFIX-${filename:1}"
    cp $file $SPEC_DIR/$targetname
  fi
done
rm -rf $GITHUB_DIR




