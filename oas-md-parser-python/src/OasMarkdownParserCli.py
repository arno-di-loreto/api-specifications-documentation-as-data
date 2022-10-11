#!/usr/bin/python

import sys
from OasMarkdownParser import OasMarkdownParser
import UtilsFile

md_file = sys.argv[1]
if len(sys.argv) == 3:
  json_file = sys.argv[2]
else:
  json_file = None

oas_md_parser = OasMarkdownParser(md_file)
specification = oas_md_parser.get_specification()
json = specification.to_json()
if json_file == None:
  print(json)
else:
  UtilsFile.save_file(json, json_file)