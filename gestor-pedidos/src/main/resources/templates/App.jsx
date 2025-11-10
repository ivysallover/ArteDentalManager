<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Gestor de Pedidos</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>

<body>
  <div id="root"></div>

  <script type="text/babel">

    // === INICIO DEL CÓDIGO ===

    // Iconos
    const X = () => '❌';
    const Plus = () => '➕';
    const Edit2 = () => '✏️';
    const Trash2 = () => '🗑️';
    const Search = () => '🔍';
    const Package = () => '📦';
    const Clock = () => '🕒';
    const CheckCircle = () => '✅';
    const XCircle = () => '❌';
    const Money = () => '💵';
    const UserIcon = () => '👤';
    const ChartIcon = () => '📊';
    const ListIcon = () => '📋';

    const { useState, useEffect } = React;
    const API_URL = 'http://localhost:8080/api/pedidos';

    // Constantes
    const ESTADOS = {
      PENDIENTE: { label: 'Pendiente', color: 'bg-yellow-500', icon: Clock },
      EN_PROCESO: { label: 'En Proceso', color: 'bg-blue-500', icon: Package },
      COMPLETADO: { label: 'Completado', color: 'bg-green-500', icon: CheckCircle },
      CANCELADO: { label: 'Cancelado', color: 'bg-red-500', icon: XCircle }
    };
    const METODOS_PAGO = {
      EFECTIVO: "Efectivo",
      TRANSFERENCIA: "Transferencia",
      TARJETA_DEBITO: "Tarjeta de Débito",
      TARJETA_CREDITO: "Tarjeta de Crédito",
      OTRO: "Otro"
    };

    // Funciones "ayudante"
    function formatarFecha(fechaString) {
      if (!fechaString) return 'N/A';
      return new Date(fechaString).toLocaleString('es-AR', {
        day: 'numeric', month: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    }
    
    // Componente Botón de Pestaña
    function BotonPestaña({ titulo, icono, activo, onClick }) {
      const Icono = icono;
      const clasesBase = "py-4 px-6 font-semibold text-lg cursor-pointer transition-colors flex items-center gap-2";
      const clasesActivo = "border-b-4 border-indigo-600 text-indigo-600";
      const clasesInactivo = "text-gray-500 hover:text-gray-800 border-b-4 border-transparent";
      return ( <button onClick={onClick} className={`${clasesBase} ${activo ? clasesActivo : clasesInactivo}`}> <Icono /> {titulo} </button> );
    }
    
    // Componente Vista de Estadísticas (placeholder)
    function VistaEstadisticas() {
      return (
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-3">
             <ChartIcon /> Estadísticas Mensuales
          </h2>
          <p className="text-gray-600 text-lg">Esta función está en construcción.</p>
          <p className="mt-4">
            ¡Próximamente, aquí podrás ver un resumen de tus ventas, pedidos y ganancias mes a mes!
          </p>
        </div>
      );
    }

    // --- Componente Principal ---
    function GestorPedidos() {
      const [pedidos, setPedidos] = useState([]);
      const [filtro, setFiltro] = useState('');
      const [pestañaActual, setPestañaActual] = useState('PEDIDOS');
      const [mostrarModal, setMostrarModal] = useState(false);
      const [pedidoActual, setPedidoActual] = useState(null);
      const [cargando, setCargando] = useState(false);
      const [modalPago, setModalPago] = useState({ visible: false, pedido: null });

      // Cargar pedidos al inicio
      useEffect(() => { cargarPedidos(); }, []);

      // --- Funciones de API (sin cambios) ---
      const cargarPedidos = async () => {
        setCargando(true);
        try {
          const response = await fetch(API_URL);
          const data = await response.json();
          setPedidos(data);
        } catch (error) { console.error('Error al cargar pedidos:', error); alert('Error al cargar los pedidos.'); } 
        finally { setCargando(false); }
      };
      const eliminarPedido = async (id) => {
        if (!confirm('¿Estás seguro de eliminar este pedido?')) return;
        try {
          await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
          cargarPedidos();
        } catch (error) { console.error('Error al eliminar:', error); alert('Error al eliminar el pedido'); }
      };
      const cambiarEstado = async (id, nuevoEstado) => {
        try {
          await fetch(`${API_URL}/${id}/estado`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado: nuevoEstado })
          });
          cargarPedidos();
        } catch (error) { console.error('Error al cambiar estado:', error); }
      };
      const handleRegistrarPago = async (pedidoId, nuevoPago) => {
        try {
          const response = await fetch(`${API_URL}/${pedidoId}/pagos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevoPago)
          });
          if (!response.ok) throw new Error('Error del servidor');
          await cargarPedidos();
          cerrarModalPago();
        } catch (error) { console.error("Error al registrar pago:", error); alert("No se pudo registrar el pago."); }
      };
      
      // Handlers de Modales
      const abrirModalPago = (pedido) => setModalPago({ visible: true, pedido: pedido });
      const cerrarModalPago = () => setModalPago({ visible: false, pedido: null });
      const abrirModal = (pedido = null) => { setPedidoActual(pedido); setMostrarModal(true); };
      const cerrarModal = () => { setPedidoActual(null); setMostrarModal(false); };

      
      // --- Lógica de Filtrado y Agrupación (sin cambios) ---
      const pedidosFiltrados = pedidos.filter(p => {
        if (pestañaActual === 'PEDIDOS' && (p.estado === 'COMPLETADO' || p.estado === 'CANCELADO')) return false;
        if (pestañaActual === 'COMPLETOS' && (p.estado !== 'COMPLETADO' && p.estado !== 'CANCELADO')) return false;
        return p.nombreCliente.toLowerCase().includes(filtro.toLowerCase()) ||
               p.numeroPedido.toLowerCase().includes(filtro.toLowerCase());
      });
      const pedidosAgrupados = pedidosFiltrados.reduce((grupos, pedido) => {
        const cliente = pedido.nombreCliente;
        if (!grupos[cliente]) {
          grupos[cliente] = { pedidos: [], deudaTotalCliente: 0 };
        }
        grupos[cliente].pedidos.push(pedido);
        grupos[cliente].deudaTotalCliente += pedido.deuda;
        return grupos;
      }, {});
      const gruposDeClientes = Object.entries(pedidosAgrupados)
        .map(([nombre, data]) => ({ nombreCliente: nombre, ...data }))
        .sort((a, b) => a.nombreCliente.localeCompare(b.nombreCliente));


      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
          <div className="max-w-7xl mx-auto">
            
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                    <Package /> Gestor de Pedidos
                  </h1>
                  <p className="text-gray-600">Sistema de gestión con Spring Boot + React</p>
                </div>
                <img 
                  src="http://localhost:8080/logo.png"
                  alt="Logo de la Empresa" 
                  className="h-[200px] w-auto"
                />
              </div>
            </div>

            {/* Navegación de Pestañas */}
            <div className="mb-6">
              <div className="flex border-b border-gray-300 bg-white/50 rounded-t-lg shadow-sm">
                <BotonPestaña 
                  titulo="Pedidos Activos" 
                  icono={ListIcon}
                  activo={pestañaActual === 'PEDIDOS'} 
                  onClick={() => setPestañaActual('PEDIDOS')} 
                />
                <BotonPestaña 
                  titulo="Pedidos Completos" 
                  icono={CheckCircle}
                  activo={pestañaActual === 'COMPLETOS'} 
                  onClick={() => setPestañaActual('COMPLETOS')} 
                />
                <BotonPestaña 
                  titulo="Estadísticas" 
                  icono={ChartIcon}
                  activo={pestañaActual === 'ESTADISTICAS'} 
                  onClick={() => setPestañaActual('ESTADISTICAS')} 
                />
              </div>
            </div>
            
            {/* --- CONTENIDO CONDICIONAL POR PESTAÑA --- */}
            
            {pestañaActual !== 'ESTADISTICAS' && (
              <>
                {/* Controles */}
                <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                      <span className="absolute left-3 top-3.5 text-gray-400"><Search /></span>
                      <input type="text"
                        placeholder="Buscar por cliente o número de pedido..."
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        value={filtro}
                        onChange={(e) => setFiltro(e.target.value)}
                      />
                    </div>
                    <button
                      onClick={() => abrirModal()}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                    >
                      <Plus /> Nuevo Pedido
                    </button>
                  </div>
                </div>

                {/* Lista de Pedidos Agrupada */}
                {cargando ? (
                  <div className="text-center py-12"> <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div> <p className="mt-4 text-gray-600">Cargando pedidos...</p> </div>
                ) : gruposDeClientes.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-xl p-12 text-center"> <div className="mx-auto text-gray-400 mb-4 text-6xl"><Package /></div> <h3 className="text-2xl font-bold text-gray-800 mb-2">No hay pedidos</h3> <p className="text-gray-600">No se encontraron pedidos en esta sección.</p> </div>
                ) : (
                  <div className="space-y-6">
                    {gruposDeClientes.map((grupo) => (
                      <div key={grupo.nombreCliente} className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg p-6">
                        <div className="flex justify-between items-center mb-4 pb-4 border-b">
                          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <UserIcon /> {grupo.nombreCliente}
                          </h2>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Deuda Total del Cliente</p>
                            <p className={`text-2xl font-bold ${grupo.deudaTotalCliente > 0.01 ? 'text-red-600' : 'text-green-600'}`}>
                              ${grupo.deudaTotalCliente.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <div className="grid gap-4">
                          {grupo.pedidos.map((pedido) => (
                            <TarjetaPedido
                              key={pedido.id}
                              pedido={pedido}
                              onEditar={() => abrirModal(pedido)}
                              onEliminar={() => eliminarPedido(pedido.id)}
                              onCambiarEstado={cambiarEstado}
                              onAbrirPago={() => abrirModalPago(pedido)}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {pestañaActual === 'ESTADISTICAS' && (
              <VistaEstadisticas />
            )}
            
            {/* --- MODALES --- */}
            {mostrarModal && (
              <ModalPedido
                pedido={pedidoActual}
                onCerrar={cerrarModal}
                onGuardar={cargarPedidos}
              />
            )}
            
            {modalPago.visible && (
              <ModalPago
                pedido={modalPago.pedido}
                onCerrar={cerrarModalPago}
                onGuardarPago={handleRegistrarPago}
              />
            )}
            
          </div>
        </div>
      );
    }

    // --- Componente TarjetaPedido (sin cambios) ---
    function TarjetaPedido({ pedido, onEditar, onEliminar, onCambiarEstado, onAbrirPago }) {
      const estadoInfo = ESTADOS[pedido.estado];
      const IconoEstado = estadoInfo.icon;
      const deuda = pedido.deuda;
      return (
        <div className="bg-white rounded-xl shadow-lg p-5 hover:shadow-2xl transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-bold text-gray-800">{pedido.numeroPedido}</h3>
                <span className={`${estadoInfo.color} text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1`}>
                  <IconoEstado />
                  {estadoInfo.label}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 text-sm">
                <div><p className="text-gray-600">Fecha</p><p className="font-semibold text-gray-800">{formatarFecha(pedido.fechaPedido)}</p></div>
                <div><p className="text-gray-600">Teléfono</p><p className="font-semibold text-gray-800">{pedido.telefonoCliente}</p></div>
                <div className="font-bold col-span-2 md:col-span-1">
                  <p className="text-gray-600">Deuda del Pedido</p>
                  <p className={`text-lg ${deuda > 0.01 ? 'text-red-600' : 'text-green-600'}`}>${deuda?.toFixed(2)}</p>
                </div>
              </div>
              {pedido.items && pedido.items.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-gray-600 text-sm mb-1">Items ({pedido.items.length})</p>
                  <div className="space-y-1">{pedido.items.map((item, idx) => (<p key={idx} className="text-xs text-gray-700">• {item.nombreProducto} ({item.cantidad}x)</p>))}</div>
                </div>
              )}
              {pedido.pagos && pedido.pagos.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-gray-600 text-sm mb-1">Pagos ({pedido.pagos.length})</p>
                  <div className="space-y-1">{pedido.pagos.map((pago) => (<p key={pago.id} className="text-xs text-green-700">• ${pago.monto?.toFixed(2)}<span className="text-gray-500"> ({METODOS_PAGO[pago.metodoPago]})</span></p>))}</div>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2 ml-4">
              <button onClick={onAbrirPago} className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex justify-center items-center gap-1 text-sm"><Money /> Pagar</button>
              <button onClick={onEditar} className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex justify-center"><Edit2 /></button>
              <button onClick={onEliminar} className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex justify-center"><Trash2 /></button>
            </div>
          </div>
        </div>
      );
    }
    
    // --- Componente ModalPedido (¡CON AUTOCOMPLETAR CORREGIDO!) ---
    function ModalPedido({ pedido, onCerrar, onGuardar }) {
      
      // Estado inicial del formulario
      const [form, setForm] = useState(() => {
        if (pedido) return pedido; // Si es para editar, usa el pedido
        // Si es nuevo, usa un objeto vacío
        return {
          numeroPedido: '', nombreCliente: '', emailCliente: '', telefonoCliente: '',
          estado: 'PENDIENTE', observaciones: '', items: []
        };
      });

      // Efecto para generar número de pedido (solo si es NUEVO)
      useEffect(() => {
        if (!pedido) {
          generarNumeroPedido();
        }
      }, [pedido]); // Se ejecuta solo si 'pedido' cambia

      const generarNumeroPedido = async () => {
        try {
          const response = await fetch(`${API_URL}/generar-numero`);
          const data = await response.json();
          setForm(prev => ({ ...prev, numeroPedido: data.numeroPedido }));
        } catch (error) { setForm(prev => ({ ...prev, numeroPedido: `PED-${Date.now()}` })); }
      };

      // --- ¡FUNCIÓN DE AUTOCOMPLETAR EN SU LUGAR CORRECTO! ---
      const handleClienteBlur = async () => {
        // 1. No buscar si el nombre está vacío o si es un pedido que ya existe
        if (!form.nombreCliente || pedido) {
          return;
        }
        // 2. No rellenar si el usuario ya escribió un email
        if (form.emailCliente) {
          return;
        }

        try {
          // 3. Llamamos al nuevo "enchufe" del backend
          const response = await fetch(`${API_URL}/buscar-cliente-data?nombre=${form.nombreCliente}`);
          
          if (response.ok) {
            const data = await response.json();
            // 4. ¡Rellenamos el formulario!
            setForm(prev => ({
              ...prev,
              emailCliente: data.emailCliente,
              telefonoCliente: data.telefonoCliente
            }));
          }
          // Si no se encuentra (404), no hacemos nada, es un cliente nuevo.
        } catch (error) {
          console.error('Error al buscar cliente:', error);
        }
      };
      
      // Handler para guardar
      const handleSubmit = async (e) => { e.preventDefault(); try {
          const method = pedido ? 'PUT' : 'POST';
          const url = pedido ? `${API_URL}/${pedido.id}` : API_URL;
          const response = await fetch(url, {
            method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form)
          });
          if (response.ok) { onGuardar(); onCerrar(); } else { alert('Error al guardar el pedido'); }
      } catch (error) { console.error('Error:', error); alert('Error al guardar el pedido'); } };

      // Handlers de Items
      const agregarItem = () => setForm(prev => ({ ...prev, items: [...(prev.items || []), { nombreProducto: '', descripcion: '', cantidad: 1, precioUnitario: 0 }] }));
      const actualizarItem = (index, campo, valor) => setForm(prev => ({ ...prev, items: prev.items.map((item, i) => i === index ? { ...item, [campo]: valor } : item) }));
      const eliminarItem = (index) => setForm(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));

      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">{pedido ? 'Editar Pedido' : 'Nuevo Pedido'}</h2>
              <button onClick={onCerrar} className="p-2 hover:bg-gray-100 rounded-lg"><X /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Formulario de Pedido */}
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-semibold text-gray-700 mb-2">Número de Pedido</label>
                  <input type="text" required value={form.numeroPedido} onChange={(e) => setForm({...form, numeroPedido: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div><label className="block text-sm font-semibold text-gray-700 mb-2">Estado</label>
                  <select value={form.estado} onChange={(e) => setForm({...form, estado: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500">
                    {Object.entries(ESTADOS).map(([key, val]) => (<option key={key} value={key}>{val.label}</option>))}
                  </select>
                </div>
                <div><label className="block text-sm font-semibold text-gray-700 mb-2">Nombre del Cliente *</label>
                  {/* --- ¡INPUT CORREGIDO CON ONBLUR! --- */}
                  <input type="text" required value={form.nombreCliente} 
                    onChange={(e) => setForm({...form, nombreCliente: e.target.value})}
                    onBlur={handleClienteBlur}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div><label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                  <input type="email" required value={form.emailCliente} onChange={(e) => setForm({...form, emailCliente: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="col-span-2"><label className="block text-sm font-semibold text-gray-700 mb-2">Teléfono *</label>
                  <input type="tel" required value={form.telefonoCliente} onChange={(e) => setForm({...form, telefonoCliente: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="col-span-2"><label className="block text-sm font-semibold text-gray-700 mb-2">Observaciones</label>
                  <textarea value={form.observaciones} onChange={(e) => setForm({...form, observaciones: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" rows="3" />
                </div>
              </div>
              
              {/* Formulario de Items (sin cambios) */}
              <div className="border-t pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-gray-800">Items del Pedido</h3>
                  <button type="button" onClick={agregarItem} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"><Plus /> Agregar Item</button>
                </div>
                <div className="space-y-4">
                  {form.items?.map((item, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <input type="text" placeholder="Nombre del producto *" required value={item.nombreProducto} onChange={(e) => actualizarItem(index, 'nombreProducto', e.target.value)} className="px-3 py-2 border rounded-lg" />
                        <input type="text" placeholder="Descripción *" required value={item.descripcion} onChange={(e) => actualizarItem(index, 'descripcion', e.target.value)} className="px-3 py-2 border rounded-lg" />
                        <input type="number" placeholder="Cantidad *" required min="1" value={item.cantidad} onChange={(e) => actualizarItem(index, 'cantidad', parseInt(e.target.value))} className="px-3 py-2 border rounded-lg" />
                        <input type="number" placeholder="Precio unitario *" required min="0.01" step="0.01" value={item.precioUnitario} onChange={(e) => actualizarItem(index, 'precioUnitario', parseFloat(e.target.value))} className="px-3 py-2 border rounded-lg" />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-gray-700">Subtotal: ${(item.cantidad * item.precioUnitario || 0).toFixed(2)}</span>
                        <button type="button" onClick={() => eliminarItem(index)} className="text-red-500 hover:text-red-700"><Trash2 /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Botones de Guardar/Cancelar */}
              <div className="flex justify-end gap-3 pt-6 border-t">
                <button type="button" onClick={onCerrar} className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">Cancelar</button>
                <button type="submit" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold">{pedido ? 'Actualizar' : 'Crear'} Pedido</button>
              </div>
            </form>
          </div>
        </div>
      );
    }
    
    // --- Componente ModalPago (sin cambios) ---
    function ModalPago({ pedido, onCerrar, onGuardarPago }) {
      const [monto, setMonto] = useState(pedido.deuda);
      const [metodoPago, setMetodoPago] = useState('EFECTIVO');
      const [error, setError] = useState('');

      const handleSubmit = (e) => { e.preventDefault(); setError('');
        if (!monto || monto <= 0) { setError('El monto debe ser mayor a 0'); return; }
        if (monto > pedido.deuda + 0.01) { setError('El monto no puede ser mayor a la deuda restante'); return; }
        onGuardarPago(pedido.id, { monto: monto, metodoPago: metodoPago });
      };

      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
            <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Registrar Pago</h2>
              <button onClick={onCerrar} className="p-2 hover:bg-gray-100 rounded-lg"><X /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <p className="text-sm text-gray-600">Pedido N°:</p><h3 className="text-lg font-bold">{pedido.numeroPedido}</h3>
                <p className="text-sm text-gray-600">Cliente:</p><h3 className="text-lg font-bold">{pedido.nombreCliente}</h3>
                <p className="mt-2 text-sm text-gray-600">Deuda actual:</p><h3 className="text-2xl font-bold text-red-600">${pedido.deuda?.toFixed(2)}</h3>
              </div>
              <div className="border-t pt-4 space-y-4">
                <div><label className="block text-sm font-semibold text-gray-700 mb-2">Monto a Pagar *</label><input type="number" step="0.01" min="0.01" max={pedido.deuda} value={monto} onChange={(e) => setMonto(parseFloat(e.target.value))} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" required /></div>
                <div><label className="block text-sm font-semibold text-gray-700 mb-2">Método de Pago *</label><select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500">{Object.entries(METODOS_PAGO).map(([key, label]) => (<option key={key} value={key}>{label}</option>))}</select></div>
              </div>
              {error && (<p className="text-red-500 text-sm">{error}</p>)}
              <div className="flex justify-end gap-3 pt-6 border-t">
                <button type="button" onClick={onCerrar} className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">Cancelar</button>
                <button type="submit" className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold">Registrar Pago</button>
              </div>
            </form>
          </div>
        </div>
      );
    }
    
    // === FIN DE TU CÓDIGO ===

    // --- Esto es lo que inicia todo ---
    const domNode = document.getElementById('root');
    const root = ReactDOM.createRoot(domNode);
    root.render(<GestorPedidos />);

  </script>
</body>
</html>