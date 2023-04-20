SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"


CURRENT_DIR=`pwd`
cd $SCRIPT_DIR
rm ../specifications-data/*merged.*
cd $SCRIPT_DIR/../data-versions-merge
npm run merge
cd $CURRENT_DIR