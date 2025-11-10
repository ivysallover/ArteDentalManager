package com.gestorpedidos.Model;

import com.gestorpedidos.Util.StringUtils;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pedidos")
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @NotBlank(message = "El número de pedido es obligatorio")
    @Column(unique = true, nullable = false)
    private String numeroPedido;


    @NotBlank(message = "El nombre del cliente es obligatorio")
    private String nombreCliente;

    @Email(message = "Email inválido")
    private String emailCliente;
    @NotBlank(message = "El teléfono es obligatorio")
    private String telefonoCliente;

    @NotNull(message = "El estado es obligatorio")
    @Enumerated(EnumType.STRING)
    private EstadoPedido estado;

    @NotNull(message = "La fecha del pedido es obligatoria")
    private LocalDateTime fechaPedido;

    @DecimalMin(value = "0.0", inclusive = false, message = "El total debe ser mayor a 0")
    private Double total;

    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItemPedido> items = new ArrayList<>();

    private String observaciones;

    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Pago> pagos = new ArrayList<>();


    public Pedido() {
        this.fechaPedido = LocalDateTime.now();
        this.estado = EstadoPedido.PENDIENTE;
    }
    public Pedido(String numeroPedido, String nombreCliente, String emailCliente, String telefonoCliente) {
        this();
        this.numeroPedido = numeroPedido;
        this.setNombreCliente(nombreCliente);
        this.emailCliente = emailCliente;
        this.telefonoCliente = telefonoCliente;
    }
    public void addItem(ItemPedido item) {
        items.add(item);
        item.setPedido(this);
        calcularTotal();
    }
    public void removeItem(ItemPedido item) {
        items.remove(item);
        item.setPedido(null);
        calcularTotal();
    }
    public void calcularTotal() {
        this.total = items.stream()
                .mapToDouble(item -> item.getPrecioUnitario() * item.getCantidad())
                .sum();
    }



    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNumeroPedido() { return numeroPedido; }
    public void setNumeroPedido(String numeroPedido) { this.numeroPedido = numeroPedido; }
    public String getNombreCliente() { return nombreCliente; }


    public void setNombreCliente(String nombreCliente) {
        this.nombreCliente = StringUtils.normalizar(nombreCliente);
    }

    public String getEmailCliente() { return emailCliente; }
    public void setEmailCliente(String emailCliente) { this.emailCliente = emailCliente; }
    public String getTelefonoCliente() { return telefonoCliente; }
    public void setTelefonoCliente(String telefonoCliente) { this.telefonoCliente = telefonoCliente; }
    public EstadoPedido getEstado() { return estado; }
    public void setEstado(EstadoPedido estado) { this.estado = estado; }
    public LocalDateTime getFechaPedido() { return fechaPedido; }
    public void setFechaPedido(LocalDateTime fechaPedido) { this.fechaPedido = fechaPedido; }
    public Double getTotal() { return total; }
    public void setTotal(Double total) { this.total = total; }
    public List<ItemPedido> getItems() { return items; }
    public void setItems(List<ItemPedido> items) { this.items = items; }
    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }

    public enum EstadoPedido { /* ... (sin cambios) ... */
        PENDIENTE, EN_PROCESO, COMPLETADO, CANCELADO
    }

    public List<Pago> getPagos() { return pagos; }
    public void setPagos(List<Pago> pagos) { this.pagos = pagos; }
    public Double getDeuda() { /* ... (sin cambios) ... */
        double totalPagado = pagos.stream().mapToDouble(Pago::getMonto).sum();
        double totalPedido = (this.total == null) ? 0.0 : this.total;
        return totalPedido - totalPagado;
    }
}