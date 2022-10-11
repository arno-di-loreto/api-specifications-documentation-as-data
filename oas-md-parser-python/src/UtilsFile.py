import requests
import re
import markdown

def load_file(filename):
  file = open(filename)
  content = file.read();
  return content

def load_url(url):
  #try:
  response = requests.get(url)
  return response.text
  #except:
  #    print("Invalid URL or some error occured while making the GET request to the specified URL")

def load(filename_or_url):
  if re.search('^https?://', filename_or_url) != None:
    return load_url(filename_or_url)
  else:
    return load_file(filename_or_url)

def convert_markdown_to_html(markdown_content):
  md = markdown.Markdown(extensions=['tables',  'fenced_code', 'toc'])
  html = md.convert(markdown_content)
  return html

def load_markdown_as_html(filename_or_url):
  md = load(filename_or_url)
  html = convert_markdown_to_html(md)
  return html

def load_as_html(markdown_or_html_filename_or_url):
    content = load(markdown_or_html_filename_or_url)
    if re.search('^\s*<'): # Quite poor detection 😅
      html = content
    else:
      html = convert_markdown_to_html(content)
    return html

def save_file(content, filename):
  f = open(filename,'w')
  f.write(content)
  f.close()
