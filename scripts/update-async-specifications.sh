SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

SPEC_DIR=$SCRIPT_DIR/../specifications

rm $SPEC_DIR/asyncapi*.md

git clone git@github.com:asyncapi/website.git
rm ./website/pages/docs/reference/specification/_section.md
files=`ls ./website/pages/docs/reference/specification/*.md`

for file in $files
do
  filename=`basename $file`
  if [[ $filename = v3* ]]
  then
    targetname="asyncapi-3.0.0.md"
    # do nothing for now (parser not working)
  else
    targetname="asyncapi-${filename:1}"
    cp $file $SPEC_DIR/$targetname
  fi
done
rm -rf ./website