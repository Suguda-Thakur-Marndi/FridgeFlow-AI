import os

src_path = os.path.join(os.path.dirname(__file__), '..', 'node_modules', 'onnxruntime-web', 'dist', 'ort.min.js')
dst_path = os.path.join(os.path.dirname(__file__), '..', 'src', 'services', 'edgeAI', 'ort-web-runtime.js')

with open(src_path, 'r', encoding='utf-8') as f:
    content = f.read()

target = 'import(/*webpackIgnore:true*/ /*@vite-ignore*/e)'
replacement = '(new Function("u", "return import(u)")(e))'

if target in content:
    content = content.replace(target, replacement)
    print('Successfully patched import() for Metro compatibility.')
else:
    print('Warning: target string not found directly.')

with open(dst_path, 'w', encoding='utf-8') as f:
    f.write(content)

print(f'Wrote patched runtime to {dst_path}')
