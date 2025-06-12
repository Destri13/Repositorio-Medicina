import os
import json
from pypdf import PdfReader

base_path = "Repositorio Medicina"  # Asegúrate de que el nombre coincida con tu carpeta

search_index = {}

for root, dirs, files in os.walk(base_path):
    for file in files:
        if file.lower().endswith(".pdf"):
            try:
                path = os.path.join(root, file)
                relative_path = os.path.relpath(path, base_path).replace("\\", "/")
                reader = PdfReader(path)
                pages = {}
                for i, page in enumerate(reader.pages):
                    text = page.extract_text() or ""
                    pages[f"page_{i+1}"] = text.strip()
                search_index[file] = {
                    "url": relative_path,
                    "pages": pages
                }
            except Exception as e:
                print(f"Error procesando {file}: {e}")

with open("search_index.json", "w", encoding="utf-8") as f:
    json.dump(search_index, f, ensure_ascii=False, indent=2)
