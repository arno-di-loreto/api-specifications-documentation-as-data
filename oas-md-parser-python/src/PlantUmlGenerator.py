from HtmlColors import HtmlColors 

def get_schema_name(schema_name):
  return schema_name.replace(' Object', '')

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

class PlantUmlGenerator:
  def __init__(self, specification):
    self.specification = specification
    self.__set_colors__()
  
  def get_plantuml(self, ref_relations = False):
    puml = '@startuml\n'
    puml += 'note "Back to the [[/oas-data-viewer-web-component OpenAPI Map v2 Alpha]]" as TITLE\n'
    puml += self.__gen_classes__(ref_relations)
    puml += '@enduml\n'
    return puml
    

  def __gen_field__(self, field):
    puml_field = '  '
    if field.is_required:
      puml_field += '-'  
    puml_field += get_field_name(field.name)+' : '
    if field.type.parent_type != None:
      puml_field += field.type.parent_type + ' of '
    puml_field += get_field_type(field)
    if is_field_ref(field):
      puml_field += ' or $ref'
    puml_field +='\n'
    return puml_field 

  def __gen_relations__(self, schema, ref_relations):
    relations = ''
    for field in schema.fields:
      for typ in field.type.types:
        if 'Object' in typ:
          if typ != 'Reference Object':
            target_schema = get_schema_name(typ)
            relations += '\"'+ get_schema_name(schema.name) + '::' + get_field_name(field.name) + '\"*-->\"' + target_schema + '\" #'+self.get_class_color(target_schema) +'\n'
    return relations

  def __gen_class__(self, schema, ref_relations):
    class_name = get_schema_name(schema.name)
    puml_class = 'class \"' + class_name + '\" #line:' +self.get_class_color(class_name) + ';line.bold {\n'
    for field in schema.fields:
      puml_class += self.__gen_field__(field)
    puml_class += '}\n'
    puml_class += self.__gen_relations__(schema, ref_relations)
    return puml_class

  def __gen_classes__(self, ref_relations):
    puml_classes = ''
    for schema in self.specification.schemas:
      puml_classes += self.__gen_class__(schema, ref_relations) + '\n'
    return puml_classes

  def __set_colors__(self):
    htmlColors = HtmlColors()
    self.classColors = {}
    for schema in self.specification.schemas:
      self.classColors[get_schema_name(schema.name)] = htmlColors.get_color()
  
  def get_class_color(self, name):
    return self.classColors[name]