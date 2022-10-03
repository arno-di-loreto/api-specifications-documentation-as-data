
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
  def __init__(self, line_soup, table):
    self.table = table
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

  def get_value_by_header(self, header_names):
    print('get by header', header_names)
    print('headers', self.table.headers)
    result = None
    for header_name in header_names:
      print('header', header_name)
      index = 0
      while index < len(self.table.headers): 
        if self.table.headers[index].text == header_name:
          print('index', index)
          result = self.values[index]
          break;
        else:
          index += 1
    print('result', result)
    return result

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
      line = TableNodeLine(line_html, self)
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

  def get_node(self, text, type=None, level=None):
    #print('search', text, type, level)
    found_flag = False
    if text == self.get_text():
      found_flag = True
      if type != None:
        found_flag = found_flag and (type == self.type)
      if level != None:
        found_flag =  found_flag and (level == self.level)
    #print('result', found_flag, self.get_text()[0:20], self.type, self.level)
    if found_flag == True:
      print('result', found_flag, self.get_text()[0:20], self.type, self.level)
      return self
    else:
      for child in self.children:
        found = child.get_node(text, type, level)
        if found != None:
          return found;
    return None

  def get_text(self):
    return self.soup.text

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


class FieldType:
  def __init__(self, soup):
    self.soup = soup
    self.__init__list_and_types()

  def __init__list_and_types(self):
    type_regex = re.compile(r'^((?P<map>Map\[)(?P<key>[a-zA-Z\s]+),)?(?P<array>\[)?(?P<types>[a-zA-Z\*\|\s]+)(?:\])?.*$') 
    #.* at the end because of typo in v3.1 on webhooks property Map[string, Path Item Object | Reference Object] ]
    print('source', self.soup.text)
    type_search = type_regex.search(self.soup.text)
    print(type_search)
    
    self.map_key = None
    self.list_type = None
    if type_search.group('map'):
      self.list_type = 'map'
      self.map_key = type_search.group('key')
    elif type_search.group('array'):
      self.list_type = 'array'

    types = type_search.group('types').split('|')
    self.types = []
    for t in types:
      self.types.append(t.strip())
    print(self.to_dict())
  
  def to_dict(self):
    return {
      'listType': self.list_type, 
      'mapKeyType': self.map_key,
      'types': self.types
    }

class SchemaField:
  def __init__(self, table_node_line, name_type):
    self.id = table_node_line.anchor
    self.name_type = name_type
    self.name = table_node_line.get_value_by_header(['Field Name', 'Field Pattern'])
    print('field: ', self.name.text)
    self.type = FieldType(table_node_line.get_value_by_header(['Type']))
    self.applies_to = table_node_line.get_value_by_header(['Validity','Applies To'])
    self.description = table_node_line.get_value_by_header(['Description'])
  
  def to_dict(self):
    applies_to = None
    if self.applies_to != None:
      applies_to = self.applies_to.text
    return {
      'name': self.name.text,
      'nameType': self.name_type,
      'id': self.id,
      'type': self.type.to_dict(),
      'appliesTo': applies_to,
      'description': self.description.text
    }

class SchemaFields:
  def __init__(self, fields_node, name_type):
    self.node = fields_node
    self.fields = []
    if fields_node != None:
      print('fixed fields')
      for child in self.node.children:
        if child.type == 'content' and child.sub_type == 'table':
          print('table found')
          for line in child.table.lines:
            self.fields.append(SchemaField(line, name_type))
    else:
      print('NO fixed fields')

  def append_fields(self, schema_fields):
    self.fields = self.fields + schema_fields.fields

  def to_dict(self):
    fields_dict = []
    for field in self.fields:
      fields_dict.append(field.to_dict())
    return fields_dict

class OpenApiSpecificationSchema:
  def __init__(self, schema_node, specification):
    self.specification = specification
    self.name = schema_node.get_text()
    self.node = schema_node
    self.__init_is_extensible()
    self.__init_fields()

  def __init_fields(self):
    print('=======>Schema ', self.name)
    fixed_fields_node = self.node.get_node('Fixed Fields', 'header')
    fixed_fields = SchemaFields(fixed_fields_node, 'fixed')
    patterned_fields_node = self.node.get_node('Patterned Fields', 'header')
    patterned_fields = SchemaFields(patterned_fields_node, 'patterned')
    # in v2 ^x- are inconsistently in Patterned Objects and Patterned Field
    patterned_objects_node = self.node.get_node('Patterned Objects', 'header')
    patterned_objects = SchemaFields(patterned_objects_node, 'patterned')

    self.fields = fixed_fields
    self.fields.append_fields(patterned_fields)
    self.fields.append_fields(patterned_objects)

    # also in v2/v3 extension are not described as objects -> to add manually
    # in v3 ^x- are not explicitly described -> To add manually

  def __init_is_extensible(self):
    self.is_extensible = False
    for child in self.node.children:
      # OpenAPI 3, 3.1
      v3_extensible_content = self.node.get_node('This object MAY be extended with Specification Extensions.', 'content')
      self.is_extensible = (v3_extensible_content != None)
      # Swagger 2
      # Look for a ^x- field


  def to_dict(self):
    return {
      'name': self.name,
      'extensible': self.is_extensible,
      'fields': self.fields.to_dict(),
      #'node': self.node.to_dict()
    }

class OpenApiSpecification:
  def __init__(self, document_tree):
    self.document_tree = document_tree
    self.__init__version()
    self.__init__schemas()

  def __init__version(self):
    title_regex = re.compile(r'Version (.*)')
    version_header_soup = self.document_tree.soup.find('h4')
    version_header = title_regex.search(version_header_soup.text)
    self.version = version_header.group(1)
  
  def __init__schemas(self):
    schemas_node = self.document_tree.get_node('Schema', 'header', 3)
    self.schemas = []
    for schema_node in schemas_node.children:
      if schema_node.type == 'header':
        self.schemas.append(OpenApiSpecificationSchema(schema_node, self))

  def to_dict(self):
    schemas_dict = []
    for schema in self.schemas:
      schemas_dict.append(schema.to_dict())
    return {
      'version': self.version,
      'schemas': schemas_dict
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

versions = [
  '2.0', 
  '3.0.3',
  '3.1.0'
]
source = '../specifications'
target = './specifications-data'

for version in versions:
  html = load_markdown_as_html(source + '/'+ version + '.md')
  soup = BeautifulSoup(html, 'html.parser')
  tree_node = generate_tree(soup)
  tree_dict = tree_node.to_dict()

  openapi = OpenApiSpecification(tree_node)
  openapi_dict = openapi.to_dict()
  full_dict = {
    'data': openapi_dict,
    'source': tree_dict
  }
  result_dict = openapi_dict
  result_json = json.dumps(result_dict, indent = 4) 
  f = open(target+'/'+version+'.json','w')
  f.write(result_json)
  f.close()