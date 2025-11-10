// ============================================
// ARCHIVO NUEVO: StringUtils.java
// Ubicación: com/gestorpedidos/Util/
// ============================================
package com.gestorpedidos.Util;

import java.text.Normalizer;

public class StringUtils {

    /**
     * Convierte un texto a minúsculas, sin tildes y sin espacios extra.
     * Ej: "Tadéo Muñoz" -> "tadeo munoz"
     */
    public static String normalizar(String texto) {
        if (texto == null) {
            return null;
        }
        // 1. Convertir a minúsculas
        String textoNormalizado = texto.toLowerCase();

        // 2. Descomponer tildes (ej: "é" -> "e" + "´")
        textoNormalizado = Normalizer.normalize(textoNormalizado, Normalizer.Form.NFD);

        // 3. Quitar los caracteres de tildes (diacríticos)
        textoNormalizado = textoNormalizado.replaceAll("\\p{InCombiningDiacriticalMarks}+", "");

        // 4. Quitar espacios al inicio y al final
        return textoNormalizado.trim();
    }
}