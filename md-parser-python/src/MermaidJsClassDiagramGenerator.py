from HtmlColors import HtmlColors
import re  

def get_schema_name(schema_name):
  result = schema_name.replace(' Object', '')
  result = re.sub(r"\s+", '', result)
  return result

def get_field_name(field_name):
  return field_name.replace('{','').replace('}','')
  
def get_field_type(field):
  result = None
  for typ in field.type.types:
    if typ != 'Reference Object':
      result = get_schema_name(typ)
  return result

def is_field_ref(field):
  result = False
  for typ in field.type.types:
    if typ == 'Reference Object':
      result = True
  return result

class MermaidJsClassDiagramGenerator:
  def __init__(self, specification):
    self.specification = specification
    #self.__set_colors__()
  
  def get_diagram(self, ref_relations = False):
    diagram = 'classDiagram\n'
    diagram += self.__gen_classes__(ref_relations)
    return diagram

  def __gen_field__(self, field):
    diagram_field = '    '
    if field.is_required:
      diagram_field += '+'
    if field.type.parent_type != None:
      diagram_field += field.type.parent_type
      diagram_field += '~' + get_field_type(field)
      if is_field_ref(field):
        diagram_field += '🔗'
      diagram_field += '~'
    else:
      diagram_field += get_field_type(field)
      if is_field_ref(field):
        diagram_field += '🔗'
    diagram_field += ' '  
    diagram_field += get_field_name(field.name)
    diagram_field +='\n'
    return diagram_field 

  def __gen_relations__(self, schema, ref_relations):
    relations = ''
    for field in schema.fields:
      for typ in field.type.types:
        if 'Object' in typ:
          if typ != 'Reference Object':
            source_schema = get_schema_name(schema.name)
            source_field = get_field_name(field.name)
            target_schema = get_schema_name(typ)
            relations += '  ' + source_schema + ' *-- ' + target_schema + ' : ' + source_schema + '.' + source_field +'\n'
    return relations

  def __gen_class__(self, schema, ref_relations):
    class_name = get_schema_name(schema.name)
    class_name += ':::' + get_schema_name(schema.name)
    diagram_class = '  class ' + class_name +' {\n'
    for field in schema.fields:
      diagram_class += self.__gen_field__(field)
    diagram_class += '  }\n'
    diagram_class += self.__gen_relations__(schema, ref_relations)
    return diagram_class

  def __gen_classes__(self, ref_relations):
    diagram_classes = ''
    for schema in self.specification.schemas:
      diagram_classes += self.__gen_class__(schema, ref_relations) + '\n'
    return diagram_classes

#  def __set_colors__(self):
#    htmlColors = HtmlColors()
#    self.classColors = {}
#    for schema in self.specification.schemas:
#      self.classColors[get_schema_name(schema.name)] = htmlColors.get_color()
  
#  def get_class_color(self, name):
#    return self.classColors[name]