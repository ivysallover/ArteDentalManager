// Ubicación: src/main/java/com/gestorpedidos/repository/PagoRepository.java
package com.gestorpedidos.Repository;

import com.gestorpedidos.Model.Pago;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PagoRepository extends JpaRepository<Pago, Long> {
}