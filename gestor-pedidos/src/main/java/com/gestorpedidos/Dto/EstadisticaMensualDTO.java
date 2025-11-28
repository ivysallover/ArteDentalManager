package com.gestorpedidos.Dto;

public class EstadisticaMensualDTO {

    private final String mes;
    private final Double total;

    public EstadisticaMensualDTO(String mes, Double total) {
        this.mes = mes;
        this.total = total;
    }

    public String getMes() { return mes; }
    public Double getTotal() { return total; }
}