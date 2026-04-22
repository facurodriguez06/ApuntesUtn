import os
from pypdf import PdfWriter, PdfReader

# 1. Definir las rutas exactas según su estructura
ruta_portada = 'PORTADA.pdf'
carpeta_origen = 'apuntes'
carpeta_destino = 'materias_con_portada'

print("Iniciando el procesamiento de sus apuntes, Ing. Rodríguez...")

# Verificar que la portada exista para evitar errores
if not os.path.exists(ruta_portada):
    print(f"❌ Error: No se encontró el archivo '{ruta_portada}'. Asegúrese de que esté en la misma carpeta que este script.")
    exit()

# Leer la portada una sola vez en memoria para optimizar el proceso
portada = PdfReader(ruta_portada)
pagina_portada = portada.pages[0]

# Recorrer todas las carpetas y subcarpetas dentro de 'mis_materias'
for ruta_actual, carpetas, archivos in os.walk(carpeta_origen):
    
    # Filtrar solo los archivos PDF
    archivos_pdf = [archivo for archivo in archivos if archivo.lower().endswith('.pdf')]
    
    # Si hay PDFs en esta carpeta, procedemos
    if archivos_pdf:
        # Calcular la ruta relativa (ej: 'ANÁLISIS MATEMÁTICO II')
        ruta_relativa = os.path.relpath(ruta_actual, carpeta_origen)
        
        # Armar la ruta de destino replicando la estructura
        ruta_salida_actual = os.path.join(carpeta_destino, ruta_relativa)
        os.makedirs(ruta_salida_actual, exist_ok=True)
        
        print(f"\n📂 Procesando materia: {ruta_relativa}")

        for archivo in archivos_pdf:
            ruta_apunte_original = os.path.join(ruta_actual, archivo)
            ruta_apunte_final = os.path.join(ruta_salida_actual, archivo)
            
            writer = PdfWriter()
            
            # Paso A: Agregar la portada como primera página
            writer.add_page(pagina_portada)
            
            # Paso B: Agregar todas las páginas del apunte original
            try:
                apunte = PdfReader(ruta_apunte_original)
                for pagina in apunte.pages:
                    writer.add_page(pagina)
                    
                # Paso C: Guardar el documento final en la nueva carpeta
                with open(ruta_apunte_final, 'wb') as archivo_salida:
                    writer.write(archivo_salida)
                    
                print(f"  ✅ Portada añadida a: {archivo}")
            except Exception as e:
                print(f"  ❌ Error al leer {archivo}: {e}")

print("\n¡Proceso finalizado exitosamente! Revise la carpeta 'materias_con_portada'.")