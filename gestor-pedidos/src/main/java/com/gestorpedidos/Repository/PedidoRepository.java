package com.gestorpedidos.Repository;

import com.gestorpedidos.Dto.EstadisticaClienteDTO;
import com.gestorpedidos.Dto.EstadisticaMensualDTO;
import com.gestorpedidos.Model.Pedido;
import com.gestorpedidos.Model.EstadoPedido;
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


    //Consulta 1: Estadísticas mensuales
    @Query("SELECT new com.gestorpedidos.Dto.EstadisticaMensualDTO(TO_CHAR(p.fechaPedido, 'YYYY-MM'), SUM(p.total)) " +
            "FROM Pedido p " +
            "WHERE p.estado = 'COMPLETADO' " +
            "AND p.fechaPedido BETWEEN :inicio AND :fin " +
            "GROUP BY TO_CHAR(p.fechaPedido, 'YYYY-MM') " +
            "ORDER BY TO_CHAR(p.fechaPedido, 'YYYY-MM') DESC")
    List<EstadisticaMensualDTO> findEstadisticasMensuales(@Param("inicio") LocalDateTime inicio, @Param("fin") LocalDateTime fin);

     //Consulta 2: Estadísticas por cliente
    @Query("SELECT new com.gestorpedidos.Dto.EstadisticaClienteDTO(p.nombreCliente, SUM(p.total), COUNT(p)) " +
            "FROM Pedido p " +
            "WHERE p.estado = 'COMPLETADO' " +
            "AND p.fechaPedido BETWEEN :inicio AND :fin " +
            "GROUP BY p.nombreCliente " +
            "ORDER BY SUM(p.total) DESC")
    List<EstadisticaClienteDTO> findEstadisticasPorCliente(@Param("inicio") LocalDateTime inicio, @Param("fin") LocalDateTime fin);

}