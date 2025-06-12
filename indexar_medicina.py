import os
import fitz  # PyMuPDF
import json

def limpiar_nombre(nombre):
    nombre = nombre.replace(" ", "_")
    nombre = nombre.replace("á", "a").replace("é", "e").replace("í", "i")
    nombre = nombre.replace("ó", "o").replace("ú", "u").replace("ñ", "n")
    return nombre

def indexar_pdf(pdf_path, base_url):
    data = {}
    try:
        doc = fitz.open(pdf_path)
        pages = {}
        for i, page in enumerate(doc, start=1):
            text = page.get_text().strip()
            pages[f"page_{i}"] = text
        data["url"] = base_url
        data["pages"] = pages
        doc.close()
    except Exception as e:
        print(f"⚠️ Error leyendo {pdf_path}: {e}")
    return data

directorio_base = os.getcwd()
indice = {}

for root, dirs, files in os.walk(directorio_base):
    for file in files:
        if file.lower().endswith(".pdf"):
            carpeta_relativa = os.path.relpath(root, directorio_base)
            pdf_path = os.path.join(root, file)

            carpeta_sin_espacios = limpiar_nombre(carpeta_relativa)
            nombre_pdf_limpio = limpiar_nombre(file)

            ruta_relativa_pdf = os.path.join(carpeta_sin_espacios, nombre_pdf_limpio).replace("\\", "/")
            key = nombre_pdf_limpio

            print(f"📄 Procesando: {ruta_relativa_pdf}")
            indice[key] = indexar_pdf(pdf_path, ruta_relativa_pdf)

with open("search_index.json", "w", encoding="utf-8") as f:
    json.dump(indice, f, ensure_ascii=False, indent=2)

print("\n✅ Índice generado correctamente: search_index.json")
