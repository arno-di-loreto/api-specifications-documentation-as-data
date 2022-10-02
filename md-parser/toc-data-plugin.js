// An example of unified plugin
// See https://css-tricks.com/how-to-modify-nodes-in-an-abstract-syntax-tree/#aa-write-a-plugin-for-unified
// See https://unifiedjs.com/learn/guide/create-a-plugin/
import {visit} from 'unist-util-visit';
import slugify from 'slugify'


function visitHeadings(tree, maxLevel, parentName) {
  visit(tree, 'heading', (node) => {
    if(node.depth <= maxLevel){
      // I assume the first child is the text value of heading
      //const headingFull = node.children.map(child => child.value).join('');
      const headingText = node.children.filter(child => child.type === 'text').map(child => child.value).join('');
      const headingAnchor = slugify(headingText, {lower: true, remove: ':'});
      const headingLevel = node.depth;
      console.log('[level]', headingLevel, '[title]', headingText, '[anchor]', headingAnchor);
      //console.log(JSON.stringify(node, null, 2));
    }
  });
}

export default function tocData() {
  return (tree, file) => {
    //console.log('tocData plugin!', JSON.stringify(tree, null, 2));
    visitHeadings(tree, 4);
  }
}
