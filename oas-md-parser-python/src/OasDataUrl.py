from OasData import Data
from OasDataVersion import DataVersion
from MarkdownParser import ContentType
from UtilsClass import Dictable
import re

class SpecificationUrls:
  _urls = {
    'markdown': 'https://github.com/OAI/OpenAPI-Specification/tree/main/versions/{version.revision}.md',
    'schema': 'https://github.com/OAI/OpenAPI-Specification/tree/main/schemas/v{version.minor}'
  }

  MARKDOWN='markdown'
  SCHEMA='schema'

  _url_version_regex_search = r'.*{version.(?P<version>[a-z]*)}'
  _url_version_regex_replace = r'{version.[a-z]*}'

  def get_specification_urls(version):
    result = []
    for key in SpecificationUrls._urls.keys():
      result.append(SpecificationUrls.get_specification_url(version, key))
    return result

  def get_specification_url(version, name, anchor=None):
    url_template = SpecificationUrls._urls[name]
    version_type_result = re.compile(SpecificationUrls._url_version_regex_search).search(url_template)
    version = version.get_version(version_type_result.group('version'))
    url = re.sub(SpecificationUrls._url_version_regex_replace, version, url_template)
    if anchor != None:
      url+='#'+anchor
    return Url(url, name, Url.DOCUMENTATION)

class Url(Dictable):

  REFERENCE='reference'
  DOCUMENTATION='documentation'

  def __init__(self, url, name, type):
    self.url = url
    self.name = name
    self.type = type

class DataUrls(Data):
  def __init__(self, source, parent):
    super().__init__(source, parent)
    if self.get_source().type == ContentType.DOCUMENT: 
      self.urls = SpecificationUrls.get_specification_urls(self.get_data_root()._version)
      # extract all reference URLs from spec document
    else:
      id = parent.get_id()
      if id != None:
        self.urls = []
        self.urls.append(SpecificationUrls.get_specification_url(self.get_data_root()._version, SpecificationUrls.MARKDOWN, id))
        # extract all reference URLs from data.document


class DataWithUrls(object):
  def __init__(self):
    self.__init__urls()

  def __init__urls(self):
    self._urls = DataUrls(self.get_source(), self)
    self.urls = self._urls.urls
