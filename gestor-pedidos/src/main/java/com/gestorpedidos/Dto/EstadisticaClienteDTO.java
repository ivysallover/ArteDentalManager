// Ubicación: src/main/java/com/gestorpedidos/Dto/EstadisticaClienteDTO.java
package com.gestorpedidos.Dto;

public class EstadisticaClienteDTO {

    private String nombreCliente;
    private Double totalFacturado;
    private Long totalPedidos; // ¡Un extra! Contamos cuántos pedidos hizo.

    public EstadisticaClienteDTO(String nombreCliente, Double totalFacturado, Long totalPedidos) {
        this.nombreCliente = nombreCliente;
        this.totalFacturado = totalFacturado;
        this.totalPedidos = totalPedidos;
    }

    // Getters
    public String getNombreCliente() { return nombreCliente; }
    public Double getTotalFacturado() { return totalFacturado; }
    public Long getTotalPedidos() { return totalPedidos; }
}