import json 
import re

class HistoryEvent:
  def __init__(self, version, date, notes):
    self.version = str(version)
    self.date = str(date)
    self.notes = str(notes)
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
  
  def to_dict(self):
    return {
      'date': self.date,
      'type': self.type,
      'version': self.version,
      'notes': self.notes
    }

class History:
  def __init__(self, document_tree):
    self.document_tree = document_tree
    self.__init__events()
  
  def __init__events(self):
    self.events = []
    history_node = self.document_tree.get_node(re.compile(r'Revision History$'), 'header', 2)
    for child in history_node.children:
      if child.sub_type == 'table':
        for line in child.table.lines:
          self.events.append(
            HistoryEvent(
              line.get_value_by_header(['Version']).text,
              line.get_value_by_header(['Date']).text,
              line.get_value_by_header(['Notes']).text
            )
          )

  def to_dict(self):
    dict_events = []
    for event in self.events:
      dict_events.append(event.to_dict())
    return dict_events