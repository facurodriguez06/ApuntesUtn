from playwright.sync_api import sync_playwright
import time
import getpass

def extraer_mesas_sysacad(url_login, dni, clave):
    print("\n[+] Iniciando Bot de Autogestión UTN...")

    with sync_playwright() as p:
        # slow_mo ayuda a que la página no detecte que somos un bot muy rápido
        navegador = p.chromium.launch(headless=False, slow_mo=100) 
        contexto = navegador.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            viewport={"width": 1280, "height": 720}
        )
        pagina = contexto.new_page()

        try:
            print(f"[+] Entrando al portal: {url_login}")
            pagina.goto(url_login)
            
            print("[+] Inyectando credenciales...")
            # Selector flexible para el DNI/Usuario
            selector_dni = 'input[name="dni"], input[name="username"], input[id*="dni" i], input[type="number"], input[placeholder*="DNI" i]'
            input_dni = pagina.wait_for_selector(selector_dni, timeout=15000)
            
            # Resaltar en rojo el input encontrado (solo visual)
            input_dni.evaluate("el => el.style.border = '3px solid red'")
            time.sleep(1) 
            
            input_dni.fill(dni)
            
            # Selector flexible para la clave
            selector_clave = 'input[type="password"], input[name="password"], input[name="clave"]'
            pagina.fill(selector_clave, clave)

            print("[+] Iniciando sesión...")
            # Clic en botón Ingresar
            pagina.locator('button[type="submit"], button:has-text("Ingresar"), input[type="submit"]').first.click()
            
            # Esperamos que cargue la pantalla de portal
            pagina.wait_for_load_state('networkidle')

            print("[✓] Login exitoso. Buscando botón de Legajo...")
            
            # --- INICIO DEL REEMPLAZO (BOTÓN AZUL) ---
            try:
                # Super Selector para el botón azul
                selector_legajo = 'a:has-text("Legajo"), button:has-text("Legajo"), .btn:has-text("Legajo"), div.card:has-text("Legajo")'
                boton_legajo = pagina.locator(selector_legajo).first
                
                # Resaltamos el botón para confirmar que lo detectó
                boton_legajo.evaluate("el => el.style.border = '4px solid red'")
                time.sleep(1)
                
                # Clic forzado
                boton_legajo.click(force=True, timeout=10000)
                pagina.wait_for_load_state('networkidle')
                print("[✓] ¡Clic en Legajo exitoso! Dentro de Autogestión.")
                
            except Exception as e:
                print("\n[!] No se pudo hacer clic en el botón azul automáticamente.")
                print("--- PAUSA DE EMERGENCIA (30 Segundos) ---")
                print("Por favor, en la ventana del navegador, haga clic derecho sobre el BOTÓN AZUL -> Inspeccionar.")
                print("¡Páseme el código HTML de ese botón para arreglar el selector!")
                time.sleep(30)
                raise e # Cortamos la ejecución si falla aquí
            # --- FIN DEL REEMPLAZO ---

            # --- NAVEGACIÓN A EXÁMENES ---
            print("[+] Buscando la opción 'Inscripción a Exámenes' en el menú...")
            menu_examenes = pagina.wait_for_selector('text="Inscripción a Exámenes"', timeout=10000)
            menu_examenes.click()
            pagina.wait_for_load_state('networkidle')

            # --- VERIFICACIÓN DE AVISOS ---
            print("[+] Verificando si hay pantalla de avisos...")
            try:
                boton_continuar = pagina.wait_for_selector('input[value="Continuar"], button:has-text("Continuar")', timeout=5000)
                print("[!] Muro detectado. Haciendo clic en Continuar...")
                boton_continuar.click()
                pagina.wait_for_load_state('networkidle')
            except:
                print("[i] No hubo muro de avisos. Pasando directo...")

            print("\n[✓] ¡Llegamos a la tabla de mesas de examen!")
            
            # --- EXTRACCIÓN ---
            print("[+] Analizando la tabla...")
            filas = pagina.locator('table tr').all()
            mesas_extraidas = []
            
            for fila in filas:
                celdas = fila.locator('td').all()
                if len(celdas) >= 4:
                    texto_celdas = [celda.text_content().strip() for celda in celdas]
                    mesas_extraidas.append(texto_celdas)

            print(f"\n=== SE ENCONTRARON {len(mesas_extraidas)} MATERIAS HABILITADAS ===")
            for i, mesa in enumerate(mesas_extraidas, 1):
                print(f"Fila {i}: {mesa}")
            
            print("\n[i] El bot mantendrá la ventana abierta 15 segundos para que usted verifique...")
            time.sleep(15)

        except Exception as e:
            print(f"\n[!] ERROR CRÍTICO: {e}")
            try:
                pagina.screenshot(path="error_sysacad.png", full_page=True)
                print("[i] Captura de pantalla guardada en 'error_sysacad.png'. ÁBRALA PARA VER QUÉ PASÓ.")
            except:
                pass
                
        finally:
            print("[+] Cerrando conexión...")
            navegador.close()

if __name__ == "__main__":
    # URL inicial del login (Asegúrese de usar la que le pide el DNI correctamente)
    URL_LOGIN = "https://sysacad.frm.utn.edu.ar/login-limpio.php" 
    
    print("=== BOT SYSACAD UTN FRM ===")
    MI_DNI = input("Ingrese su número de DNI o Usuario: ")
    MI_CLAVE = getpass.getpass("Ingrese su contraseña (oculta): ")

    extraer_mesas_sysacad(URL_LOGIN, MI_DNI, MI_CLAVE)