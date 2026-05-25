import datetime, json, os, html
import xml.etree.ElementTree as ET
from pathlib import Path
from urllib.parse import quote
import brotli # compression
from PIL import Image # image dimensions
import re, os
import base64, mimetypes # inline images
# from pysvgo import optimize # optimize svgs
from scour import scour # optimize svgs
from htmlmin import minify

# syntax highlighting
from pygments import highlight
from pygments.lexers import BibTeXLexer
from pygments.formatters import HtmlFormatter
from pygments.filter import Filter
from pygments.token import String, Punctuation

# Custom pygments setup to ensure that the braces in a bibtex statement title = {paper title} are parsed as punctuation, rather than part of a single string
class BraceFilter(Filter):
    def filter(self, lexer, stream):
        for ttype, value in stream:
            if ttype is String and value in ('{', '}'):
                yield Punctuation, value
            else:
                yield ttype, value
bib_lexer = BibTeXLexer()
bib_lexer.add_filter(BraceFilter())
bib_formatter = HtmlFormatter(nowrap=True)

def get_image_dimensions(path):
    ext = os.path.splitext(path)[1].lower()
    if ext == '.svg':
        return _svg_dimensions(path)
    with Image.open(path) as img:
        return img.size  # (width, height)

def _svg_dimensions(path):
    root = ET.parse(path).getroot()
    vb = root.get('viewBox')
    if vb:
        parts = re.split(r'[\s,]+', vb.strip())
        if len(parts) == 4:
            _, _, w, h = parts
            return (round(float(w)), round(float(h)))
    w = _parse_length(root.get('width'))
    h = _parse_length(root.get('height'))
    if w and h:
        return (w, h)

    raise ValueError(f"Cannot determine dimensions of {path}")
def _parse_length(s):
    if not s:
        return None
    m = re.match(r'^\s*([\d.]+)', s)
    return round(float(m.group(1))) if m else None

def inline_image(path, alt="", attrs=None):
    p = Path(path)
    data = p.read_bytes()
 
    with Image.open(p) as img:
        intrinsic_w, intrinsic_h = img.size
    merged_attrs = {"width": intrinsic_w, "height": intrinsic_h}
    if attrs:
        merged_attrs.update(attrs)
    attrs = merged_attrs
    mime, _ = mimetypes.guess_type(p.name)
    if mime is None:
        ext = p.suffix.lower().lstrip(".")
        mime = {
            "webp": "image/webp",
            "avif": "image/avif",
            "jxl":  "image/jxl",
        }.get(ext, "application/octet-stream")
    b64 = base64.b64encode(data).decode("ascii")
    data_uri = f"data:{mime};base64,{b64}"
    def esc(s):
        return (str(s)
                .replace("&", "&amp;")
                .replace('"', "&quot;")
                .replace("<", "&lt;")
                .replace(">", "&gt;"))
    parts = [f'src="{data_uri}"', f'alt="{esc(alt)}"']
    if attrs:
        for k, v in attrs.items():
            if v is None or v is False:
                continue
            if v is True:
                parts.append(esc(k))           # boolean attribute
            else:
                parts.append(f'{esc(k)}="{esc(v)}"')
 
    return f"<img {' '.join(parts)}>"

_ARG_RE = re.compile(r'(\w+)\s*=\s*"((?:[^"\\]|\\.)*)"') # key="value" — value may contain \" or \\ escapes.
 
def _find_hero_directives(text, marker="INLINE_IMG"):
    """# return (start, end, args_str) for each ${marker}(...) directive in `text`."""
    marker = f"${marker}("
    i = 0
    while True:
        start = text.find(marker, i)
        if start == -1:
            return
        j = start + len(marker)
        in_quote = False
        while j < len(text):
            c = text[j]
            if in_quote:
                if c == "\\" and j + 1 < len(text):
                    j += 2          # skip escaped char
                    continue
                if c == '"':
                    in_quote = False
            elif c == '"':
                in_quote = True
            elif c == ")":
                yield start, j + 1, text[start + len(marker):j]
                i = j + 1
                break
            j += 1
        else:
            raise ValueError(
                f"Unterminated ${marker}( starting at position {start}"
            )
 
 
def _parse_args(args_str):
    """Parse `key="value", key="value", ...` into a dict, unescaping \\X."""
    args = {}
    for m in _ARG_RE.finditer(args_str):
        key = m.group(1)
        val = re.sub(r"\\(.)", r"\1", m.group(2))   # \" -> ", \\ -> \
        args[key] = val
    return args

def expand_inline_images(text, base_dir="."):
    base_dir = Path(base_dir)
    pieces = []
    last = 0
    for start, end, args_str in _find_hero_directives(text):
        args = _parse_args(args_str)
        if "src" not in args:
            raise ValueError(
                f"$INLINE_IMG directive missing src: {text[start:end]!r}"
            )
        src = args.pop("src")
        alt = args.pop("alt", "")
        img_path = base_dir / src
        pieces.append(text[last:start])
        pieces.append(inline_image(img_path, alt=alt, attrs=args))
        last = end
    pieces.append(text[last:])
    return "".join(pieces)

def optimize_svg(svg_string):
    options = scour.sanitizeOptions()
    
    # These are the magic flags for what you want:
    options.group_empty_attributes = True # Helps with grouping
    options.collapse_groups = True        # Collapses useless nested groups
    options.enable_viewboxing = True      # Helps with the 14KB goal
    options.remove_descriptive_elements = True
    options.strip_xml_prolog = True
    
    # Cleaning up the "cruft"
    options.remove_metadata = True
    options.strip_comments = True
    # options.shorten_ids = True
    options.indent_type = 'none' # Minify!
    options.precision = 2        # Round those long decimals
    
    return scour.scourString(svg_string, options=options)
    # return svg_string

# allow &nbsp; in xml https://stackoverflow.com/a/35591479
magic = '''<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
            "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd" [
            <!ENTITY nbsp '$NBSP'>
            ]>'''
nbsp_str = '&nbsp;'
# hack: turns nbsp into $NBSP, which we string-replace later
def parse_xml(filepath):
	with open(filepath) as f:
		return ET.fromstring(magic + f.read())

news_data = parse_xml('news.xml')
misc_data = parse_xml('misc.xml')
navb_data = parse_xml('navbar.xml')
talk_data = parse_xml('talks.xml')
proj_data = parse_xml('research_projects.xml')

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
gmail_str = "mark.gillespie81@gmail.com"

# == BACKGROUND_SVG
with open('torus.svg') as f:
    background_str = optimize_svg(f.read())

# == FAVICON
with open('../favicon.svg', encoding='utf-8') as f:
    svg = f.read()
    svg = " ".join(svg.split()) # collapse whitespace
    svg = quote(svg, safe="=:/?&;,@+$!*'()~") # Escape characters that would break an HTML attribute or URI.
    favicon_str = f'<link rel="icon" href="data:image/svg+xml,{svg}" type="image/svg+xml"/>'

# == CSS
with open('../stylesheets/swiss-main.css') as f:
	main_css_str = f"<style>{f.read().rstrip()}</style>"

with open('../stylesheets/swiss-project.css') as f:
	project_css_str = f"<style>{f.read().rstrip()}</style>"

# == $NEWS
news_str = "<ul>\n"
for item in news_data.find('recent_items'):
	when = xml_child_string(item.find('when'))
	what = xml_child_string(item.find('what'))
	news_str += f'<li><span class="when">{when}</span><span class="what">{what}</span></li>\n'
news_str += "<details><div>"
for item in news_data.find('extra_items'):
	when = xml_child_string(item.find('when'))
	what = xml_child_string(item.find('what'))
	news_str += f'<li><span class="when">{when}</span><span class="what">{what}</span></li>\n'
news_str += "</div><summary></summary></details></ul>"

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
talk_str = '<table class="talk_list">\n'
talk_template = xml_child_string(talk_data.find('template'))
for item in talk_data.find('talks'):
	venue_name = xml_child_string(item.find('venue_name'))
	venue_link = item.find('venue_link')
	venue_str = f'<a href="{venue_link.text}">{venue_name}</a>' if venue_link is not None else venue_name
	link_str = ""
	for link in item.find('links') if item.find('links') is not None else []:
		href = link.find('href').text
		name = xml_child_string(link.find('name'))
		link_str += f'<a href="{href}"><span class="project_link">{name}</span></a>\n'

	talk_str += (talk_template.replace('$WHEN',  xml_child_string(item.find('when')))
		                      .replace('$TITLE', xml_child_string(item.find('title')))
		                      .replace('$VENUE_NAME', venue_str)
		                      .replace('$DESCRIPTION', xml_child_string(item.find('description')))
		                      .replace('$LINKS', link_str)
		        )
talk_str += "</table>"

# == $MISC
misc_str = ""
misc_template = xml_child_string(misc_data.find('template'))
for item in misc_data.find('misc'):
	img_path = xml_child_string(item.find('img'))
	w, h = get_image_dimensions(f'../{img_path}')
	img_str = f'<img src="{img_path}" width="{w}" height="{h}" loading="lazy"/>'
	misc_str += (misc_template.replace('$TITLE',  xml_child_string(item.find('title')))
		                      .replace('$HREF', xml_child_string(item.find('href')))
		                      .replace('$DETAILS', xml_child_string(item.find('details')))
		                      .replace('$IMG_TAG', img_str)
		        )


# == $RESEARCH_LIST
short_project_template = xml_child_string(proj_data.find('project_template'))
research_list_str = xml_child_string(proj_data.find('project_list'))
with open('project_template.html') as f:
	project_page_template = f.read()
project_page_template = minify(project_page_template, remove_comments=True, reduce_empty_attributes=True)
for file in os.listdir(os.fsencode("ResearchProjects")):
	filename = os.fsdecode(file)
	if filename.endswith('.xml'):
		project_data = parse_xml(f"ResearchProjects/{filename}")

		project_folder = project_data.find('folder').text if project_data.find('folder') is not None else 'FOLDER'
		def n_path(s): # process nest path
			prefix = f'Research/{project_folder}/'
			return s[len(prefix):] if s.startswith(prefix) else s
		#==== entry in main page list
		title_str = xml_child_string(project_data.find('title'))
		#= author list
		author_str = "" # short version for main page
		long_author_str = "" # long version for project page
		for author in project_data.find('authors'):
			name_data = xml_child_string(author.find("name"))
			# if name has a single space, replace it with &nbsp; so that names don't break
			if "nbsp;" not in name_data and name_data.count(' ') == 1:
				name_data = name_data.replace(' ', "&nbsp;")
			if 'Mark' in name_data and 'Gillespie' in name_data:
				name = f'<a href="https://markjgillespie.com" class="me">{name_data}</a>'
			else:
				name = f'<a href="{author.find("href").text}">{name_data}</a>' if author.find('href') is not None else name_data
			affiliation = xml_child_string(author.find("affiliation"))
			author_str += f'{name},\n'
			long_author_str += f'<div class="author"><span class="name">{name}</span><span class="affiliation">{affiliation}</span></div>\n'
		author_str = author_str[:-2] # trim trailing comma and newline
		#= awards
		award_str = ""
		if project_data.find('award') is not None:
			href = project_data.find('award').find('href').text if project_data.find('award').find('href') is not None else None
			name = xml_child_string(project_data.find('award').find('name'))
			desc = xml_child_string(project_data.find('award').find('description'))
			desc_str = f'<div class="description">{desc}</div>' if len(desc) > 0 else ''
			award_str = f'<a href="{href}" class="award">{name} {desc_str}</a>' if href is not None else f'<div class="award">{name} {desc_str}</div>'
		#= bibtex
		bibtex, highlighted_bib, copy_button_str, home_bib_str, nest_bib_str = None, '', '', '', ''
		try:
			bib_path = project_data.find('bibtex').text
			with open(f'../{bib_path}') as f:
				bibtex = f.read().rstrip()
				highlighted_bib = highlight(bibtex, bib_lexer, bib_formatter)
				js_literal = html.escape(json.dumps(bibtex), quote=True) # use json.dumps to escape newlines, etc in bibtex file
				copy_button_str = f'<button onclick="navigator.clipboard.writeText({js_literal});">Copy</button>'
				home_bib_str = f'<div class="bibBox"><a href="{bib_path}"><span class="project_link">bibtex</span></a>\n<div class="bibliography" style="visibility: hidden;">{highlighted_bib}{copy_button_str}</div></div>\n'
				nest_bib_str = f'<div class="bibBox"><a href="{n_path(bib_path)}"><span class="project_link">bibtex</span></a>\n<div class="bibliography" style="visibility: hidden;">{highlighted_bib}{copy_button_str}</div></div>\n'
		except:
			print(f"WARNING: missing bibtex for {title_str}")
		#= href
		href_str = project_data.find('href').text
		if project_data.find("folder") is not None:
			href_str = f'Research/{project_data.find("folder").text}/{project_data.find("href").text}'
		#= links
		home_link_str = ""
		if project_data.find('folder') is not None:
			home_link_str += f'<a href="Research/{project_folder}/index.html"><span class="project_link">project</span></a>\n'
		nest_link_str = ""
		nest_link_str_ending = "" # added to end
		for link in project_data.find('links'):
			href = link.find('href').text
			name = xml_child_string(link.find('name'))
			home_link_str += f'<a href="{href}"><span class="project_link">{name}</span></a>\n'
			nest_link_str += f'<a href="{n_path(href)}"><span class="project_link">{name}</span></a>\n'
		home_link_str += home_bib_str
		nest_link_str_ending += nest_bib_str
		doi = None
		doi_str = "";
		try:
			doi = project_data.find('doi').text
			doi_str = f'<a href="https://doi.org/{doi}"><span class="project_link">doi</span></a>\n'
		except:
			print(f"WARNING: missing doi for {title_str}")
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
		venue_str = venue_name if doi is None else f'<a href="https://doi.org/{doi}">{venue_name}</a>'
		img_path = project_data.find('img_small').text
		img_style = project_data.find('img_small').find('style').text if project_data.find('img_small').find('style') is not None else ""
		w, h = get_image_dimensions(f'../{img_path}')
		img_str = f'<img src="{img_path}" width="{w}" height="{h}" style="{img_style}" loading="lazy"/>'
		project_str = (short_project_template.replace('$IMG_SMALL', img_path)
		                                     .replace('$IMG_TAG', img_str)
		                                     .replace('$HREF', href_str)
		                                     .replace('$TITLE', title_str)
		                                     .replace('$AUTHORS', author_str)
		                                     .replace('$VENUE', venue_str)
		                                     .replace('$AWARD', award_str)
		                                     .replace('$LINKS', home_link_str)
		                                     .replace('$NBSP',  nbsp_str)
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
			if panel.find('bibtex') is not None and bibtex is not None:
				title = 'Bibtex'
				content = f'{highlighted_bib} {copy_button_str}'
				extra_classes += ' bibEntry'
			panel_str += f'<div class="section_panel bibliography {extra_classes}">\n'
			panel_str += f'{anchor_str}\n'
			panel_str += f'<div class="section_header">{title}</div>\n'
			panel_str += f'<div class="section_text">{content}</div>\n</div>\n'
		abstract_text = xml_child_string(project_data.find('abstract_big')).strip()
		# format abstract for drop cap
		first_word, rest = abstract_text.split(' ', 1)
		letter, word = first_word[0], first_word[1:]
		abstract_text = f'{letter}<span class="first-word">{word}</span> {rest}\n'
		img_big_path = n_path(project_data.find('img_large').text)
		w, h = get_image_dimensions(f'../Research/{project_folder}/{img_big_path}')
		img_big_style = project_data.find('img_large').find('style').text if project_data.find('img_large').find('style') is not None else ""
		img_big_str = f'<img src="{img_big_path}" width="{w}" height="{h}" style="{img_big_style}">'
		project_page = (project_page_template.replace('$TITLE', project_data.find('title').text)
		                                     .replace('$NAVBAR', navbar_str_nest)
		                                     .replace('$YEAR', year_str)
		                                     .replace('$VENUE', venue_str)
		                                     .replace('$AWARD', award_str)
		                                     .replace('$AUTHORS', long_author_str)
		                                     .replace('$LINKS', nest_link_str)
		                                     .replace('$ABSTRACT_BIG', abstract_text)
		                                     .replace('$IMG_BIG_STYLE', img_big_style)
		                                     .replace('$IMG_BIG_TAG', img_big_str)
		                                     .replace('$IMG_BIG', img_big_path)
		                                     .replace('$PANELS', panel_str)
		                                     .replace('$EMAIL',  email_str)
		                                     .replace('$GMAIL',  gmail_str)
		                                     .replace('$NBSP',  nbsp_str)
		                                     .replace('$PROJECT_CSS',  project_css_str)
		                                     .replace('$FAVICON',  favicon_str)
						)
		project_path = f'../Research/{project_folder}/index.html'
		Path(project_path).parent.mkdir(parents=True, exist_ok=True) # ensure path exists
		with open(project_path, 'w') as f:
			f.write(project_page)

		compressed_project_page = brotli.compress(project_page.encode(), quality=11) # Max compression
		with open(f"{project_path}.br", "wb") as f:
		    f.write(compressed_project_page)
		print(project_path)

# write index
index_template = re.sub(r"<!--.*?-->", "", index_template, flags=re.DOTALL) # strip comments
index_template = expand_inline_images(index_template, '..')
index_template = minify(index_template, remove_comments=True, reduce_empty_attributes=True)
index_text = (index_template.replace('$DATE',   date_str)
                            .replace('$YEAR',   year_str)
                            .replace('$NEWS',   news_str)
                            .replace('$MISC',   misc_str)
                            .replace('$TALKS',  talk_str)
                            .replace('$RESEARCH_LIST',  research_list_str)
                            .replace('$NAVBAR', navbar_str_home)
                            .replace('$BACKGROUND_SVG', background_str)
                            .replace('$EMAIL',  email_str)
                            .replace('$GMAIL',  gmail_str)
                            .replace('$NBSP',  nbsp_str)
                            .replace('$MAIN_CSS',  main_css_str)
                            .replace('$FAVICON',  favicon_str)
                            )
with open('../index.html', 'w') as f:
	f.write(index_text)

compressed_index_text = brotli.compress(index_text.encode(), quality=11) # Max compression
with open("../index.html.br", "wb") as f:
    f.write(compressed_index_text)
print('index.html')