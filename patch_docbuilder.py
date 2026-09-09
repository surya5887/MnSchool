import re

file_path = 'src/components/DocumentBuilder.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add flexShrink: 0 to the builder-canvas
old_canvas_style = """          style={{ 
              width: '794px', 
              height: '1123px', 
              background: bgImage ? (printing ? 'transparent' : `url(${bgImage}) center/cover no-repeat`) : 'white',
              position: printing ? 'absolute' : 'relative',
              left: 0,
              top: 0,
              transform: printing ? 'scale(1)' : `scale(${scale})`,
              transformOrigin: 'top left',
              boxShadow: printing ? 'none' : '0 10px 25px rgba(0,0,0,0.1)',
              backgroundColor: printing ? 'transparent' : 'white',
              zIndex: printing ? 999999 : 1
          }}>"""

new_canvas_style = """          style={{ 
              width: '794px', 
              height: '1123px', 
              flexShrink: 0,
              background: bgImage ? (printing ? 'transparent' : `url(${bgImage}) center/cover no-repeat`) : 'white',
              position: printing ? 'absolute' : 'relative',
              left: 0,
              top: 0,
              transform: printing ? 'scale(1)' : `scale(${scale})`,
              transformOrigin: 'top left',
              boxShadow: printing ? 'none' : '0 10px 25px rgba(0,0,0,0.1)',
              backgroundColor: printing ? 'transparent' : 'white',
              zIndex: printing ? 999999 : 1
          }}>"""
content = content.replace(old_canvas_style, new_canvas_style)

# 2. Wrap the renderCanvasContent in a scaled div, and fix the container styles
old_container = """        <div ref={containerRef} className="builder-container no-print" style={{ width: '100%', overflow: 'hidden', display: 'flex', background: '#f1f5f9', padding: '20px', borderRadius: '12px' }}>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              {renderCanvasContent(false)}
            </div>
        </div>"""

new_container = """        <div ref={containerRef} className="builder-container no-print" style={{ width: '100%', overflow: 'hidden', display: 'flex', background: '#f1f5f9', padding: '20px', borderRadius: '12px', justifyContent: 'center' }}>
            <div style={{ width: 794 * scale, height: 1123 * scale, position: 'relative' }}>
              {renderCanvasContent(false)}
            </div>
        </div>"""
content = content.replace(old_container, new_container)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated DocumentBuilder.tsx")
