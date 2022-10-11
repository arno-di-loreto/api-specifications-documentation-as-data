from OasData import Data
from OasDataVersion import DataVersion
from OasDataConcepts import DataConcepts
from OasDataHistory import DataHistory
from OasDataSchema import DataSchemas
from OasDataUrl import DataWithUrls
import re

class DataSpecification(Data, DataWithUrls):
  def __init__(self, source):
    super().__init__(source, None)
    self.__init__version()
    DataWithUrls.__init__(self)
    self.__init__description()
    self.__init__history()
    self.__init__concepts()
    self.__init__schemas()

  def __init__version(self):
    self._version = DataVersion(self.get_source(), self)
    self.name = self._version.name
    self.version = self._version.version

  def __init__description(self):
    introduction_section = self.get_source().find_section_for_text(re.compile(r'^Introduction'))
    self.description = introduction_section.get_only_content_as_html()

  def __init__concepts(self):
    self._concepts = DataConcepts(self.get_source(), self)
    self.concepts = self._concepts.concepts
  
  def __init__history(self):
    self._history = DataHistory(self.get_source(), self)
    self.history = self._history.events

  def __init__schemas(self):
    self._schemas = DataSchemas(self.get_source(), self)
    self.schemas = self._schemas.schemas