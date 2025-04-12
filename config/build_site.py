#!/usr/bin/python

import datetime, json, os
import xml.etree.ElementTree as ET

news_data = ET.parse('news.xml').getroot()
misc_data = ET.parse('misc.xml').getroot()
navb_data = ET.parse('navbar.xml').getroot()
talk_data = ET.parse('talks.xml').getroot()
proj_data = ET.parse('research_projects.xml').getroot()

# get contents of xml element as a text string
# https://stackoverflow.com/a/380717
def xml_child_string(xml_element):
	if xml_element is None:
		return ''
	elem_text = [ xml_element.text ] if xml_element.text else []
	child_text = [ ET.tostring(e, encoding='unicode', method='xml') for e in xml_element ]
	return "".join( elem_text + child_text  )

# read index page template
with open('index_template.html') as f:
    index_template = f.read()

# == $DATE
date_str = datetime.datetime.now().strftime("%B %Y")

# == $YEAR
year_str = datetime.datetime.now().strftime("%Y")

# == $EMAIL
email_str = "mark.gillespie@inria.fr"

# == BACKGROUND_SVG
with open('torus.svg') as f:
    background_str = f.read()

# == $NEWS
news_str = "<ul>\n"
for item in news_data.find('recent_items'):
	when = xml_child_string(item.find('when'))
	what = xml_child_string(item.find('what'))
	news_str += f'<li><div class="when">{when}</div><div class="what">{what}</div></li>\n'
news_str += "<details>"
for item in news_data.find('extra_items'):
	when = xml_child_string(item.find('when'))
	what = xml_child_string(item.find('what'))
	news_str += f'<li><div class="when">{when}</div><div class="what">{what}</div></li>\n'
news_str += "<summary></summary></details></ul>"

# == $NAVBAR
navbar_str_home = '<div class="navbar"><div class="navbar_buttons">\n'
navbar_str_nest = '<div class="navbar"><div class="navbar_buttons">\n'
for item in navb_data:
	href = item.find('href').text
	href_home = href.replace('$HOME/', '')
	href_nest = href.replace('$HOME/Research/', '').replace('$HOME/', '../')
	title = xml_child_string(item.find('title'))
	classes = item.find('classes').text if item.find('classes') is not None else ''
	navbar_str_home += f'<a href="{href_home}" class="navbar_link {classes}"><span class="navbar_item">{title}</span></a>\n'
	navbar_str_nest += f'<a href="../{href_nest}" class="navbar_link {classes}"><span class="navbar_item">{title}</span></a>\n'
navbar_str_home += '</div></div>'
navbar_str_nest += '</div></div>'

# == $TALKS
talk_str = "<table>\n"
talk_template = xml_child_string(talk_data.find('template'))
for item in talk_data.find('talks'):
	venue_name = xml_child_string(item.find('venue_name'))
	venue_link = item.find('venue_link')
	venue_str = f'<a href="{venue_link.text}">{venue_name}</a>' if venue_link is not None else venue_name
	talk_str += (talk_template.replace('$WHEN',  xml_child_string(item.find('when')))
		                      .replace('$TITLE', xml_child_string(item.find('title')))
		                      .replace('$VENUE_NAME', venue_str)
		                      .replace('$DESCRIPTION', xml_child_string(item.find('description')))
		        )
talk_str += "</table>"

# == $MISC
misc_str = ""
misc_template = xml_child_string(misc_data.find('template'))
for item in misc_data.find('misc'):
	misc_str += (misc_template.replace('$TITLE',  xml_child_string(item.find('title')))
		                      .replace('$HREF', xml_child_string(item.find('href')))
		                      .replace('$DETAILS', xml_child_string(item.find('details')))
		                      .replace('$IMG', xml_child_string(item.find('img')))
		        )


# == $RESEARCH_LIST
short_project_template = xml_child_string(proj_data.find('project_template'))
research_list_str = xml_child_string(proj_data.find('project_list'))
with open('project_template.html') as f:
	project_page_template = f.read()
for file in os.listdir(os.fsencode("ResearchProjects")):
	filename = os.fsdecode(file)
	if filename.endswith('.xml'):
		project_data = ET.parse(f"ResearchProjects/{filename}").getroot()
		#==== entry in main page list
		#= author list
		author_str = "" # short version for main page
		long_author_str = "" # long version for project page
		for author in project_data.find('authors'):
			name_data = xml_child_string(author.find("name"))
			# if name has a single space, replace it with &nbsp; so that names don't break
			if "nbsp;" not in name_data and name_data.count(' ') == 1:
				name_data = name_data.replace(' ', "&nbsp;")
			name = f'<a href="{author.find("href").text}">{name_data}</a>' if author.find('href') is not None else name_data
			affiliation = xml_child_string(author.find("affiliation"))
			author_str += f'{name},\n'
			long_author_str += f'<div class="author"><span class="name">{name}</span><span class="affiliation">{affiliation}</span></div>\n'
		author_str = author_str[:-2] # trim trailing comma and newline
		#= awards
		award_str = ""
		if project_data.find('award') is not None:
			href = project_data.find('award').find('href').text
			name = xml_child_string(project_data.find('award').find('name'))
			award_str = f'<div class="award"><a href="{href}">{name}</a></div>'
		#= bibtex
		bib_path = project_data.find('bibtex').text
		with open(f'../{bib_path}') as f:
			bibtex = f.read()
			bib_str = f'<div class="bibBox"><a href="{bib_path}"><span class="project_link">bibtex</span></a>\n<div class="bibliography">{bibtex}</div></div>\n'
		#= href
		href_str = project_data.find('href').text
		if project_data.find("folder") is not None:
			href_str = f'Research/{project_data.find("folder").text}/{project_data.find("href").text}'
		#= links
		project_folder = project_data.find('folder').text if project_data.find('folder') is not None else 'FOLDER'
		home_link_str = ""
		if project_data.find('folder') is not None:
			home_link_str += f'<a href="Research/{project_folder}/index.html"><span class="project_link">project</span></a>\n'
		nest_link_str = ""
		nest_link_str_ending = "" # added to end
		def n_path(s): # process nest path
			prefix = f'Research/{project_folder}/'
			return s[len(prefix):] if s.startswith(prefix) else s
		for link in project_data.find('links'):
			href = link.find('href').text
			name = xml_child_string(link.find('name'))
			home_link_str += f'<a href="{href}"><span class="project_link">{name}</span></a>\n'
			nest_link_str += f'<a href="{n_path(href)}"><span class="project_link">{name}</span></a>\n'
		home_link_str += bib_str
		nest_link_str_ending += f'<a href="{n_path(bib_path)}"><span class="project_link">bibtex</span></a>\n'
		doi = project_data.find('doi').text
		doi_str = f'<a href="https://doi.org/{doi}"><span class="project_link">doi</span></a>\n'
		home_link_str += doi_str
		nest_link_str_ending += doi_str
		if project_data.find('more_links'):
			home_link_str += '<details>\n'
			for link in project_data.find('more_links'):
				href = link.find('href').text
				name = xml_child_string(link.find('name'))
				home_link_str += f'<a href="{href}"><span class="project_link">{name}</span></a>\n'
				nest_link_str += f'<a href="{n_path(href)}"><span class="project_link">{name}</span></a>\n'
			home_link_str += '<summary></summary></details>\n'
		nest_link_str += nest_link_str_ending
		venue_name = xml_child_string(project_data.find('venue'))
		venue_str = f'<a href="https://doi.org/{doi}">{venue_name}</a>'
		title_str = xml_child_string(project_data.find('title'))
		project_str = (short_project_template.replace('$IMG_SMALL', project_data.find('img_small').text)
		                                     .replace('$HREF', href_str)
		                                     .replace('$TITLE', title_str)
		                                     .replace('$AUTHORS', author_str)
		                                     .replace('$VENUE', venue_str)
		                                     .replace('$AWARD', award_str)
		                                     .replace('$LINKS', home_link_str)
		                                     .replace('$ABSTRACT_SMALL', xml_child_string(project_data.find('abstract_small')))
					   )
		project_key = f'${{{project_data.find("key").text}}}'
		research_list_str = research_list_str.replace(project_key, project_str)

		#==== project page
		if project_data.find('abstract_big') is None:
			continue # skip if data is missing
		panel_str =""
		for panel in project_data.find('panels'):
			title = xml_child_string(panel.find('title'))
			content = xml_child_string(panel.find('content'))
			extra_classes = '' if panel.find('extra_classes') is None else panel.find('extra_classes').text
			anchor_str = '' if panel.find('a') is None else f'<a name="{panel.find("a").text}">'
			if panel.find('bibtex') is not None:
				title = 'Bibtex'
				content = f'{bibtex}'
				extra_classes += ' bibEntry'
			panel_str += f'<div class="section_panel {extra_classes}">\n'
			panel_str += f'{anchor_str}\n'
			panel_str += f'<div class="section_header">{title}</div>\n'
			panel_str += f'<div class="section_text">{content}</div>\n</div>\n'
		abstract_text = xml_child_string(project_data.find('abstract_big')).strip()
		# format abstract for drop cap
		first_word, rest = abstract_text.split(' ', 1)
		letter, word = first_word[0], first_word[1:]
		abstract_text = f'{letter}<span class="first-word">{word}</span> {rest}\n'
		img_big_path = n_path(project_data.find('img_large').text)
		img_big_style = project_data.find('img_large').find('style').text if project_data.find('img_large').find('style') is not None else ""
		project_page = (project_page_template.replace('$TITLE', project_data.find('title').text)
		                                     .replace('$NAVBAR', navbar_str_nest)
		                                     .replace('$YEAR', year_str)
                                             .replace('$EMAIL',  email_str)
		                                     .replace('$VENUE', venue_str)
		                                     .replace('$AWARD', award_str)
		                                     .replace('$AUTHORS', long_author_str)
		                                     .replace('$LINKS', nest_link_str)
		                                     .replace('$ABSTRACT_BIG', abstract_text)
		                                     .replace('$IMG_BIG_STYLE', img_big_style)
		                                     .replace('$IMG_BIG', img_big_path)
		                                     .replace('$PANELS', panel_str)
						)
		project_path = f'generated/Research/{project_folder}/index.html'
		with open(project_path, 'w') as f:
			print(project_path)
			f.write(project_page)

# write index
with open('generated/index.html', 'w') as f:
	index_text = (index_template.replace('$DATE',   date_str)
	                            .replace('$YEAR',   year_str)
	                            .replace('$EMAIL',  email_str)
	                            .replace('$NEWS',   news_str)
	                            .replace('$MISC',   misc_str)
	                            .replace('$TALKS',  talk_str)
	                            .replace('$RESEARCH_LIST',  research_list_str)
	                            .replace('$NAVBAR', navbar_str_home)
	                            .replace('$BACKGROUND_SVG', background_str)
	                            )
	f.write(index_text)