
// ============================================
// ARCHIVO 1: GestorPedidosApplication.java
// Ubicación: src/main/java/com/gestorpedidos/
// ============================================
package com.gestorpedidos;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@SpringBootApplication
public class GestorPedidosApplication {

	public static void main(String[] args) {
		SpringApplication.run(GestorPedidosApplication.class, args);
		System.out.println("\n===========================================");
		System.out.println("   GESTOR DE PEDIDOS - SERVIDOR INICIADO");
		System.out.println("   Puerto: 8080");
		System.out.println("   API REST: http://localhost:8080/api");
		System.out.println("   H2 Console: http://localhost:8080/h2-console");
		System.out.println("===========================================\n");
	}

	@Bean
	public WebMvcConfigurer corsConfigurer() {
		return new WebMvcConfigurer() {
			@Override
			public void addCorsMappings(CorsRegistry registry) {
				registry.addMapping("/api/**")
						.allowedOrigins("*") // <-- CAMBIA ESTO
						.allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
						.allowedHeaders("*");
			}
		};
	}
}