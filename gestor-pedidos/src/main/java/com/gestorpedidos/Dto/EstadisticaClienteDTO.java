package com.gestorpedidos.Dto;

public class EstadisticaClienteDTO {

    private String nombreCliente;
    private Double totalFacturado;
    private Long totalPedidos;

    public EstadisticaClienteDTO(String nombreCliente, Double totalFacturado, Long totalPedidos) {
        this.nombreCliente = nombreCliente;
        this.totalFacturado = totalFacturado;
        this.totalPedidos = totalPedidos;
    }

    public String getNombreCliente() { return nombreCliente; }
    public Double getTotalFacturado() { return totalFacturado; }
    public Long getTotalPedidos() { return totalPedidos; }
}