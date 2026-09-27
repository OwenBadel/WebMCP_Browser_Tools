# ⚡ WebMCP Browser Tools — Control de Navegador para Agentes de IA

[![Vanilla JS](https://img.shields.io/badge/Vanilla_JS-ES2024-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/es/docs/Web/JavaScript)
[![W3C WebML](https://img.shields.io/badge/W3C-WebML%20Draft-blue)](https://www.w3.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

**Autor y Titular:** Ingeniero Owen Badel Hooker  
**GitHub:** [OwenBadel](https://github.com/OwenBadel)  
**Repositorio Oficial:** [WebMCP_Browser_Tools](https://github.com/OwenBadel/WebMCP_Browser_Tools)  

---

## 📌 Visión General

**WebMCP Browser Tools** es una suite interactiva y polyfill universal que implementa la especificación de control de agentes autónomos en el navegador (**Web Machine Control Protocol - WebMCP** / Chrome WebML).

En lugar de que los agentes de IA recurran a técnicas frágiles de *web scraping*, visión artificial en capturas de pantalla o inyecciones arbitrarias de scripts, **WebMCP** permite que la propia aplicación web declare y exponga sus herramientas (*tools*) y esquemas JSON directamente en el DOM mediante la API `document.modelContext`. Los agentes pueden descubrir, validar y ejecutar funciones con total seguridad, auditabilidad en tiempo real y visibilidad directa para el usuario.

---

## 🌟 Características Principales

1. **Polyfill Universal WebMCP (`webmcp-polyfill.js`):**
   - Provee una emulación fiel de `document.modelContext` cuando el navegador no cuenta con soporte nativo.
   - Métodos estándar: `registerTool()`, `unregisterTool()`, `getTools()`, `executeTool()`.
   - Eventos reactivos: `toolchange`, `agentInvoked`, `toolResult`.
   - Soporte para cancelación cooperativa vía `AbortSignal`.

2. **Suite Interactiva de Prueba y Depuración:**
   - Dashboard en modo oscuro con diseño *glassmorphism* y micro-interacciones fluidas.
   - Visualizador en vivo de herramientas registradas con esquemas de parámetros interactivos.
   - Consola de telemetría y eventos en tiempo real para auditar invocaciones de agentes.
   - Simulador de agente autónomo incorporado para probar cadenas de ejecución paso a paso.

3. **Cero Dependencias Externas:**
   - Construido completamente en HTML5 semántico, CSS moderno y JavaScript modular nativo.
   - Máximo rendimiento y compatibilidad multiplataforma.

---

## 📂 Estructura del Proyecto

```text
WebMCP_Browser_Tools/
├── AGENTS.md                  <-- Directiva agéntica del proyecto
├── README.md                  <-- Documentación técnica de ejecución
├── index.html                 <-- Interfaz gráfica y banco de pruebas WebMCP
├── style.css                  <-- Sistema de diseño visual glassmorphic y tokens HSL
├── app.js                     <-- Registro de herramientas, simulación de agente y eventos
├── webmcp-polyfill.js         <-- Polyfill universal del estándar document.modelContext
├── server.py                  <-- Servidor web ligero en Python para desarrollo local
└── .gitignore                 <-- Configuración de exclusión de Git
```

---

## 🚀 Inicio Rápido

### 1. Clonar el Repositorio
```bash
git clone https://github.com/OwenBadel/WebMCP_Browser_Tools.git
cd WebMCP_Browser_Tools
```

### 2. Iniciar el Servidor de Desarrollo
El proyecto incluye un servidor ligero en Python:
```bash
python server.py
```
O con el módulo nativo de Python:
```bash
python -m http.server 8080
```

### 3. Abrir en el Navegador
Visita [http://127.0.0.1:8080](http://127.0.0.1:8080) para interactuar con el entorno de pruebas, activar herramientas temporales y simular la ejecución de agentes de IA.

---

## 💡 Ejemplo de Registro de Herramientas

```javascript
// Registro de una herramienta en el navegador
document.modelContext.registerTool({
  name: "calcular_presupuesto",
  description: "Calcula el costo estimado de un proyecto en función de horas y tarifa.",
  parameters: {
    type: "object",
    properties: {
      horas: { type: "number", description: "Total de horas de ingeniería" },
      tarifa_usd: { type: "number", description: "Tarifa horaria en USD" }
    },
    required: ["horas", "tarifa_usd"]
  },
  execute: async (args) => {
    const total = args.horas * args.tarifa_usd;
    return { status: "success", total_usd: total };
  }
});
```

---

## 📜 Licencia
Proyecto desarrollado bajo la autoría y titularidad exclusiva del **Ingeniero Owen Badel Hooker**. Distribuido bajo la Licencia MIT.
