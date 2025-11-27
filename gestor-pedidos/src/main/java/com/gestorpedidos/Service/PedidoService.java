package com.gestorpedidos.Service;

import com.gestorpedidos.Dto.EstadisticaClienteDTO;
import com.gestorpedidos.Dto.EstadisticaMensualDTO;
import com.gestorpedidos.Model.Pago;
import com.gestorpedidos.Model.MetodoPago;
import com.gestorpedidos.Model.Pedido;
import com.gestorpedidos.Model.EstadoPedido;
import com.gestorpedidos.Repository.PagoRepository;
import com.gestorpedidos.Repository.PedidoRepository;
import com.gestorpedidos.Util.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@Transactional
public class PedidoService {

    @Autowired
    private PedidoRepository pedidoRepository;

    @Autowired
    private PagoRepository pagoRepository;


    public List<Pedido> obtenerTodos() { return pedidoRepository.findAll(); }
    public Optional<Pedido> obtenerPorId(Long id) { return pedidoRepository.findById(id); }
    public Optional<Pedido> obtenerPorNumero(String numeroPedido) { return pedidoRepository.findByNumeroPedido(numeroPedido); }

    public Pedido crearPedido(Pedido pedido) {
        if (pedidoRepository.existsByNumeroPedido(pedido.getNumeroPedido())) {
            throw new IllegalArgumentException("Ya existe un pedido con ese número");
        }
        if (pedido.getFechaPedido() == null) { pedido.setFechaPedido(LocalDateTime.now()); }
        if (pedido.getEstado() == null) { pedido.setEstado(EstadoPedido.PENDIENTE); }
        if (pedido.getItems() != null) { pedido.getItems().forEach(item -> item.setPedido(pedido)); }
        pedido.calcularTotal();
        return pedidoRepository.save(pedido);
    }

    public Pedido actualizarPedido(Long id, Pedido pedidoActualizado) {
        return pedidoRepository.findById(id)
                .map(pedido -> {
                    pedido.setNombreCliente(pedidoActualizado.getNombreCliente());
                    pedido.setEmailCliente(pedidoActualizado.getEmailCliente());
                    pedido.setTelefonoCliente(pedidoActualizado.getTelefonoCliente());
                    pedido.setEstado(pedidoActualizado.getEstado());
                    pedido.setObservaciones(pedidoActualizado.getObservaciones());
                    if (pedidoActualizado.getItems() != null && !pedidoActualizado.getItems().isEmpty()) {
                        pedido.getItems().clear();
                        pedidoActualizado.getItems().forEach(pedido::addItem);
                    }
                    pedido.calcularTotal();
                    return pedidoRepository.save(pedido);
                })
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado con id: " + id));
    }

    public Pedido cambiarEstado(Long id, EstadoPedido nuevoEstado) {
        return pedidoRepository.findById(id).map(pedido -> {
            pedido.setEstado(nuevoEstado);
            return pedidoRepository.save(pedido);
        }).orElseThrow(() -> new RuntimeException("Pedido no encontrado con id: " + id));
    }

    public void eliminarPedido(Long id) {
        if (!pedidoRepository.existsById(id)) {
            throw new RuntimeException("Pedido no encontrado con id: " + id);
        }
        pedidoRepository.deleteById(id);
    }

    public List<Pedido> buscarPorCliente(String nombreCliente) {
        String nombreNormalizado = StringUtils.normalizar(nombreCliente);
        return pedidoRepository.findByNombreClienteContainingIgnoreCase(nombreNormalizado);
    }

    public List<Pedido> buscarPorEstado(EstadoPedido estado) { return pedidoRepository.findByEstado(estado); }
    public List<Pedido> buscarPorFechas(LocalDateTime inicio, LocalDateTime fin) { return pedidoRepository.findByFechaPedidoBetween(inicio, fin); }
    public List<Pedido> obtenerUltimosPedidos() { return pedidoRepository.findUltimosPedidos(); }

    public String generarNumeroPedido() {
        long ultimoId = pedidoRepository.count();
        return "PED-" + String.format("%04d", ultimoId + 1);
    }

    public Pedido registrarPago(Long pedidoId, Map<String, Object> payload) {
        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado con id: " + pedidoId));
        Pago nuevoPago = new Pago();
        Double monto = Double.valueOf(payload.get("monto").toString());
        String metodoPagoStr = payload.get("metodoPago").toString();
        nuevoPago.setPedido(pedido);
        nuevoPago.setMonto(monto);
        nuevoPago.setMetodoPago(MetodoPago.valueOf(metodoPagoStr));
        pedido.getPagos().add(nuevoPago);
        if (pedido.getDeuda() < 0.01) {
            pedido.setEstado(EstadoPedido.COMPLETADO);
        }
        return pedidoRepository.save(pedido);
    }

    public Optional<Pedido> buscarDatosCliente(String nombre) {
        String nombreNormalizado = StringUtils.normalizar(nombre);
        return pedidoRepository.findFirstByNombreClienteContainingIgnoreCaseOrderByFechaPedidoDesc(nombreNormalizado);
    }


    public List<EstadisticaMensualDTO> getEstadisticasMensuales(LocalDateTime inicio, LocalDateTime fin) {
        return pedidoRepository.findEstadisticasMensuales(inicio, fin);
    }

    public List<EstadisticaClienteDTO> getEstadisticasPorCliente(LocalDateTime inicio, LocalDateTime fin) {
        return pedidoRepository.findEstadisticasPorCliente(inicio, fin);
    }
}