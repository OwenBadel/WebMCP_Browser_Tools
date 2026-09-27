/**
 * WebMCP Polyfill - Web Machine Control Protocol
 * Implementación de referencia y polyfill para document.modelContext
 * Basado en la propuesta W3C Web Machine Learning y Chrome WebMCP Origin Trial.
 * Compatible con la especificación estudiada en Lemon Fábrica de Software.
 */

(function () {
  'use strict';

  // Si document.modelContext ya existe nativamente, no sobreescribir completamente
  if (typeof document !== 'undefined' && document.modelContext) {
    console.info('ℹ️ [WebMCP] document.modelContext nativo detectado.');
    return;
  }

  class ModelContext extends EventTarget {
    constructor() {
      super();
      this._imperativeTools = new Map();
      this._declarativeTools = new Map();
      this._isPolyfill = true;
      this._initDeclarativeObserver();
    }

    /**
     * Registra una herramienta imperativa con su contrato JSON y función ejecutora
     * @param {Object} tool - { name, description, inputSchema, execute }
     * @param {Object} [options] - { signal: AbortSignal }
     */
    async registerTool(tool, options = {}) {
      if (!tool || !tool.name || typeof tool.name !== 'string') {
        throw new TypeError('[WebMCP] La herramienta debe contener una propiedad "name" válida.');
      }
      if (!tool.description || typeof tool.description !== 'string') {
        throw new TypeError('[WebMCP] La herramienta debe contener una "description" de texto.');
      }
      if (!tool.inputSchema || typeof tool.inputSchema !== 'object') {
        throw new TypeError('[WebMCP] La herramienta debe definir un "inputSchema" (JSON Schema).');
      }
      if (typeof tool.execute !== 'function') {
        throw new TypeError('[WebMCP] La herramienta debe implementar un callback "execute({ ... })".');
      }

      const toolEntry = {
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
        execute: tool.execute,
        type: 'imperative',
        registeredAt: new Date().toISOString()
      };

      // Manejo de desregistro mediante AbortSignal
      if (options.signal) {
        if (options.signal.aborted) {
          return;
        }
        options.signal.addEventListener('abort', () => {
          this._imperativeTools.delete(tool.name);
          this._notifyChange();
          console.debug(`[WebMCP] Herramienta imperativa desregistrada: ${tool.name}`);
        }, { once: true });
      }

      this._imperativeTools.set(tool.name, toolEntry);
      this._notifyChange();
      console.debug(`[WebMCP] Herramienta imperativa registrada: ${tool.name}`);

      return {
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema
      };
    }

    /**
     * Retorna el catálogo completo de herramientas (imperativas y declarativas)
     * @returns {Promise<Array>} Lista de tools con contratos y esquemas
     */
    async getTools() {
      this._syncDeclarativeForms();
      const allTools = [];

      for (const [name, t] of this._imperativeTools.entries()) {
        allTools.push({
          name: t.name,
          description: t.description,
          inputSchema: t.inputSchema,
          type: 'imperative'
        });
      }

      for (const [name, t] of this._declarativeTools.entries()) {
        allTools.push({
          name: t.name,
          description: t.description,
          inputSchema: t.inputSchema,
          type: 'declarative',
          formId: t.form.id || null
        });
      }

      return allTools;
    }

    /**
     * Ejecuta una herramienta por objeto tool o por nombre con los argumentos validados
     * @param {Object|string} toolOrName - Objeto tool obtenido de getTools() o nombre string
     * @param {Object} args - Parámetros de entrada de la tool
     */
    async executeTool(toolOrName, args = {}) {
      const toolName = typeof toolOrName === 'string' ? toolOrName : toolOrName?.name;
      if (!toolName) {
        throw new Error('[WebMCP] Nombre de herramienta no especificado.');
      }

      // Notificar activación de tool
      const activatedEvent = new CustomEvent('toolactivated', { detail: { toolName, args } });
      window.dispatchEvent(activatedEvent);
      this.dispatchEvent(activatedEvent);

      try {
        // 1. Buscar en imperativas
        if (this._imperativeTools.has(toolName)) {
          const tool = this._imperativeTools.get(toolName);
          const result = await tool.execute(args);
          return this._normalizeResult(result);
        }

        // 2. Buscar en declarativas
        this._syncDeclarativeForms();
        if (this._declarativeTools.has(toolName)) {
          const tool = this._declarativeTools.get(toolName);
          const result = await this._executeDeclarativeForm(tool.form, args);
          return this._normalizeResult(result);
        }

        throw new Error(`[WebMCP] Herramienta "${toolName}" no encontrada en el catálogo.`);
      } catch (err) {
        const cancelEvent = new CustomEvent('toolcancel', { detail: { toolName, error: err.message } });
        window.dispatchEvent(cancelEvent);
        this.dispatchEvent(cancelEvent);
        throw err;
      }
    }

    _normalizeResult(result) {
      if (result && Array.isArray(result.content)) {
        return result;
      }
      if (typeof result === 'string') {
        return { content: [{ type: 'text', text: result }] };
      }
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result || { ok: true }, null, 2)
          }
        ]
      };
    }

    /**
     * Ejecuta un formulario declarativo llenando campos y disparando evento de submit con agentInvoked: true
     */
    async _executeDeclarativeForm(form, args) {
      // Marcar visualmente el formulario como activo por tool
      form.classList.add('tool-form-active');

      // Llenar campos con los valores del agente
      for (const [key, value] of Object.entries(args)) {
        const input = form.elements.namedItem(key);
        if (input) {
          if (input.type === 'checkbox') {
            input.checked = Boolean(value);
          } else if (input.type === 'radio') {
            const radio = form.querySelector(`input[name="${key}"][value="${value}"]`);
            if (radio) radio.checked = true;
          } else {
            input.value = value;
          }
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }

      let responsePromise = null;

      // Crear evento de Submit personalizado con soporte agentInvoked y respondWith
      const submitEvent = new CustomEvent('submit', {
        bubbles: true,
        cancelable: true
      });
      submitEvent.agentInvoked = true;
      submitEvent.respondWith = (promise) => {
        responsePromise = promise;
      };

      const notCancelled = form.dispatchEvent(submitEvent);

      // Si tiene toolautosubmit y no se previno el comportamiento
      if (form.hasAttribute('toolautosubmit') && notCancelled && typeof form.requestSubmit === 'function') {
        form.requestSubmit();
      }

      setTimeout(() => {
        form.classList.remove('tool-form-active');
      }, 1200);

      if (responsePromise) {
        const res = await responsePromise;
        return res;
      }

      return {
        content: [
          {
            type: 'text',
            text: `Formulario "${form.getAttribute('toolname')}" completado y enviado por el agente.`
          }
        ]
      };
    }

    /**
     * Escanea el DOM en busca de etiquetas <form toolname="..."> y sintetiza sus esquemas
     */
    _syncDeclarativeForms() {
      const forms = document.querySelectorAll('form[toolname]');
      const activeToolNames = new Set();

      forms.forEach((form) => {
        const name = form.getAttribute('toolname');
        const description = form.getAttribute('tooldescription') || `Formulario WebMCP: ${name}`;
        activeToolNames.add(name);

        const properties = {};
        const required = [];

        // Escanear inputs, selects y textareas que tengan atributo 'name'
        const elements = form.querySelectorAll('input[name], select[name], textarea[name]');
        elements.forEach((el) => {
          const fieldName = el.getAttribute('name');
          const paramDesc = el.getAttribute('toolparamdescription') || el.getAttribute('placeholder') || fieldName;
          let propType = 'string';

          if (el.type === 'number' || el.type === 'range') {
            propType = 'number';
          } else if (el.type === 'checkbox') {
            propType = 'boolean';
          }

          properties[fieldName] = {
            type: propType,
            description: paramDesc
          };

          if (el.tagName.toLowerCase() === 'select') {
            const options = Array.from(el.options).map((opt) => opt.value);
            if (options.length > 0) {
              properties[fieldName].enum = options;
            }
          }

          if (el.hasAttribute('required')) {
            required.push(fieldName);
          }
        });

        const inputSchema = {
          type: 'object',
          properties,
          required
        };

        this._declarativeTools.set(name, {
          name,
          description,
          inputSchema,
          form,
          type: 'declarative'
        });
      });

      // Limpiar formularios removidos
      for (const name of this._declarativeTools.keys()) {
        if (!activeToolNames.has(name)) {
          this._declarativeTools.delete(name);
        }
      }
    }

    _initDeclarativeObserver() {
      if (typeof document === 'undefined' || typeof MutationObserver === 'undefined') return;

      const observer = new MutationObserver(() => {
        this._syncDeclarativeForms();
        this._notifyChange();
      });

      if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['toolname', 'tooldescription'] });
        this._syncDeclarativeForms();
      } else {
        document.addEventListener('DOMContentLoaded', () => {
          observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['toolname', 'tooldescription'] });
          this._syncDeclarativeForms();
        });
      }
    }

    _notifyChange() {
      const changeEvent = new CustomEvent('toolchange', {
        detail: { timestamp: Date.now() }
      });
      window.dispatchEvent(changeEvent);
      this.dispatchEvent(changeEvent);
    }
  }

  // Asignar al document global
  document.modelContext = new ModelContext();
  console.info('🚀 [WebMCP] Polyfill document.modelContext inicializado con éxito (Soporte Imperativo + Declarativo).');
})();
