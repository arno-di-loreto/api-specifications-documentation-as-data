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
    version_header_parsed_html = self.get_source().get_parsed_html().find_all('h4')
    for header in version_header_parsed_html:
      version_header = title_regex.search(header.get_text())
      if(version_header != None):
        self.version = version_header.group(1)
        break

  def __init__name(self):
    title = self.get_source().get_parsed_html().find('h1')
    title_regex = re.compile(r'(.*)\s*Specification')
    self.name = title_regex.search(title.get_text()).group(1).strip()
    if self.name == 'OpenAPI' and self.is_version('2'):
      self.name = 'Swagger'

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