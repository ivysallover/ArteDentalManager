package com.gestorpedidos.Util;
import java.text.Normalizer;

public class StringUtils {

    public static String normalizar(String texto) {
        if (texto == null) {
            return null;
        }
        String textoNormalizado = texto.toLowerCase();
        textoNormalizado = Normalizer.normalize(textoNormalizado, Normalizer.Form.NFD);
        textoNormalizado = textoNormalizado.replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        return textoNormalizado.trim();
    }
}