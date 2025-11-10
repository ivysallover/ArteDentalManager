// ============================================
// ARCHIVO NUEVO: EstadisticaMensualDTO.java
// Ubicación: com/gestorpedidos/Dto/
// ============================================
package com.gestorpedidos.Dto;

public class EstadisticaMensualDTO {

    private String mes;
    private Double total;

    // Constructor VITAL para la consulta
    public EstadisticaMensualDTO(String mes, Double total) {
        this.mes = mes;
        this.total = total;
    }

    // Getters
    public String getMes() { return mes; }
    public Double getTotal() { return total; }
}