from UtilsClass import Dictable
from MarkdownParser import Anchor

class DataReference(Dictable):
  TYPE_CONCEPT='concept'
  TYPE_SCHEMA='schema'
  TYPE_FIELD='field'

  def __init__(self, type, id):
    self.type = type
    self.id = id

class DataId(Dictable):
  MAIN='main'
  SECONDARY='secondary'

  def __init__(self, anchor):
    self.value = anchor.value
    if anchor.type == Anchor.TYPE_ID: # Anchor.TYPE_ANCHOR is not working on MD files for objects or concepts
      self.type = DataId.MAIN
    else:
      self.type = DataId.SECONDARY
    self.references = []

class Data(Dictable):
  def __init__(self, source, data_parent):
    self._source = source
    self._data_parent = data_parent
    self.__init__ids()
  
  def __init__ids(self):
    if len(self.get_source().anchors) > 0:
      self.ids = []
      for anchor in self.get_source().anchors:
        self.ids.append(DataId(anchor))

  def get_id(self, type=None):
    # None => MAIN then SECONDARY
    result = None
    if type == None:
      result = self.get_id(DataId.MAIN)
      if result == None:
        result = self.get_id(DataId.SECONDARY)
    else:
      for id in self.ids:
        if id.type == type:
          result = id.value
    return result

  def get_data_parent(self):
    return self._data_parent

  def get_data_root(self):
    if self._data_parent == None:
      result = self
    else:
      result = self._data_parent.get_data_root()
    return result

  def get_source(self):
    return self._source
  
  def add_reference(self, type, id):
    self.references.append(DataReference(type, id))