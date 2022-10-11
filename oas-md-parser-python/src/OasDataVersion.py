import re
from OasData import Data

class DataVersion(Data):

  MAJOR='major'
  MINOR='minor'
  REVISION='revision'

  def __init__(self, source, specification):
    super().__init__(source, specification)
    self.__init__version()
    self.__init__name()

  def __init__version(self):
    title_regex = re.compile(r'Version (.*)')
    version_header_parsed_html = self.get_source().get_parsed_html().find('h4')
    version_header = title_regex.search(version_header_parsed_html.get_text())
    self.version = version_header.group(1)

  def __init__name(self):
    if self.is_version('2'):
      self.name = 'Swagger'
    else:
      self.name = 'OpenAPI'

  def is_version(self, version):
    return self.version.startswith(version)

  def get_version(self, type=None):
    if type == DataVersion.MAJOR:
      numbers = self.version.split('.')
      return numbers[0]
    elif type == DataVersion.MINOR:
      numbers = self.version.split('.')
      return str(numbers[0])+'.'+str(numbers[1])
    else: # None or REVISION
      return self.version