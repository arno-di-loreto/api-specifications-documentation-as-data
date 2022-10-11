from OasData import Data
from OasDataUrl import DataWithUrls
from MarkdownParser import ContentType
import re

class DataConcept(Data, DataWithUrls):
  def __init__(self, source, data_concepts):
    super().__init__(source, data_concepts)
    self.__init__name()
    DataWithUrls.__init__(self)
    self.__init__description()
  
  def __init__name(self):
    self.name = self._source.get_text()
  
  def __init__description(self):
    self.description = self.get_source().get_only_content_as_html()

class DataConcepts(Data):
  def __init__(self, source, specification):
    super().__init__(source, specification)
    self.__init__concepts()

  def __init__concepts(self):
    self.concepts = []
    # Main definitions
    definitions_section = self._source.find_section_for_text(re.compile('^Definitions$'))
    for content in definitions_section.get_contents():
      self.__add_concept(content)
    # Specification concepts
    specification_section = self._source.find_section_for_text(re.compile('^Specification$'))
    for content in specification_section.get_contents():
      if content.type == ContentType.SECTION and content.get_text() != 'Schema':
        self.__add_concept(content)

  def __add_concept(self, source):
    self.concepts.append(DataConcept(source, self))