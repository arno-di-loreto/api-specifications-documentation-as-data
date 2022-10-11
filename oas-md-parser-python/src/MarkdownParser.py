from UtilsClass import Dictable
import UtilsFile 
from bs4 import BeautifulSoup
import bs4
import re

class ContentFactory():

  def get_parent_section(new_content, current_parent_content): 
    if new_content.type == ContentType.CONTENT:
      return current_parent_content
    # ContentType.SECTION
    elif new_content.level > current_parent_content.level:
      return current_parent_content
    elif new_content.level == current_parent_content.level:
      return current_parent_content._parent 
    else: # new_content.level < current_parent_content.level:
      return ContentFactory.get_parent_section(new_content, current_parent_content._parent)

  def create_content(parsed_html):
    type = ContentType.get_type(parsed_html)
    if type == ContentType.SECTION:
      return ContentSection(parsed_html)
    else:
      sub_type = ContentSubType.get_sub_type(parsed_html)
      if sub_type == ContentSubType.CODE_BLOCK:
        return ContentCode(parsed_html)
      elif sub_type == ContentSubType.TABLE:
        return ContentTable(parsed_html)
      else: 
        return ContentOther(parsed_html)

class ContentType:
  DOCUMENT='document'
  SECTION='section'
  CONTENT='content'

  _REGEX_HEADER = re.compile(r'^h(\d)')

  def get_type(parsed_html):
    result = ContentType.CONTENT
    if type(parsed_html) == bs4.element.Tag:
      if  ContentType._REGEX_HEADER.search(parsed_html.name) != None:
        result = ContentType.SECTION
    return result

  def get_section_level(parsed_html):
    level = None
    if type(parsed_html) == bs4.element.Tag:
      header = ContentType._REGEX_HEADER.search(parsed_html.name)
      if header != None:
        level = int(header.group(1))
    return level

class ContentSubType:
  TABLE='table'
  CODE_BLOCK = 'code block'
  ORDERED_LIST = 'ordered list'
  UNORDERED_LIST='unordered list'
  PARAGRAPH='paragraph' 
  TABLE_EMPTY_LINE='table empty line'
  TABLE_HEADER_LINE='table header line'
  TABLE_LINE='table line'
  TABLE_HEADER_CELL='table header cell'
  TABLE_CELL='table cell'

  def get_sub_type(parsed_html):
    if type(parsed_html) == bs4.element.Tag:
      if parsed_html.name == 'table':
        return ContentSubType.TABLE
      elif parsed_html.name == 'pre':
        return ContentSubType.CODE_BLOCK
      elif parsed_html.name == 'ol':
        return ContentSubType.ORDERED_LIST
      elif parsed_html.name == 'ul':
        return ContentSubType.UNORDERED_LIST
      elif parsed_html.name == 'p':
        return ContentSubType.PARAGRAPH
      elif parsed_html.name == 'tr':
        if parsed_html.find('th') != None:
          return ContentSubType.TABLE_HEADER_LINE
        else:
          return ContentSubType.TABLE_LINE
      elif parsed_html.name == 'th':
        return ContentSubType.TABLE_HEADER_CELL
      elif parsed_html.name == 'td':
        return ContentSubType.TABLE_CELL
      else:
        return None
    else:
      return None

class Anchor(Dictable):

  TYPE_ID='id'
  TYPE_ANCHOR='anchor'

  def __init__(self, type, value):
    self.type = type
    self.value = value

class Content(Dictable):
  def __init__(self, parsed_html):
    self._parsed_html = parsed_html
    self.type = ContentType.get_type(self._parsed_html)
    self.sub_type = ContentSubType.get_sub_type(self._parsed_html)
    self.level = ContentType.get_section_level(self._parsed_html)
    self.__init__id()
    self.__init__anchors()
    self.contents = []
    self._parent = None

  def __init__id(self):
    self.id = self._parsed_html.get('id')    

  def __init__anchors(self):
    self.anchors = []
    if self._parsed_html.get('id') != None:
      self.anchors.append(Anchor(Anchor.TYPE_ID, self._parsed_html.get('id')))    
    anchor = self._parsed_html.find('a')
    if anchor != None:
        if anchor.get('name') != None:
          self.anchors.append(Anchor(Anchor.TYPE_ANCHOR, anchor.get('name')))

  def get_html(self):
    #return self._parsed_html.prettify()
    return str(self._parsed_html)

  def get_inner_html(self):
    inner_html = ''
    for content in self._parsed_html.contents:
      if(type(content) == bs4.element.Tag):
        inner_html += str(content)
      else:
        inner_html += content
    return inner_html 

  def get_text(self):
    return self._parsed_html.get_text()

  def is_tag(self):
    return type(self._parsed_html) == bs4.element.Tag

  def set_parent(self, parent):
    self._parent = parent

  def add_content(self, content):
    self.contents.append(content)
    content.set_parent(self)

  def get_contents(self):
    return self.contents
  
  def get_parsed_html(self):
    return self._parsed_html
  
  def find_section_for_text(self, regex):
    result = None
    if self.type == ContentType.SECTION and regex.search(self.get_text()) != None:
      result = self
    else:
      for content in self.get_contents():
        result = content.find_section_for_text(regex)
        if result != None:
          break
    return result

  def find_content_for_text(self, regex):
    result = None
    if self.type == ContentType.CONTENT and regex.search(self.get_text()) != None:
      result = self
    else:
      for content in self.get_contents():
        result = content.find_content_for_text(regex)
        if result != None:
          break
    return result

  def get_only_content_as_html(self):
    html = ''
    for content in self.get_contents():
      if content.type == ContentType.CONTENT:
        html += content.get_html()
    if len(html) > 0:
      return html
    else:
      return None 

class ContentSection(Content):
  def __init__(self, parsed_html):
    super().__init__(parsed_html)
    self.value = self.get_html()

class ContentOther(Content):
   def __init__(self, parsed_html):
    super().__init__(parsed_html)
    if self.is_tag():
      self.value = self.get_html()
    else:
      self.value = self.get_text()

class ContentCode(Content):
  def __init__(self, parsed_html):
    super().__init__(parsed_html)
    self.__init__value()
    self.__init__language()

  def __init__value(self):
    code_block = self._parsed_html.find_all('code')[0];
    self.value = code_block.get_text()
  
  def __init__language(self):
    regex_language = re.compile(r'language-(.*)')
    code_block_with_class = self._parsed_html.find_all(class_=regex_language)
    if len(code_block_with_class) > 0:
      class_language = regex_language.search(code_block_with_class[0]['class'][0])
      self.language = class_language.group(1)
    else:
      self.language = None

class ContentTableLine(Content):
  def __init__(self, parsed_html):
    super().__init__(parsed_html)
    self.__init__cells()

  def __init__cells(self):
    if self.sub_type == ContentSubType.TABLE_HEADER_LINE:
      cells = self._parsed_html.find_all('th')
    else:
      cells = self._parsed_html.find_all('td')
    for cell in cells:
      self.add_content(ContentOther(cell))
  
  def get_cell_index_by_text(self, regex):
    result = -1
    index = -1
    for cell in self.contents:
      index+=1
      if regex.search(cell.get_text()) != None:
        result = index
        break
    return result
  
  def get_cell_by_index(self, index):
    return self.contents[index]
    
  def get_cell_by_header_text(self, regex):
    result = None
    header_line = self._parent.get_header_line()
    header_index = header_line.get_cell_index_by_text(regex)
    if header_index > -1:
      result = self.get_cell_by_index(header_index)
    return result

class ContentTable(Content):
  def __init__(self, parsed_html):
    super().__init__(parsed_html)
    self.__init__all_lines()
    self.value = self.get_html()

  def get_header_line(self):
    result = None
    for content in self.contents:
      if content.sub_type == ContentSubType.TABLE_HEADER_LINE:
        result = content
        break
    return result

  def get_lines(self):
    result = []
    for content in self.contents:
      if content.sub_type == ContentSubType.TABLE_LINE:
        result.append(content)
    return result
  
  def __init__all_lines(self):
    lines_html = self._parsed_html.find_all('tr')
    for line_html in lines_html:
      self.add_content(ContentTableLine(line_html))

class Document(Content):
  def __init__(self, parsed_html):
    super().__init__(parsed_html)
    self.level = 0
    self.type = ContentType.DOCUMENT
    self.__init__title()
    self.__init__contents()
    self.value = None

  def __init__title(self):
    header_title = self._parsed_html.find('h1')
    self.title = header_title.get_text()
  
  def __init__contents(self):
    parent_section = self
    for child in self._parsed_html:
      if(child.name != None): # empty line
        content = ContentFactory.create_content(child)
        parent_section = ContentFactory.get_parent_section(content, parent_section)
        parent_section.add_content(content)
        if content.type == ContentType.SECTION:
          parent_section = content

class Parser(Dictable):
  def __init__(self, filename_or_url, md=None):
    self.source = filename_or_url
    if md == None:
      html = UtilsFile.load_markdown_as_html(filename_or_url)
    else:
      html = UtilsFile.convert_markdown_to_html(md)
    parsed_html = BeautifulSoup(html, 'html.parser')
    self.document = Document(parsed_html)
  
  def get_document(self):
    return self.document