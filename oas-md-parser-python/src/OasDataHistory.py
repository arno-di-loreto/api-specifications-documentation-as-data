from OasData import Data
import re
from MarkdownParser import ContentSubType

class DataEvent(Data):
  def __init__(self, source, data_history):
    super().__init__(source, data_history)
    self.version = self.get_source().get_cell_by_header_text(re.compile('Version')).get_text()
    self.date = self.get_source().get_cell_by_header_text(re.compile('Date')).get_text()
    self.notes = self.get_source().get_cell_by_header_text(re.compile('Notes')).get_text()
    self.__init__type()

  def __init__type(self):
    if 'patch' in self.notes.lower():
      self.type = 'patch'
    elif 'release' in self.notes.lower():
      self.type = 'release'
    elif 'rc' in self.version.lower():
      self.type = 'draft'
    else:
      self.type = 'event' 

class DataHistory(Data):
  def __init__(self, source, specification):
    super().__init__(source, specification)
    self.__init__events()
  
  def __init__events(self):
    self.events = []
    history_section = self.get_source().find_section_for_text(re.compile(r'Revision History$'))
    for content in history_section.get_contents():
      if content.sub_type == ContentSubType.TABLE:
        for line in content.get_lines():
          self.events.append(DataEvent(line, self))