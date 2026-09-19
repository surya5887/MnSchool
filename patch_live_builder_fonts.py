import re

with open('src/components/LivePaperBuilder.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Replace the font options in LivePaperBuilder
old_font_options = '''                            <option value="">Default Font</option>
                            <option value="Arial">Arial</option>
                            <option value="Helvetica">Helvetica</option>'''

fonts = [
  'Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Verdana', 'Georgia', 'Palatino', 'Garamond', 'Bookman', 'Comic Sans MS', 'Trebuchet MS', 'Arial Black', 'Impact',
  'Roboto', 'Open+Sans', 'Lato', 'Montserrat', 'Oswald', 'Source+Sans+Pro', 'Slabo+27px', 'Raleway', 'PT+Sans', 'Merriweather', 'Noto+Sans', 'Nunito',
  'Concert+One', 'Playfair+Display', 'Rubik', 'Lora', 'Ubuntu', 'Work+Sans', 'Fira+Sans', 'Quicksand', 'Inter', 'Poppins', 'Roboto+Condensed', 'Karla',
  'Inconsolata', 'Bitter', 'Pacifico', 'Dancing+Script', 'Caveat', 'Righteous', 'Creepster', 'Lobster', 'Fredoka+One', 'Comfortaa', 'Shadows+Into+Light', 'Cinzel',
  'Amatic+SC', 'Bangers', 'Permanent+Marker', 'Courgette', 'Satisfy', 'Alfa+Slab+One', 'Cookie', 'Chewy', 'Bree+Serif'
]

google_fonts = [f for f in fonts if f not in ['Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Verdana', 'Georgia', 'Palatino', 'Garamond', 'Bookman', 'Comic Sans MS', 'Trebuchet MS', 'Arial Black', 'Impact']]

new_font_options = '                            <option value="">Default Font</option>\n'
for f in fonts:
    display_name = f.replace('+', ' ')
    new_font_options += f'                            <option value="{display_name}" style={{{{ fontFamily: \\"\'{display_name}\', sans-serif\\" }}}}>{display_name}</option>\n'


# We need to inject the CSS for the previews
preview_imports = "\\n".join([f"@import url('https://fonts.googleapis.com/css2?family={f}&text={f.replace('+', '')}a');" for f in google_fonts])

style_tag = f'''      {{/* Font Previews for Dropdown */}}
      <style>
        {{
{preview_imports}
        }}
      </style>
      {{/* CENTER: Live Canvas Area */}}'''

start_opts = code.find('                            <option value="">Default Font</option>')
end_opts = code.find('                          </select>', start_opts)

if start_opts != -1 and end_opts != -1:
    code = code[:start_opts] + new_font_options + code[end_opts:]
    
    # Inject style tag before CENTER
    center_idx = code.find('      {/* CENTER: Live Canvas Area */}')
    if center_idx != -1:
        code = code[:center_idx] + style_tag + code[center_idx + 38:]
        
    with open('src/components/LivePaperBuilder.tsx', 'w', encoding='utf-8') as f:
        f.write(code)
    print("Patched LivePaperBuilder")
else:
    print("Could not find font options", start_opts, end_opts)
