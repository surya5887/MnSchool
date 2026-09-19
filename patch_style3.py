import re

with open('src/components/LivePaperBuilder.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

start_idx = code.find('      {/* CENTER: Live Canvas Area */}')
if start_idx != -1:
    fonts = [
      'Roboto', 'Open+Sans', 'Lato', 'Montserrat', 'Oswald', 'Source+Sans+Pro', 'Slabo+27px', 'Raleway', 'PT+Sans', 'Merriweather', 'Noto+Sans', 'Nunito',
      'Concert+One', 'Playfair+Display', 'Rubik', 'Lora', 'Ubuntu', 'Work+Sans', 'Fira+Sans', 'Quicksand', 'Inter', 'Poppins', 'Roboto+Condensed', 'Karla',
      'Inconsolata', 'Bitter', 'Pacifico', 'Dancing+Script', 'Caveat', 'Righteous', 'Creepster', 'Lobster', 'Fredoka+One', 'Comfortaa', 'Shadows+Into+Light', 'Cinzel',
      'Amatic+SC', 'Bangers', 'Permanent+Marker', 'Courgette', 'Satisfy', 'Alfa+Slab+One', 'Cookie', 'Chewy', 'Bree+Serif'
    ]
    
    # Generate standard string without template literals
    html_content = ""
    for f in fonts:
        html_content += f"@import url('https://fonts.googleapis.com/css2?family={f}&text={f.replace('+', '')}a'); "
        
    style_tag = f'      {{/* Font Previews for Dropdown */}}\n      <style dangerouslySetInnerHTML={{{{ __html: "{html_content}" }}}} />\n      {{/* CENTER: Live Canvas Area */}}'
    
    code = code[:start_idx] + style_tag + code[start_idx + 38:]
    with open('src/components/LivePaperBuilder.tsx', 'w', encoding='utf-8') as f:
        f.write(code)
    print("Added correct style block")
