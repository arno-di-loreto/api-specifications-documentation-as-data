#!/usr/bin/python

import sys
from OasMarkdownParser import OasMarkdownParser
import UtilsFile
from PlantUmlGenerator import PlantUmlGenerator

md_file = sys.argv[1]
if len(sys.argv) == 3:
  output_file = sys.argv[2]
else:
  output_file = None

oas_md_parser = OasMarkdownParser(md_file)
specification = oas_md_parser.get_specification()
json = specification.to_json()
if output_file == None:
  print(json)
else:
  if output_file.endswith('.json'):
    UtilsFile.save_file(json, output_file)
  elif output_file.endswith('.puml'):
    puml = PlantUmlGenerator(specification)
    #print(puml.get_plantuml())
    UtilsFile.save_file(puml.get_plantuml(), output_file)