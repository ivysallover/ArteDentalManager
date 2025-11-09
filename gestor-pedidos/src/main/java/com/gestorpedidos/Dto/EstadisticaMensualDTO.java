// ============================================
// ARCHIVO NUEVO: EstadisticaMensualDTO.java
// Ubicación: src/main/java/com/gestorpedidos/dto/
// ============================================
package com.gestorpedidos.Dto;

// Esto es un "DTO" (Data Transfer Object)
// Es una clase simple solo para transportar datos.
public class EstadisticaMensualDTO {

    private String mes;
    private Double total;

    // ¡Este constructor es VITAL!
    // Lo usará la consulta SQL para crear los objetos.
    public EstadisticaMensualDTO(String mes, Double total) {
        this.mes = mes;
        this.total = total;
    }

    // Getters
    public String getMes() {
        return mes;
    }

    public Double getTotal() {
        return total;
    }
}