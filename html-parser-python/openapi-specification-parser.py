
from bs4 import BeautifulSoup

# Loading markdown (GFM flavor) and converting it to HTML
#specification_location = '/Users/arnaud/Dev/openapi-specification-documentation-as-data/specifications/3.1.0.md'
specification_location = '../specifications/3.1.0.md'
markdown_file = open(specification_location)
markdown_content = markdown_file.read();
import markdown
md = markdown.Markdown(extensions=['tables',  'fenced_code'])
html = md.convert(markdown_content)
#print(html)

import re
regex_header = re.compile(r'^h(\d)')
def get_header_level(element):
  level = -1
  if element.name != None:
    header = regex_header.search(element.name)
    if header != None:
      level = int(header.group(1))
  return level


def generate_tree(soup):
  current = soup.find_all('h1')[0]
  result = []
  while current != None:
    header_level = get_header_level(current)
    if header_level > 0:
      print(current)
      print('header level', header_level)
    current = current.next_sibling
  return result

# Parsing
soup = BeautifulSoup(html, 'html.parser')
generate_tree(soup)
