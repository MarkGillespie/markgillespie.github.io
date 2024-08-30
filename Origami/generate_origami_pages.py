import datetime, json
import xml.etree.ElementTree as ET

# with open('models.json') as f:
	# models = json.loads(f.read())["models"]

models = ET.parse('models.xml').getroot()

# https://stackoverflow.com/a/380717
def xml_child_string(xml_element):
	elem_text = [ xml_element.text ] if xml_element.text else []
	child_text = [ ET.tostring(e, encoding='unicode', method='xml') for e in xml_element ]
	return "".join( elem_text + child_text  )

# # print(models)
# for model in models:
# 	# print( model.find('description').tostring() )
# 	print( xml_child_string(model.find('description')) )

with open('index_template.html') as f:
    index_template = f.read()

with open('model_template.html') as f:
    model_template = f.read()

title_str = "Origami Models"
date_str = datetime.datetime.now().strftime("%B %Y")

# you need to save the SVG from illustrator by running "Export > SVG"
# and picking "Presentation Attributes" as the styling option.
# also you need to get rid of the width="..." and height="..." in the svg header
def css_ify_svg(svg_text):
	lines = svg_text.splitlines()
	valid_lines = [line for line in lines if len(line) >= 4 and line[0:4] != "<?xm" and line[0:4] != "<!--" and line[0:4] != "<!DO"]
	return ("\n".join(valid_lines)).replace('fill="#9F509F"', 'class="svg_main_color"').replace('fill="#9f509f"', 'class="svg_main_color"')

# build carousel
carousel_str = ""
for model in models:
	with open(model.find("svg").text) as f:
		model_svg_str = css_ify_svg(f.read())
	carousel_str += f'<a href="{model.find("page").text}" class="div_link">\n'
	carousel_str += f'    <div class="model_display">\n'
	# carousel_str += f'        <img src="{model["svg"]}">\n'
	carousel_str += model_svg_str
	carousel_str += f'        <div class="model_name">{model.find("name").text} <span class="model_year">({model.find("year").text})</span></div>\n'
	carousel_str += f'    </div>\n'
	carousel_str += f'    </a>\n'

# write index
with open('generated/index.html', 'w') as f:
	index_text = (index_template.replace("$TITLE", title_str)
	                            .replace("$DATE", date_str)
	                            .replace("$MODEL_CAROUSEL", carousel_str))
	f.write(index_text)

# write model pages
for model in models:
	filename = model.find("page").text
	name_str = model.find("name").text
	crease_pattern_tag = model.find("crease_pattern")
	print(crease_pattern_tag)

	details_str = ""
	details_str += f'<img src="{model.find("img").text}" class="header_image"/>\n'
	if crease_pattern_tag is not None:
		details_str += f'<img src="{crease_pattern_tag.text}" class="crease_pattern"/>\n'
	details_str += f'{xml_child_string(model.find("description"))}\n'
	details_str += f'<p>Diagrams are available <a href="{model.find("diagram").text}">here</a>.'
	if crease_pattern_tag is not None:
		details_str += f' The crease pattern is available <a href="{crease_pattern_tag.text}">here</a></p>\n'
	else:
		details_str += f'</p>\n'

	with open(f'generated/{filename}', 'w') as f:
		file_text = (model_template.replace("$TITLE", title_str)
		                           .replace("$MODEL_NAME", name_str)
		                           .replace("$DATE", date_str)
		                           .replace("$MODEL_CAROUSEL", carousel_str)
		                           .replace("$MODEL_DETAILS", details_str))
		f.write(file_text)
