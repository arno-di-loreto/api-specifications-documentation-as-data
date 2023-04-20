SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

CURRENT_DIR=`pwd`
npx http-server -o ../data-viewer-web-component/index.html
cd $CURREN_DIR