// ============================================
// ARCHIVO: App.jsx
// Ubicación: frontend-pedidos/src/App.jsx
// ============================================

import React, { useState, useEffect } from 'react';
import { X, Plus, Edit2, Trash2, Search, Package, Clock, CheckCircle, XCircle } from 'lucide-react';

const API_URL = 'http://localhost:8080/api/pedidos';

const ESTADOS = {
  PENDIENTE: { label: 'Pendiente', color: 'bg-yellow-500', icon: Clock },
  EN_PROCESO: { label: 'En Proceso', color: 'bg-blue-500', icon: Package },
  COMPLETADO: { label: 'Completado', color: 'bg-green-500', icon: CheckCircle },
  CANCELADO: { label: 'Cancelado', color: 'bg-red-500', icon: XCircle }
};

export default function GestorPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('TODOS');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [pedidoActual, setPedidoActual] = useState(null);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    cargarPedidos();
  }, []);

  const cargarPedidos = async () => {
    setCargando(true);
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setPedidos(data);
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
      alert('Error al cargar los pedidos. Asegúrate que el backend esté corriendo en puerto 8080');
    } finally {
      setCargando(false);
    }
  };

  const eliminarPedido = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este pedido?')) return;

    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      cargarPedidos();
    } catch (error) {
      console.error('Error al eliminar:', error);
      alert('Error al eliminar el pedido');
    }
  };

  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      await fetch(`${API_URL}/${id}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado })
      });
      cargarPedidos();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
    }
  };

  const abrirModal = (pedido = null) => {
    setPedidoActual(pedido);
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setPedidoActual(null);
    setMostrarModal(false);
  };

  const pedidosFiltrados = pedidos.filter(p => {
    const cumpleFiltroTexto = p.nombreCliente.toLowerCase().includes(filtro.toLowerCase()) ||
                               p.numeroPedido.toLowerCase().includes(filtro.toLowerCase());
    const cumpleFiltroEstado = estadoFiltro === 'TODOS' || p.estado === estadoFiltro;
    return cumpleFiltroTexto && cumpleFiltroEstado;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
            <Package className="text-indigo-600" size={40} />
            Gestor de Pedidos
          </h1>
          <p className="text-gray-600">Sistema de gestión con Spring Boot + React</p>
        </div>

        {/* Controles */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por cliente o número de pedido..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
              />
            </div>

            <select
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              value={estadoFiltro}
              onChange={(e) => setEstadoFiltro(e.target.value)}
            >
              <option value="TODOS">Todos los estados</option>
              {Object.entries(ESTADOS).map(([key, val]) => (
                <option key={key} value={key}>{val.label}</option>
              ))}
            </select>

            <button
              onClick={() => abrirModal()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
            >
              <Plus size={20} />
              Nuevo Pedido
            </button>
          </div>
        </div>

        {/* Lista de Pedidos */}
        {cargando ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600">Cargando pedidos...</p>
          </div>
        ) : pedidosFiltrados.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <Package className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No hay pedidos</h3>
            <p className="text-gray-600">Crea tu primer pedido haciendo clic en "Nuevo Pedido"</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {pedidosFiltrados.map((pedido) => (
              <TarjetaPedido
                key={pedido.id}
                pedido={pedido}
                onEditar={() => abrirModal(pedido)}
                onEliminar={() => eliminarPedido(pedido.id)}
                onCambiarEstado={cambiarEstado}
              />
            ))}
          </div>
        )}

        {/* Modal */}
        {mostrarModal && (
          <ModalPedido
            pedido={pedidoActual}
            onCerrar={cerrarModal}
            onGuardar={cargarPedidos}
          />
        )}
      </div>
    </div>
  );
}

function TarjetaPedido({ pedido, onEditar, onEliminar, onCambiarEstado }) {
  const estadoInfo = ESTADOS[pedido.estado];
  const IconoEstado = estadoInfo.icon;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-bold text-gray-800">{pedido.numeroPedido}</h3>
            <span className={`${estadoInfo.color} text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1`}>
              <IconoEstado size={14} />
              {estadoInfo.label}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Cliente</p>
              <p className="font-semibold text-gray-800">{pedido.nombreCliente}</p>
            </div>
            <div>
              <p className="text-gray-600">Email</p>
              <p className="font-semibold text-gray-800">{pedido.emailCliente}</p>
            </div>
            <div>
              <p className="text-gray-600">Teléfono</p>
              <p className="font-semibold text-gray-800">{pedido.telefonoCliente}</p>
            </div>
            <div>
              <p className="text-gray-600">Total</p>
              <p className="font-bold text-indigo-600 text-lg">${pedido.total?.toFixed(2) || '0.00'}</p>
            </div>
          </div>

          {pedido.items && pedido.items.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-gray-600 text-sm mb-2">Items ({pedido.items.length})</p>
              <div className="space-y-1">
                {pedido.items.map((item, idx) => (
                  <p key={idx} className="text-sm text-gray-700">
                    • {item.nombreProducto} - Cant: {item.cantidad} - ${item.precioUnitario}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 ml-4">
          <select
            value={pedido.estado}
            onChange={(e) => onCambiarEstado(pedido.id, e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            {Object.entries(ESTADOS).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>

          <button
            onClick={onEditar}
            className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            <Edit2 size={18} />
          </button>

          <button
            onClick={onEliminar}
            className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalPedido({ pedido, onCerrar, onGuardar }) {
  const [form, setForm] = useState({
    numeroPedido: '',
    nombreCliente: '',
    emailCliente: '',
    telefonoCliente: '',
    estado: 'PENDIENTE',
    observaciones: '',
    items: []
  });

  useEffect(() => {
    if (pedido) {
      setForm(pedido);
    } else {
      generarNumeroPedido();
    }
  }, [pedido]);

  const generarNumeroPedido = async () => {
    try {
      const response = await fetch(`${API_URL}/generar-numero`);
      const data = await response.json();
      setForm(prev => ({ ...prev, numeroPedido: data.numeroPedido }));
    } catch (error) {
      setForm(prev => ({ ...prev, numeroPedido: `PED-${Date.now()}` }));
    }
  };

  const handleGuardar = async () => {
    if (!form.nombreCliente || !form.emailCliente || !form.telefonoCliente) {
      alert('Por favor completa los campos obligatorios (Cliente, Email, Teléfono)');
      return;
    }

    try {
      const method = pedido ? 'PUT' : 'POST';
      const url = pedido ? `${API_URL}/${pedido.id}` : API_URL;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (response.ok) {
        onGuardar();
        onCerrar();
      } else {
        const error = await response.text();
        alert('Error al guardar el pedido: ' + error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar el pedido');
    }
  };

  const agregarItem = () => {
    setForm(prev => ({
      ...prev,
      items: [...prev.items, { nombreProducto: '', descripcion: '', cantidad: 1, precioUnitario: 0 }]
    }));
  };

  const actualizarItem = (index, campo, valor) => {
    setForm(prev => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [campo]: valor } : item
      )
    }));
  };

  const eliminarItem = (index) => {
    setForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold text-gray-800">
            {pedido ? 'Editar Pedido' : 'Nuevo Pedido'}
          </h2>
          <button onClick={onCerrar} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Número de Pedido *
              </label>
              <input
                type="text"
                value={form.numeroPedido}
                onChange={(e) => setForm({...form, numeroPedido: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Estado
              </label>
              <select
                value={form.estado}
                onChange={(e) => setForm({...form, estado: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                {Object.entries(ESTADOS).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nombre del Cliente *
              </label>
              <input
                type="text"
                value={form.nombreCliente}
                onChange={(e) => setForm({...form, nombreCliente: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={form.emailCliente}
                onChange={(e) => setForm({...form, emailCliente: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Teléfono *
              </label>
              <input
                type="tel"
                value={form.telefonoCliente}
                onChange={(e) => setForm({...form, telefonoCliente: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Observaciones
              </label>
              <textarea
                value={form.observaciones}
                onChange={(e) => setForm({...form, observaciones: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                rows="3"
              />
            </div>
          </div>

          {/* Items */}
          <div className="border-t pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">Items del Pedido</h3>
              <button
                onClick={agregarItem}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Plus size={18} />
                Agregar Item
              </button>
            </div>

            <div className="space-y-4">
              {form.items.map((item, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <input
                      type="text"
                      placeholder="Nombre del producto *"
                      value={item.nombreProducto}
                      onChange={(e) => actualizarItem(index, 'nombreProducto', e.target.value)}
                      className="px-3 py-2 border rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="Descripción *"
                      value={item.descripcion}
                      onChange={(e) => actualizarItem(index, 'descripcion', e.target.value)}
                      className="px-3 py-2 border rounded-lg"
                    />
                    <input
                      type="number"
                      placeholder="Cantidad *"
                      min="1"
                      value={item.cantidad}
                      onChange={(e) => actualizarItem(index, 'cantidad', parseInt(e.target.value) || 1)}
                      className="px-3 py-2 border rounded-lg"
                    />
                    <input
                      type="number"
                      placeholder="Precio unitario *"
                      min="0"
                      step="0.01"
                      value={item.precioUnitario}
                      onChange={(e) => actualizarItem(index, 'precioUnitario', parseFloat(e.target.value) || 0)}
                      className="px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-700">
                      Subtotal: ${(item.cantidad * item.precioUnitario || 0).toFixed(2)}
                    </span>
                    <button
                      onClick={() => eliminarItem(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <button
              onClick={onCerrar}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleGuardar}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold"
            >
              {pedido ? 'Actualizar' : 'Crear'} Pedido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}