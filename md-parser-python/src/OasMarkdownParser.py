
from MarkdownParser import Parser
from OasDataSpecification import DataSpecification

class OasMarkdownParser(Parser):
  def __init__(self, filename_or_url, md=None):
    super().__init__(filename_or_url, md)
    self.specification = DataSpecification(self.get_document())
  
  def get_specification(self):
    return self.specification