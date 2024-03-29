from OasData import Data, DataId
from OasDataVersion import DataVersion
from MarkdownParser import ContentType
from UtilsClass import Dictable
import re


class SpecificationUrls:
  _openapi_urls = {
    'markdown': 'https://github.com/OAI/OpenAPI-Specification/tree/main/versions/{version.revision}.md',
    'html': 'https://spec.openapis.org/oas/v{version.revision}',
    'schema': 'https://github.com/OAI/OpenAPI-Specification/tree/main/schemas/v{version.minor}'
  }

  _asyncapi_urls = {
    'markdown': 'https://github.com/asyncapi/website/blob/master/pages/docs/reference/specification/v{version.revision}.md',
    'html': 'https://www.asyncapi.com/docs/reference/specification/v{version.revision}',
    'schema': 'https://github.com/asyncapi/spec-json-schemas/blob/master/schemas/{version.revision}.json'
  }

  MARKDOWN='markdown'
  HTML='html'
  SCHEMA='schema'

  _url_version_regex_search = r'.*{version.(?P<version>[a-z]*)}'
  _url_version_regex_replace = r'{version.[a-z]*}'

  def get_specification_urls_templates(specification):
      result = None
      if specification == 'OpenAPI':
        result = SpecificationUrls._openapi_urls
      elif specification == 'AsyncAPI':
        result = SpecificationUrls._asyncapi_urls
      return result

  def get_specification_urls(specification, version):
    result = []
    templates = SpecificationUrls.get_specification_urls_templates(specification)
    for key in templates.keys():
      result.append(SpecificationUrls.get_specification_url(specification, version, key))
    return result

  def get_specification_url(specification, version, name, anchor=None):
    url_template = SpecificationUrls.get_specification_urls_templates(specification)[name]
    version_type_result = re.compile(SpecificationUrls._url_version_regex_search).search(url_template)
    version = version.get_version(version_type_result.group('version'))
    url = re.sub(SpecificationUrls._url_version_regex_replace, version, url_template)
    if anchor != None:
      url+='#'+anchor
    return Url(url, name, Url.DOCUMENTATION)

class Url(Dictable):
  EXTERNAL_REFERENCE='external reference'
  INTERNAL_REFERENCE='internal reference'
  DOCUMENTATION='documentation'

  def __init__(self, url, name, type):
    self.url = url
    self.name = name
    self.type = type

class DataUrls(Data):
  def __init__(self, source, parent):
    super().__init__(source, parent)
    self.__init_specification_name()
    self.__init_specification_urls()
    self.__init__other_urls()

  def __init_specification_name(self):
    title = self.get_data_root().get_source().get_parsed_html().find('h1')
    title_regex = re.compile(r'(.*)\s*Specification')
    self._specification_name = title_regex.search(title.get_text()).group(1).strip()

  def __init_specification_urls(self):
    if self.get_source().type == ContentType.DOCUMENT: 
      self.urls = SpecificationUrls.get_specification_urls(self._specification_name, self.get_data_root()._version)
    else:
      self.urls = []
      if(self._specification_name == 'AsyncAPI'):
        html_id = self.get_data_parent().get_id(DataId.SECONDARY)
        markdown_id = self.get_data_parent().get_id()
      else:
        markdown_id = self.get_data_parent().get_id()
        html_id = markdown_id
      if html_id != None:
        self.urls.append(SpecificationUrls.get_specification_url(self._specification_name, self.get_data_root()._version, SpecificationUrls.MARKDOWN, markdown_id))
        self.urls.append(SpecificationUrls.get_specification_url(self._specification_name, self.get_data_root()._version, SpecificationUrls.HTML, html_id))

  def __get_all_links(self):
    if self.get_source().type == ContentType.DOCUMENT:
      return self.get_source().get_parsed_html().find_all('a')
    else:
      links = []
      for content in self.get_data_parent().get_source().get_contents():
        links += content.get_parsed_html().find_all('a')
      return links

  def __init__other_urls(self):
    links = self.__get_all_links()
    for link in links:
      if 'href' in link.attrs.keys():
        url = link['href']
        if not url.startswith('#'):
          name = link.get_text()
          self.add_url(Url(url, name, Url.EXTERNAL_REFERENCE))
        elif self.get_source().type != ContentType.DOCUMENT:
          name = link.get_text()
          self.add_url(Url(url, name, Url.INTERNAL_REFERENCE))
  
  def get_urls(self, type):
    urls = []
    for url in self.urls:
      if url.type == type:
        urls.append(url)
    return urls 

  def add_url(self, data_url):
    # TODO add target data retrieval (page title, section title)
    found = False
    for url in self.urls:
      found = (data_url.name == url.name and
              data_url.type == url.type and
              data_url.url == url.url)
      if found == True:
        break
    if not found:
      self.urls.append(data_url)

class DataWithUrls(object):
  def __init__(self):
    self.__init__urls()

  def __init__urls(self):
    self._urls = DataUrls(self.get_source(), self)
    self.urls = self._urls.urls
