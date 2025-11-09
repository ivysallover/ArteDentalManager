// ============================================
// ARCHIVO: PedidoController.java (Corregido)
// Ubicación: src/main/java/com/gestorpedidos/controller/
// ============================================
package com.gestorpedidos.Controller;

import com.gestorpedidos.Model.Pedido;
import com.gestorpedidos.Model.Pedido.EstadoPedido;
import com.gestorpedidos.Service.PedidoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pedidos")
// @CrossOrigin(origins = "*") // Lo movimos a la configuración global, esto no es necesario
public class PedidoController {

    @Autowired
    private PedidoService pedidoService;

    @GetMapping
    public ResponseEntity<List<Pedido>> obtenerTodos() {
        List<Pedido> pedidos = pedidoService.obtenerTodos();
        return ResponseEntity.ok(pedidos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Pedido> obtenerPorId(@PathVariable Long id) {
        return pedidoService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/numero/{numeroPedido}")
    public ResponseEntity<Pedido> obtenerPorNumero(@PathVariable String numeroPedido) {
        return pedidoService.obtenerPorNumero(numeroPedido)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Pedido> crearPedido(@Valid @RequestBody Pedido pedido) {
        try {
            Pedido nuevoPedido = pedidoService.crearPedido(pedido);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevoPedido);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Pedido> actualizarPedido(
            @PathVariable Long id,
            @Valid @RequestBody Pedido pedido) {
        try {
            Pedido pedidoActualizado = pedidoService.actualizarPedido(id, pedido);
            return ResponseEntity.ok(pedidoActualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<Pedido> cambiarEstado(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        try {
            EstadoPedido nuevoEstado = EstadoPedido.valueOf(body.get("estado"));
            Pedido pedidoActualizado = pedidoService.cambiarEstado(id, nuevoEstado);
            return ResponseEntity.ok(pedidoActualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarPedido(@PathVariable Long id) {
        try {
            pedidoService.eliminarPedido(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/buscar/cliente")
    public ResponseEntity<List<Pedido>> buscarPorCliente(@RequestParam String nombre) {
        List<Pedido> pedidos = pedidoService.buscarPorCliente(nombre);
        return ResponseEntity.ok(pedidos);
    }

    @GetMapping("/buscar/estado/{estado}")
    public ResponseEntity<List<Pedido>> buscarPorEstado(@PathVariable EstadoPedido estado) {
        List<Pedido> pedidos = pedidoService.buscarPorEstado(estado);
        return ResponseEntity.ok(pedidos);
    }

    @GetMapping("/ultimos")
    public ResponseEntity<List<Pedido>> obtenerUltimos() {
        List<Pedido> pedidos = pedidoService.obtenerUltimosPedidos();
        return ResponseEntity.ok(pedidos);
    }

    @GetMapping("/generar-numero")
    public ResponseEntity<Map<String, String>> generarNumeroPedido() {
        String numero = pedidoService.generarNumeroPedido();
        return ResponseEntity.ok(Map.of("numeroPedido", numero));
    }

    // --- MÉTODO DE PAGO MODIFICADO ---
    @PostMapping("/{id}/pagos")
    public ResponseEntity<Pedido> registrarPago(
            @PathVariable Long id,
            @RequestBody Map<String, Object> payload) { // <-- 1. Cambiado de 'Pago pago' a 'Map'
        try {
            // 2. Pasamos el 'Map' (payload) al servicio
            Pedido pedidoActualizado = pedidoService.registrarPago(id, payload);
            return ResponseEntity.ok(pedidoActualizado);
        } catch (RuntimeException e) {
            // 3. Mejoramos el manejo de errores
            return ResponseEntity.badRequest().body(null);
        }
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> manejarExcepciones(Exception e) {
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
    }
    // Dentro de la clase PedidoController

    @GetMapping("/buscar-cliente-data")
    public ResponseEntity<Pedido> buscarDatosCliente(@RequestParam String nombre) {
        return pedidoService.buscarDatosCliente(nombre)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

}