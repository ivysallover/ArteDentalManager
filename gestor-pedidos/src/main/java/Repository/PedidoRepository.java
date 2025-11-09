// ============================================
// ARCHIVO 4: PedidoRepository.java
// Ubicación: src/main/java/com/gestorpedidos/repository/
// ============================================
package com.gestorpedidos.Repository;

import com.gestorpedidos.Model.Pedido;
import com.gestorpedidos.Model.Pedido.EstadoPedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    Optional<Pedido> findByNumeroPedido(String numeroPedido);

    List<Pedido> findByNombreClienteContainingIgnoreCase(String nombreCliente);

    List<Pedido> findByEstado(EstadoPedido estado);

    List<Pedido> findByFechaPedidoBetween(LocalDateTime inicio, LocalDateTime fin);

    List<Pedido> findByEmailCliente(String email);

    boolean existsByNumeroPedido(String numeroPedido);

    @Query("SELECT p FROM Pedido p WHERE p.total > :monto")
    List<Pedido> findPedidosConTotalMayorA(@Param("monto") Double monto);

    @Query("SELECT p FROM Pedido p ORDER BY p.fechaPedido DESC")
    List<Pedido> findUltimosPedidos();

    Optional<Pedido> findFirstByNombreClienteContainingIgnoreCaseOrderByFechaPedidoDesc(String nombre);
}
