
from bs4 import BeautifulSoup
import re
import markdown
import json 

regex_header = re.compile(r'^h(\d)')
def get_header_level(element):
  level = -1
  if element.name != None:
    header = regex_header.search(element.name)
    if header != None:
      level = int(header.group(1))
  return level

def get_parent_node(new_node, current_parent_node): 
  if new_node.level > current_parent_node.level:
    return current_parent_node
  elif new_node.level == current_parent_node.level:
    return current_parent_node.parent 
  else: # new_header_node.level < current_parent_node.level:
    return get_parent_node(new_node, current_parent_node.parent)
class Node:
  def __init__(self, soup=None, current_parent_node=None):
    self.soup = soup
    self.children = []
    self.set_type_and_level()
    self.set_parent_node(current_parent_node)
  
  def add_child(self, node):
    self.children.append(node)

  def set_type_and_level(self):
    if self.soup == None:
      self.type = 'root'
      self.level = 0
    else:
      header_level = get_header_level(self.soup)
      if header_level > 0:
        self.type = 'header'
        self.level = header_level
      else:
        self.type = 'content'
        self.level = None

  def set_parent_node(self, current_parent_node):
    if current_parent_node != None:
      if self.type != 'header': # for now 'content
        self.parent = current_parent_node
      else:
        self.parent = get_parent_node(self, current_parent_node)
      self.parent.add_child(self)

  def to_dict(self):
    dict_children = []
    for child in self.children:
      dict_children.append(child.to_dict())
    dict_node = {
      'type': self.type,
      'level': self.level,
      'html': str(self.soup),
      'children': dict_children
    }
    return dict_node


def generate_tree(soup):
  current_soup = soup.find_all('h1')[0]
  root_node = Node()
  current_parent_node = root_node
  while current_soup != None:
    new_node = Node(current_soup, current_parent_node)
    if new_node.type == 'header':
      current_parent_node = new_node
    else:
      current_parent_node = new_node.parent
    current_soup = current_soup.next_sibling
  return root_node

def load_markdown_as_html(file):
  # Loading markdown (GFM flavor) and converting it to HTML
  specification_location = file
  markdown_file = open(specification_location)
  markdown_content = markdown_file.read();
  md = markdown.Markdown(extensions=['tables',  'fenced_code'])
  html = md.convert(markdown_content)
  return html

html = load_markdown_as_html('../specifications/3.1.0.md')
soup = BeautifulSoup(html, 'html.parser')
tree_node = generate_tree(soup)
tree_dict = tree_node.to_dict()
tree_json = json.dumps(tree_dict, indent = 4) 
print(tree_json)
