
package com.gestorpedidos.Controller;

import com.gestorpedidos.Dto.EstadisticaClienteDTO;
import com.gestorpedidos.Dto.EstadisticaMensualDTO;
import com.gestorpedidos.Model.Pago;
import com.gestorpedidos.Model.Pedido;
import com.gestorpedidos.Model.Pedido.EstadoPedido;
import com.gestorpedidos.Service.PedidoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {

    @Autowired
    private PedidoService pedidoService;

    @GetMapping
    public ResponseEntity<List<Pedido>> obtenerTodos() { return ResponseEntity.ok(pedidoService.obtenerTodos()); }

    @GetMapping("/{id}")
    public ResponseEntity<Pedido> obtenerPorId(@PathVariable Long id) { return pedidoService.obtenerPorId(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build()); }

    @GetMapping("/numero/{numeroPedido}")
    public ResponseEntity<Pedido> obtenerPorNumero(@PathVariable String numeroPedido) { return pedidoService.obtenerPorNumero(numeroPedido).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build()); }

    @PostMapping
    public ResponseEntity<Pedido> crearPedido(@Valid @RequestBody Pedido pedido) { try { Pedido nuevoPedido = pedidoService.crearPedido(pedido); return ResponseEntity.status(HttpStatus.CREATED).body(nuevoPedido); } catch (IllegalArgumentException e) { return ResponseEntity.badRequest().build(); } }

    @PutMapping("/{id}")
    public ResponseEntity<Pedido> actualizarPedido(@PathVariable Long id, @Valid @RequestBody Pedido pedido) { try { Pedido pedidoActualizado = pedidoService.actualizarPedido(id, pedido); return ResponseEntity.ok(pedidoActualizado); } catch (RuntimeException e) { return ResponseEntity.notFound().build(); } }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<Pedido> cambiarEstado(@PathVariable Long id, @RequestBody Map<String, Object> body) { try { EstadoPedido nuevoEstado = EstadoPedido.valueOf(body.get("estado").toString()); Pedido pedidoActualizado = pedidoService.cambiarEstado(id, nuevoEstado); return ResponseEntity.ok(pedidoActualizado); } catch (RuntimeException e) { return ResponseEntity.badRequest().build(); } }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarPedido(@PathVariable Long id) { try { pedidoService.eliminarPedido(id); return ResponseEntity.noContent().build(); } catch (RuntimeException e) { return ResponseEntity.notFound().build(); } }

    @GetMapping("/buscar/cliente")
    public ResponseEntity<List<Pedido>> buscarPorCliente(@RequestParam String nombre) { return ResponseEntity.ok(pedidoService.buscarPorCliente(nombre)); }

    @GetMapping("/buscar/estado/{estado}")
    public ResponseEntity<List<Pedido>> buscarPorEstado(@PathVariable EstadoPedido estado) { return ResponseEntity.ok(pedidoService.buscarPorEstado(estado)); }

    @GetMapping("/ultimos")
    public ResponseEntity<List<Pedido>> obtenerUltimos() { return ResponseEntity.ok(pedidoService.obtenerUltimosPedidos()); }

    @GetMapping("/generar-numero")
    public ResponseEntity<Map<String, String>> generarNumeroPedido() { return ResponseEntity.ok(Map.of("numeroPedido", pedidoService.generarNumeroPedido())); }

    @PostMapping("/{id}/pagos")
    public ResponseEntity<Pedido> registrarPago(@PathVariable Long id, @RequestBody Map<String, Object> payload) { try { Pedido pedidoActualizado = pedidoService.registrarPago(id, payload); return ResponseEntity.ok(pedidoActualizado); } catch (RuntimeException e) { return ResponseEntity.badRequest().body(null); } }

    @GetMapping("/buscar-cliente-data")
    public ResponseEntity<Pedido> buscarDatosCliente(@RequestParam String nombre) {
        return pedidoService.buscarDatosCliente(nombre)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> manejarExcepciones(Exception e) { return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage())); }

    @GetMapping("/estadisticas")
    public ResponseEntity<List<EstadisticaMensualDTO>> getEstadisticas(
            @RequestParam("inicio") LocalDateTime inicio,
            @RequestParam("fin") LocalDateTime fin) {

        List<EstadisticaMensualDTO> stats = pedidoService.getEstadisticasMensuales(inicio, fin);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/estadisticas-clientes")
    public ResponseEntity<List<EstadisticaClienteDTO>> getEstadisticasPorCliente(
            @RequestParam("inicio") LocalDateTime inicio,
            @RequestParam("fin") LocalDateTime fin) {

        List<EstadisticaClienteDTO> stats = pedidoService.getEstadisticasPorCliente(inicio, fin);
        return ResponseEntity.ok(stats);
    }
}