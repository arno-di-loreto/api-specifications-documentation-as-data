#!/usr/bin/python

import sys
from OasMarkdownParser import OasMarkdownParser
import UtilsFile
from PlantUmlGenerator import PlantUmlGenerator
from MermaidJsClassDiagramGenerator import MermaidJsClassDiagramGenerator

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
    UtilsFile.save_file(puml.get_plantuml(), output_file)
  elif output_file.endswith('.mmd'):
    mermaidjs = MermaidJsClassDiagramGenerator(specification)
    UtilsFile.save_file(mermaidjs.get_diagram(), output_file)