import re
import UtilsJson

def to_dict_recursive_old(value, excludes):
  if isinstance(value, list):
    result = []
    for v in value:
      result.append(to_dict_recursive(v, excludes))
    return result
  elif isinstance(value, Dictable):
    result = {}
    source = value.__dict__
    keys = source.keys()
    for key in keys:
      if excludes.search(key) == None:
        result[key] = to_dict_recursive(source[key], excludes)
    return result
  else:
    return value

def to_camel_case(snake_str):
  words = snake_str.split('_')
  result = words[0] + ''.join(word.title() for word in words[1:])
  return result 

def to_dict_recursive(value, excludes, camel_case=False):
  if isinstance(value, list):
    result = []
    for v in value:
      result.append(to_dict_recursive(v, excludes, camel_case))
    return result
  elif isinstance(value, Dictable):
    result = {}
    source = value.__dict__
    keys = source.keys()
    for key in keys:
      if excludes.search(key) == None:
        target_key = key
        if camel_case:
          target_key = to_camel_case(key)
        result[target_key] = to_dict_recursive(source[key], excludes, camel_case)
    return result
  else:
    return value


class Dictable(object):

  _PRIVATE_PROPERTY_REGEX = re.compile(r'^_')

  def to_dict(self, camel_case=False):
    return to_dict_recursive(self, Dictable._PRIVATE_PROPERTY_REGEX, camel_case)
  
  def to_json(self):
    d = self.to_dict(camel_case=True)
    json = UtilsJson.dict_to_json(d)
    return json