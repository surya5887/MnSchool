import re

with open('src/components/LivePaperBuilder.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

code = code.replace("dangerouslySetInnerHTML={{ __html: @import", "dangerouslySetInnerHTML={{ __html: @import")
code = code.replace("Serifa'); }}", "Serifa'); }}")

# To be safe, just replace the entire style tag.
start_style = code.find('      {/* Font Previews for Dropdown */}')
end_style = code.find('      {/* CENTER: Live Canvas Area */}')

if start_style != -1 and end_style != -1:
    old_style = code[start_style:end_style]
    
    fonts = [
      'Roboto', 'Open+Sans', 'Lato', 'Montserrat', 'Oswald', 'Source+Sans+Pro', 'Slabo+27px', 'Raleway', 'PT+Sans', 'Merriweather', 'Noto+Sans', 'Nunito',
      'Concert+One', 'Playfair+Display', 'Rubik', 'Lora', 'Ubuntu', 'Work+Sans', 'Fira+Sans', 'Quicksand', 'Inter', 'Poppins', 'Roboto+Condensed', 'Karla',
      'Inconsolata', 'Bitter', 'Pacifico', 'Dancing+Script', 'Caveat', 'Righteous', 'Creepster', 'Lobster', 'Fredoka+One', 'Comfortaa', 'Shadows+Into+Light', 'Cinzel',
      'Amatic+SC', 'Bangers', 'Permanent+Marker', 'Courgette', 'Satisfy', 'Alfa+Slab+One', 'Cookie', 'Chewy', 'Bree+Serif'
    ]
    
    preview_imports = "\\n".join([f"@import url('https://fonts.googleapis.com/css2?family={f}&text={f.replace('+', '')}a');" for f in fonts])
    
    new_style = "      {/* Font Previews for Dropdown */}\\n      <style dangerouslySetInnerHTML={{ __html: \\n" + preview_imports + "\\n }} />\\n"
    
    code = code.replace(old_style, new_style)
    
    with open('src/components/LivePaperBuilder.tsx', 'w', encoding='utf-8') as f:
        f.write(code)
    print("Fixed backticks")
else:
    print("Could not find style tag")
