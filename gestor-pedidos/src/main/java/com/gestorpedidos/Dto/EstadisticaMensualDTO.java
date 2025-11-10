package com.gestorpedidos.Dto;

public class EstadisticaMensualDTO {

    private String mes;
    private Double total;

    public EstadisticaMensualDTO(String mes, Double total) {
        this.mes = mes;
        this.total = total;
    }

    public String getMes() { return mes; }
    public Double getTotal() { return total; }
}