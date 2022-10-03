
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

def get_content_sub_type(soup):
  if soup.name == 'table':
    return 'table'
  elif soup.name == 'pre':
    return 'code'
  else:
    return 'text' 

def get_parent_node(new_node, current_parent_node): 
  if new_node.level > current_parent_node.level:
    return current_parent_node
  elif new_node.level == current_parent_node.level:
    return current_parent_node.parent 
  else: # new_header_node.level < current_parent_node.level:
    return get_parent_node(new_node, current_parent_node.parent)

class HeaderNode:
  def __init__(self, node):
    self.__init_level(node.soup)
    self.__init__anchor(node.soup)
    self.__init__id(node.soup)
  
  def __init_level(self, soup):
    self.level = get_header_level(soup)

  def __init__anchor(self, soup):
    anchor = soup.find('a')
    if anchor != None:
      self.anchor = anchor['name']
    else:
      self.anchor = None

  def __init__id(self, soup):
    self.id = soup['id']

  def to_dict(self):
    return {
      'level': self.level,
      'id': self.id,
      'anchor': self.anchor
    }

class CodeNode:

  def __init__(self, node):
    code_block = node.soup.find_all('code')[0];
    self.value = code_block
    regex_language = re.compile(r'language-(.*)')
    code_block_with_class = node.soup.find_all(class_=regex_language)
    if len(code_block_with_class) > 0:
      class_language = regex_language.search(code_block_with_class[0]['class'][0])
      self.language = class_language.group(1)
    else:
      self.language = None
  
  def to_dict(self):
    return {
      'language': self.language,
      'text': self.value.text
    }

class TableNodeLine:
  def __init__(self, line_soup):
    self.__init__anchor(line_soup)
    self.__init__values(line_soup)

  def __init__anchor(self, soup):
    anchor = soup.find('a')
    self.anchor = None
    if anchor != None:
      if anchor.has_attr('name'):
        self.anchor = anchor['name']      

  def __init__values(self, soup):
    cells_html = soup.find_all('td')
    self.values = []
    for cell_html in cells_html:
      self.values.append(cell_html)

  def to_dict(self):
    values = []
    for value in self.values:
      values.append({
        'text': value.text,
        'html': value.decode_contents()
      })
    return {
      'anchor': self.anchor,
      'values': values
    }

class TableNode:
  def __init__(self, node):
    self.__init__headers(node.soup)
    self.__init__lines(node.soup)

  def __init__headers(self, soup):
    self.headers = []
    headers_html = soup.find_all('th')
    for header_html in headers_html:
      self.headers.append(header_html)

  def __init__lines(self, soup):
    self.lines = []
    lines_html = soup.find_all('tr')
    for line_html in lines_html:
      line = TableNodeLine(line_html)
      if(len(line.values) > 0): # workaround because th are also in tr
        self.lines.append(line)
  
  def to_dict(self):
    headers_dict = []
    for header in self.headers:
      headers_dict.append({
        'text': header.text,
        'html': header.decode_contents()
      })
    lines_dict = []
    for line in self.lines:
      lines_dict.append(line.to_dict())
    return {
      'headers': headers_dict,
      'lines': lines_dict
    }

class Node:
  def __init__(self, soup=None, current_parent_node=None):
    self.soup = soup
    self.children = []
    self.set_type_and_level(current_parent_node)
    self.set_parent_node(current_parent_node)
  
  def add_child(self, node):
    self.children.append(node)

  def set_type_and_level(self, current_parent_node):
    self.sub_type = None
    self.level = None
    self.code = None
    if current_parent_node == None:
      self.type = 'root'
      self.level = 0
    else:
      header_level = get_header_level(self.soup)
      if header_level > 0:
        self.type = 'header'
        self.level = header_level
        self.header = HeaderNode(self)
      else:
        self.type = 'content'
        self.sub_type = get_content_sub_type(self.soup)
        if self.sub_type == 'code':
          self.code = CodeNode(self)
        elif self.sub_type == 'table':
          self.table = TableNode(self)

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
    if self.soup != None:
      text = self.soup.text
    else:
      text = None
    dict_node = {
      'type': self.type,
      'subType': self.sub_type,
      'level': self.level,
      'text': text,
      'html': str(self.soup),
      'children': dict_children
    }
    if self.type == 'header':
      dict_node['header'] = self.header.to_dict()
    elif self.type == 'content':
      if self.sub_type == 'code':
        dict_node['code'] = self.code.to_dict()
      elif self.sub_type == 'table':
        dict_node['table'] = self.table.to_dict()
    
    return dict_node

class OpenApiSpecification:
  def __init__(self, document_tree):
    self.document_tree = document_tree
    self.__init__version()

  def __init__version(self):
    title_regex = re.compile(r'Version (.*)')
    version_header_soup = self.document_tree.soup.find('h4')
    version_header = title_regex.search(version_header_soup.text)
    self.version = version_header.group(1)

  def to_dict(self):
    return {
      'version': self.version
    }



def is_not_excluded_soup(soup):
  return soup.text != '\n'

def generate_tree(soup):
  root_node = Node(soup)
  current_soup = soup.find_all('h1')[0]
  current_parent_node = root_node
  while current_soup != None:
    if is_not_excluded_soup(current_soup):
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
  md = markdown.Markdown(extensions=['tables',  'fenced_code', 'toc'])
  html = md.convert(markdown_content)
  return html

html = load_markdown_as_html('../specifications/3.1.0.md')
soup = BeautifulSoup(html, 'html.parser')
tree_node = generate_tree(soup)
tree_dict = tree_node.to_dict()

openapi = OpenApiSpecification(tree_node)
openapi_dict = openapi.to_dict()

result_dict = {
  'data': openapi_dict,
  'source': tree_dict
}
result_json = json.dumps(result_dict, indent = 4) 
print(result_json)
#print(json.dumps(openapi_dict, indent = 4))