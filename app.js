/**
 * WebMCP Interactive Showcase Application
 * Lemon Fábrica de Software - PROJ-007
 */

(function () {
  'use strict';

  // Referencias a elementos del DOM
  const tasksContainer = document.getElementById('tasksList');
  const taskCountBadge = document.getElementById('taskCountBadge');
  const toolCatalog = document.getElementById('toolCatalog');
  const toolCountBadge = document.getElementById('toolCountBadge');
  const consoleEditor = document.getElementById('consoleEditor');
  const consoleOutput = document.getElementById('consoleOutput');
  const telemetryLog = document.getElementById('telemetryLog');
  const toolSelector = document.getElementById('toolSelector');
  const supportForm = document.getElementById('supportForm');
  const toastContainer = document.getElementById('toastContainer');

  let activePanicController = null;

  // Lista local de tareas para demostrar mutación de UI
  const tasks = [
    { id: 1, text: 'Auditoría de nodos OKF en vault/', priority: 'Alta', tag: 'Arquitectura' },
    { id: 2, text: 'Verificar certificados en endpoints MCP', priority: 'Media', tag: 'Seguridad' }
  ];

  function renderTasks() {
    tasksContainer.innerHTML = '';
    tasks.forEach((t) => {
      const item = document.createElement('div');
      item.className = 'task-item';
      item.innerHTML = `
        <div class="task-meta">
          <span class="task-text">${t.text}</span>
          <span class="task-tag">🏷️ ${t.tag} • Prioridad: ${t.priority}</span>
        </div>
        <button class="btn-danger" data-id="${t.id}" onclick="window.eliminarTarea(${t.id})">✕</button>
      `;
      tasksContainer.appendChild(item);
    });
    taskCountBadge.textContent = `${tasks.length}`;
  }

  window.eliminarTarea = function (id) {
    const idx = tasks.findIndex((t) => t.id === id);
    if (idx !== -1) {
      tasks.splice(idx, 1);
      renderTasks();
      showToast('Tarea eliminada manualmente');
    }
  };

  function logTelemetry(type, message) {
    const now = new Date().toLocaleTimeString();
    const entry = document.createElement('div');
    entry.className = `log-entry ${type ? 'event-' + type : ''}`;
    entry.innerHTML = `<span class="time">[${now}]</span> ${message}`;
    telemetryLog.prepend(entry);

    while (telemetryLog.children.length > 25) {
      telemetryLog.removeChild(telemetryLog.lastChild);
    }
  }

  function showToast(message, isAgent = false) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <span>${isAgent ? '🤖 [WebMCP Agente]' : '💡 [Sistema]'}</span>
      <span>${message}</span>
    `;
    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.4s';
      setTimeout(() => toast.remove(), 400);
    }, 3500);
  }

  // ============================================================
  // 1. REGISTRO DE HERRAMIENTAS IMPERATIVAS (API WebMCP)
  // ============================================================
  async function registerImperativeTools() {
    if (!document.modelContext) {
      console.warn('[WebMCP] document.modelContext no está disponible.');
      return;
    }

    // Tool 1: agregar_tarea_urgente
    await document.modelContext.registerTool({
      name: 'agregar_tarea_urgente',
      description: 'Añade una nueva tarea al panel de operaciones de la fábrica a la vista del usuario.',
      inputSchema: {
        type: 'object',
        properties: {
          texto: { type: 'string', description: 'Descripción concreta de la tarea a registrar' },
          prioridad: { type: 'string', enum: ['Baja', 'Media', 'Alta', 'Crítica'], description: 'Nivel de urgencia' },
          etiqueta: { type: 'string', description: 'Categoría funcional (ej. Frontend, Backend, OKF)' }
        },
        required: ['texto']
      },
      async execute({ texto, prioridad = 'Media', etiqueta = 'General' }) {
        const newTask = {
          id: Date.now(),
          text: String(texto),
          prioridad: String(prioridad),
          tag: String(etiqueta)
        };
        tasks.push(newTask);
        renderTasks();
        showToast(`Tool imperativa ejecutada: Tarea "${texto}" agregada`, true);

        return {
          content: [
            {
              type: 'text',
              text: `Tarea ID ${newTask.id} creada con éxito en la UI. Total tareas: ${tasks.length}`
            }
          ]
        };
      }
    });

    // Tool 2: cambiar_estado_sistema
    await document.modelContext.registerTool({
      name: 'cambiar_estado_sistema',
      description: 'Modifica el modo operativo del sistema (Normal, Mantenimiento, Alto Rendimiento).',
      inputSchema: {
        type: 'object',
        properties: {
          modo: {
            type: 'string',
            enum: ['Normal', 'Mantenimiento', 'Alto Rendimiento'],
            description: 'Nuevo estado operativo a fijar'
          },
          motivo: { type: 'string', description: 'Razón técnica del cambio de estado' }
        },
        required: ['modo']
      },
      async execute({ modo, motivo = 'Decisión de agente' }) {
        const badge = document.getElementById('systemModeBadge');
        if (badge) {
          badge.textContent = `Modo: ${modo}`;
          badge.style.color = modo === 'Mantenimiento' ? 'var(--accent-warm)' : 'var(--accent)';
        }
        showToast(`Modo del sistema cambiado a "${modo}": ${motivo}`, true);
        return {
          content: [{ type: 'text', text: `Estado del sistema actualizado a: ${modo}. Motivo: ${motivo}` }]
        };
      }
    });

    logTelemetry('change', 'Herramientas imperativas base registradas en document.modelContext.');
  }

  // ============================================================
  // 2. HERRAMIENTA CON SEÑAL DE ABORTO (Demostración de ciclo de vida)
  // ============================================================
  window.toggleTemporaryPanicTool = async function () {
    const btn = document.getElementById('btnTogglePanic');
    if (activePanicController) {
      activePanicController.abort();
      activePanicController = null;
      btn.textContent = '➕ Activar Tool Temporal (AbortSignal)';
      btn.classList.remove('btn-danger');
      btn.classList.add('btn-secondary');
      showToast('Tool "activar_modo_panico" desregistrada con AbortController.');
      logTelemetry('change', 'Tool temporal desregistrada via signal.abort().');
    } else {
      activePanicController = new AbortController();
      btn.textContent = '🛑 Desregistrar Tool (Abortar)';
      btn.classList.remove('btn-secondary');
      btn.classList.add('btn-danger');

      await document.modelContext.registerTool({
        name: 'activar_modo_panico',
        description: 'Herramienta temporal efímera: alerta a la fábrica y detiene procesos batch.',
        inputSchema: {
          type: 'object',
          properties: {
            codigo_emergencia: { type: 'string', description: 'Código de incidente SRE' }
          },
          required: ['codigo_emergencia']
        },
        async execute({ codigo_emergencia }) {
          showToast(`🚨 ¡MODO PÁNICO ACTIVADO! Código: ${codigo_emergencia}`, true);
          return { content: [{ type: 'text', text: `Alerta SRE ${codigo_emergencia} disparada.` }] };
        }
      }, { signal: activePanicController.signal });

      showToast('Tool "activar_modo_panico" registrada temporalmente.');
      logTelemetry('change', 'Tool temporal registrada con AbortSignal activo.');
    }
  };

  // ============================================================
  // 3. API DECLARATIVA: LISTENER DE SUBMIT Y RESPONDWITH
  // ============================================================
  function setupDeclarativeListeners() {
    if (supportForm) {
      supportForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(supportForm);
        const data = Object.fromEntries(formData.entries());

        if (e.agentInvoked) {
          // Invocado por la IA mediante WebMCP
          showToast(`Formulario enviado automáticamente por Agente IA (${data.modulo})`, true);
          logTelemetry('activated', `Submit declarativo "crear_solicitud_soporte" mediado por IA.`);

          e.respondWith?.(
            Promise.resolve({
              ok: true,
              ticket_id: `TCK-${Math.floor(Math.random() * 9000 + 1000)}`,
              mensaje: `Solicitud para ${data.modulo} registrada con prioridad ${data.urgencia}.`
            })
          );
        } else {
          // Invocado manualmente por clic de usuario
          showToast(`Solicitud para "${data.modulo}" enviada manualmente por usuario.`);
          logTelemetry(null, `Submit manual de formulario por usuario.`);
        }

        // Simular feedback en UI
        supportForm.reset();
      });
    }
  }

  // ============================================================
  // 4. MODEL CONTEXT TOOL INSPECTOR & CATALOG
  // ============================================================
  async function refreshToolCatalog() {
    if (!document.modelContext) return;
    const tools = await document.modelContext.getTools();
    toolCountBadge.textContent = `${tools.length}`;
    toolCatalog.innerHTML = '';
    toolSelector.innerHTML = '';

    tools.forEach((t) => {
      // Opción en el selector
      const opt = document.createElement('option');
      opt.value = t.name;
      opt.textContent = `${t.name} (${t.type})`;
      toolSelector.appendChild(opt);

      // Tarjeta visual en el catálogo
      const card = document.createElement('div');
      card.className = 'tool-card';
      card.innerHTML = `
        <div class="tool-card-header">
          <span class="tool-name-badge">${t.name}</span>
          <span class="tool-type-tag ${t.type}">${t.type}</span>
        </div>
        <p class="tool-description">${t.description}</p>
        <div class="tool-card-footer">
          <small style="color: var(--text-muted); font-size: 0.72rem;">
            Parámetros: ${Object.keys(t.inputSchema.properties || {}).join(', ') || 'ninguno'}
          </small>
          <button class="btn-mini-run" onclick="window.cargarToolEnConsola('${t.name}')">⚡ Cargar en Consola</button>
        </div>
      `;
      toolCatalog.appendChild(card);
    });

    if (tools.length > 0 && !consoleEditor.value) {
      window.cargarToolEnConsola(tools[0].name);
    }
  }

  window.cargarToolEnConsola = async function (toolName) {
    toolSelector.value = toolName;
    const tools = await document.modelContext.getTools();
    const tool = tools.find((t) => t.name === toolName);
    if (!tool) return;

    // Generar argumentos demo a partir de las propiedades
    const sampleArgs = {};
    const props = tool.inputSchema.properties || {};
    for (const [key, meta] of Object.entries(props)) {
      if (meta.enum && meta.enum.length > 0) {
        sampleArgs[key] = meta.enum[0];
      } else if (meta.type === 'number') {
        sampleArgs[key] = 42;
      } else if (meta.type === 'boolean') {
        sampleArgs[key] = true;
      } else {
        sampleArgs[key] = key === 'texto' ? 'Optimizar consultas MCP' : `Valor de prueba para ${key}`;
      }
    }

    consoleEditor.value = JSON.stringify(sampleArgs, null, 2);
  };

  // ============================================================
  // 5. EJECUCIÓN COMO AGENTE (Live Runner)
  // ============================================================
  window.ejecutarToolSeleccionada = async function () {
    const selectedToolName = toolSelector.value;
    if (!selectedToolName) return;

    let parsedArgs = {};
    try {
      parsedArgs = JSON.parse(consoleEditor.value || '{}');
    } catch (err) {
      consoleOutput.textContent = `❌ Error en sintaxis JSON de argumentos: ${err.message}`;
      return;
    }

    consoleOutput.textContent = `⏳ Invocando ${selectedToolName} con WebMCP...`;

    try {
      const t0 = performance.now();
      const result = await document.modelContext.executeTool(selectedToolName, parsedArgs);
      const t1 = performance.now();
      const elapsed = (t1 - t0).toFixed(1);

      consoleOutput.textContent = `✅ Éxito (${elapsed}ms):\n` + JSON.stringify(result, null, 2);
      logTelemetry('activated', `Agente ejecutó "${selectedToolName}" en ${elapsed}ms.`);
    } catch (err) {
      consoleOutput.textContent = `❌ Error al ejecutar herramienta: ${err.message}`;
      logTelemetry('cancel', `Fallo al ejecutar "${selectedToolName}": ${err.message}`);
    }
  };

  // ============================================================
  // 6. SIMULACIÓN DE ENJAMBRE DE AGENTES
  // ============================================================
  window.simularSecuenciaAgente = async function () {
    showToast('Iniciando simulación de Agente Autónomo...', true);
    logTelemetry('activated', '🤖 Secuencia de agente IA iniciada.');

    // Paso 1: Agregar tarea urgente
    await new Promise((r) => setTimeout(r, 800));
    await document.modelContext.executeTool('agregar_tarea_urgente', {
      texto: 'Migrar índices de Obsidian a grafo federado',
      prioridad: 'Crítica',
      etiqueta: 'Agentes'
    });

    // Paso 2: Cambiar estado a Alto Rendimiento
    await new Promise((r) => setTimeout(r, 1200));
    await document.modelContext.executeTool('cambiar_estado_sistema', {
      modo: 'Alto Rendimiento',
      motivo: 'Demanda de procesamiento de enjambre de bots'
    });

    // Paso 3: Completar formulario declarativo
    await new Promise((r) => setTimeout(r, 1200));
    await document.modelContext.executeTool('crear_solicitud_soporte', {
      modulo: 'IndexedDB / Offline Queue',
      urgencia: 'Alta',
      descripcion: 'Latencia detectada en sincronización de fichas de campo.'
    });

    showToast('Secuencia del agente completada con éxito.', true);
  };

  // Escuchar eventos globales de WebMCP
  window.addEventListener('toolchange', (e) => {
    refreshToolCatalog();
  });

  window.addEventListener('toolactivated', (e) => {
    logTelemetry('activated', `Evento 'toolactivated': ${e.detail?.toolName}`);
  });

  window.addEventListener('toolcancel', (e) => {
    logTelemetry('cancel', `Evento 'toolcancel': ${e.detail?.toolName}`);
  });

  // Inicialización
  document.addEventListener('DOMContentLoaded', async () => {
    renderTasks();
    setupDeclarativeListeners();
    await registerImperativeTools();
    await refreshToolCatalog();

    // Actualizar indicador de estatus
    const isPolyfill = document.modelContext._isPolyfill;
    const engineBadge = document.getElementById('engineStatusText');
    if (engineBadge) {
      engineBadge.textContent = isPolyfill ? 'WebMCP (Polyfill Activo)' : 'WebMCP (Nativo Chrome 149+)';
      if (!isPolyfill) {
        engineBadge.style.color = 'var(--accent-emerald)';
      }
    }
  });
})();
