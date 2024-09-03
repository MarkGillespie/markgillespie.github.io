#!/usr/bin/python3

import datetime, json
import xml.etree.ElementTree as ET

# read list of models and ui element templates from 'models.xml'
data = ET.parse('models.xml').getroot()
models = data.find('models')
templates = data.find('ui_element_templates')

# get contents of xml element as a text string
# https://stackoverflow.com/a/380717
def xml_child_string(xml_element):
	if xml_element is None:
		return "ELEMENT IS NONE"
	elem_text = [ xml_element.text ] if xml_element.text else []
	child_text = [ ET.tostring(e, encoding='unicode', method='xml') for e in xml_element ]
	return "".join( elem_text + child_text  )

# read index page template
with open('index_template.html') as f:
    index_template = f.read()

# read model page template
with open('model_template.html') as f:
    model_template = f.read()

title_str = "Mark's Origami Models"
date_str = datetime.datetime.now().strftime("%B %Y")

# Process SVG to inject correct CSS classes to set model colors
# you need to save the SVG from illustrator by running "Export > SVG"
# and picking "Presentation Attributes" as the styling option.
# also you need to get rid of the width="..." and height="..." in the svg header
def css_ify_svg(svg_text):
	lines = svg_text.splitlines()
	valid_lines = [line for line in lines if len(line) >= 4 and line[0:4] != "<?xm" and line[0:4] != "<!--" and line[0:4] != "<!DO"]
	return ("\n".join(valid_lines)).replace('fill="#9F509F"', 'class="svg_main_color"').replace('fill="#9f509f"', 'class="svg_main_color"')

# build carousel
carousel_str = ""
carousel_template_str = xml_child_string(templates.find('model_carousel_entry'))
for model in models:
	with open(model.find('svg').text) as f:
		model_svg_str = css_ify_svg(f.read())
	model_url_str  = model.find('page').text
	model_name_str = model.find('name').text
	model_year_str = model.find('year').text

	carousel_str += (carousel_template_str
		                .replace('$PAGE', model_url_str)
	                    .replace('$SVG',  model_svg_str)
	                    .replace('$NAME', model_name_str)
	                    .replace('$YEAR', model_year_str))

# write index
with open('generated/index.html', 'w') as f:
	index_text = (index_template.replace('$TITLE', title_str)
	                            .replace('$DATE', date_str)
	                            .replace('$MODEL_CAROUSEL', carousel_str))
	f.write(index_text)

# write model pages
details_template_str = xml_child_string(templates.find('model_page_details'))
for model in models:
	img_str  = model.find('img').text
	crease_pattern_tag = model.find('crease_pattern')
	crease_pattern_str = '' if crease_pattern_tag is None else crease_pattern_tag.text

	description_str = xml_child_string(model.find('description'))
	diagram_url_str = model.find('diagram').text

	details_str = (details_template_str
		               .replace('$DESCRIPTION', description_str)
		               .replace('$IMAGE', img_str)
		               .replace('$DIAGRAM_URL', diagram_url_str)
		               .replace('$CREASE_PATTERN_URL', crease_pattern_str))

	filename = model.find('page').text
	name_str = model.find('name').text

	# in order to only show the crease pattern for models which have one,
	# we set this css class on the parent which will hide all crease pattern
	# related content if the class is set to .has_no_crease_pattern
	crease_pattern_switch = "has_no_crease_pattern" if crease_pattern_tag is None else "has_crease_pattern"

	with open(f'generated/{filename}', 'w') as f:
		file_text = (model_template.replace('$TITLE', title_str)
		                           .replace('$MODEL_NAME', name_str)
		                           .replace('$DATE', date_str)
		                           .replace('$MODEL_CAROUSEL', carousel_str)
		                           .replace('$MODEL_DETAILS', details_str)
		                           .replace('$HAS_CREASE_PATTERN', crease_pattern_switch))
		f.write(file_text)
