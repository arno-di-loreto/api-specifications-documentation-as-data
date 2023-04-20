SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

CURRENT_DIR=`pwd`
echo "Installing Python dependencies for md-parser-python"
echo "==================================================="
cd $SCRIPT_DIR/../md-parser-python
pipenv install
echo
echo "Installing NodeJS dependencies for data-versions-merge"
echo "==================================================="
cd $SCRIPT_DIR/../data-versions-merge
npm install
echo 
echo "Checking PlantUML presence for scripts/generate-plantuml.js"
echo "==========================================================="
if ! command -v plantuml &> /dev/null
then
  echo "Warning: plantuml could not be found, is required to generated PlantUML diagrams"
else
  echo "plantuml command found."
fi

cd $CURRENT_DIR