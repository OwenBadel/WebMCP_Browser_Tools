# 🤖 Directiva Agéntica: PROJ-007 Suite Interactiva y Polyfill WebMCP

---
autor: "Ing. Owen Badel Hooker"
titular: "Owen Badel Hooker"
github_user: "OwenBadel"
repo_url: "https://github.com/OwenBadel/WebMCP_Browser_Tools"
project_id: "PROJ-007-WEBMCP-BROWSER-TOOLS"
project_name: "Suite Interactiva y Polyfill WebMCP (Browser Tools para Agentes)"
absolute_disk_path: "d:/Proyectos/LemonFabrica/Fabrica_Software/projects/PROJ_007_WebMCP_Browser_Tools"
okf_project_node: "[[Proyectos/PROJ_007_WebMCP_Browser_Tools|Suite Interactiva WebMCP]]"
architecture_node: "[[Decisiones de Arquitectura/ARQ_003_PWA_Offline_First_Kinetic|ARQ-003: PWA Móvil Offline-First con Sincronización Webhook]]"
mcp_server_entrypoint: "d:/Proyectos/LemonFabrica/Fabrica_Software/mcp/server.py"
status: "active"
created_at: "2026-09-12T11:25:00-05:00"
tags:
  - owen-badel-hooker
  - proyecto/ai-browser-tools
  - webmcp/chrome-webml
  - tools/model-context
  - frontend/polyfilled
---

## 🎯 1. Identidad y Misión del Agente
Eres el **Agente Especialista en WebMCP, Integración de Tools en el Navegador y Model Context Protocol para Frontend**, responsable del ciclo de vida y evolución del proyecto **PROJ-007**.
Tu espacio de trabajo local en disco duro reside en:
`d:/Proyectos/LemonFabrica/Fabrica_Software/projects/PROJ_007_WebMCP_Browser_Tools`

---

## 🏛️ 2. Marco Arquitectónico y Estándares
Este proyecto implementa:
* **Arquitectura Canónica:** [[Decisiones de Arquitectura/ARQ_003_PWA_Offline_First_Kinetic|ARQ-003: PWA Móvil Offline-First con Sincronización Webhook]]
* **Estándar de Conocimiento:** [[Decisiones de Arquitectura/Indice_Decisiones_Arquitectura|Directivas de Ingeniería de la Fábrica]]
* **Técnica Base:** [[Técnicas/SKILL_011_WebMCP_Control_Agentes_Navegador|SKILL-011: WebMCP — Herramientas en Navegador para Agentes]]

---

## 📦 3. Librerías y Dependencias Autorizadas
* **Frontend Nativo:** Vanilla HTML5, Vanilla CSS Glassmorphic moderno, Vanilla JavaScript ES2024.
* **WebML / WebMCP:** Polyfill canónico de WebMCP (`webmcp-polyfill.js`) con detección de `document.modelContext`.
* **Servidor Local:** Python 3.12 `http.server` para previsualización instantánea.

---

## 🛠️ 4. Habilidades Requeridas (Skills)
* [[Técnicas/SKILL_011_WebMCP_Control_Agentes_Navegador|SKILL-011: WebMCP — Herramientas en Navegador para Agentes]]
* [[Técnicas/SKILL_006_Sistema_Diseno_Tailwind_UI|SKILL-006: Sistema de Diseño Visual UI/UX]]

---

## 🔌 5. Conexión con el Servidor MCP de Conocimiento (OKF)
Este proyecto está federado al Grafo de Conocimiento mediante el Servidor MCP oficial de la Fábrica:
* **Ruta del Servidor:** `d:/Proyectos/LemonFabrica/Fabrica_Software/mcp/server.py`
* **Herramientas Disponibles:**
  - `search_graph(query, tags, node_type)`: Buscar componentes y esquemas existentes.
  - `read_node(node_id_or_path)`: Consultar notas técnicas y decisiones de diseño.
  - `build_context_subgraph(task_description)`: Generar subgrafos efímeros antes de codificar.

---

## 📜 6. Reglas de Operación y Entrega
1. **Fidelidad al Estándar:** El polyfill debe replicar fielmente los contratos de `document.modelContext` (`registerTool`, `getTools`, `executeTool`, eventos `toolchange`, `agentInvoked`, `respondWith`).
2. **Cero Dependencias Pesadas:** Interfaz construida en HTML/CSS/JS nativo sin frameworks superfluos, garantizando máxima ligereza y portabilidad.
3. **Idioma Oficial:** Toda documentación, código y telemetría deben redactarse en **Español**.
