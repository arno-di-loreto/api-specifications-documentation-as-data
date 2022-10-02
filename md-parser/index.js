//import {unified} from 'unified';
//import remarkParse from 'remark-parse'

import fs from 'fs';
import {unified} from 'unified';
import markdown  from 'remark-parse';
import remarkParse  from 'remark-parse';
import remarkToc from 'remark-toc';
import {toc} from 'mdast-util-toc';

//import html  from 'remark-html';
//import tocData from './toc-data-plugin.js';
import {visit} from 'unist-util-visit';
import slugify from 'slugify'
//import {visitParents} from 'unist-util-visit-parents';
import GithubSlugger  from 'github-slugger';

import {parents} from 'unist-util-parents'

/*
const contents = unified()
	.use(markdown)
  .use(tocData)
	.processSync(fs.readFileSync(`${process.cwd()}/content/openapi31.md`))
	.toString();

console.log(contents);
*/

const sources = [
  {
    versionName: "example",
    version: "z.u.r.g",
    githubUrl: "https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md",
    file: "./content/example.md"
  },
  {
    versionName: "3.1",
    version: "3.1.0",
    githubUrl: "https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md",
    file: "./content/3.1.0.md"
  },
  {
    versionName: "3.0",
    version: "3.0.3",
    githubUrl: "https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.3.md",
    file: "./content/3.0.3.md"
  },
  {
    versionName: "2.0",
    version: "2.0",
    githubUrl: "https://github.com/OAI/OpenAPI-Specification/blob/main/versions/2.0.md",
    file: "./content/2.0.md"
  }
];

const results = [];

sources.forEach(source => {
  const doc = fs.readFileSync(`${process.cwd()}/${source.file}`);
  //const tree = parents(unified().use(markdown).parse(doc));
  const tree = unified().use(markdown).parse(doc);
  //const tree = unified().use(remarkParse).use(remarkToc).parse(doc);

  //console.log(JSON.stringify(tree, null, 2));
  const links = [];
  const maxLevel = 4;

  const slugger = new GithubSlugger();
  visit(tree, 'heading', (node) => {
    if(node.depth <= maxLevel){
      // I assume the first child is the text value of heading
      //const headingFull = node.children.map(child => child.value).join('');
      const text = node.children.filter(child => child.type === 'text').map(child => child.value).join('');
      //const anchor = slugify(text, {lower: true, remove: ':'});
      const anchor = slugger.slug(text);
      const url = `${source.githubUrl}#${anchor}`;
      const level = node.depth;
      const id = `${source.version}-${anchor}`;
      let parent = null;
      if(links.length > 0){
        for(let i=links.length; i--; i>0){
          const previousHeader = links[i];
          if(previousHeader.level < level){
            parent = previousHeader.id;
            break;
          }
        }
      }

      links.push({
        id: id,
        level: level,
        text: text,
        anchor: anchor,
        url: url,
        parent: parent
      });

    }
  });

  results.push({
    version: source.versionName,
    links: links
  });

});



console.log(JSON.stringify(results, null, 2));
