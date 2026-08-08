package com.cvanalyzer.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import jakarta.annotation.PostConstruct;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.util.ResourceUtils;

import java.io.File;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.security.KeyFactory;
import java.security.PublicKey;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

@Component
public class JwtValidator {

    private PublicKey publicKey;

    @PostConstruct
    public void init() {
        this.publicKey = loadPublicKey();
    }

    public boolean isTokenValid(String token) {
        try{
            parseClaims(token);
            return true;
        } catch (JwtException e){
            return false;
        }
    }

    public String extractEmail(String token) {
        return parseClaims(token).getSubject();
    }

    public Long extractUserId(String token) {
        return parseClaims(token).get("userId", Long.class);
    }

    public String extractRole(String token) {
        return parseClaims(token).get("role", String.class);
    }

    private Claims parseClaims(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }

        return Jwts.parserBuilder()
                .setSigningKey(publicKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private PublicKey loadPublicKey() {
        try {
            ClassPathResource resource = new ClassPathResource("keys/public_key.pem");

            try (InputStream inputStream = resource.getInputStream()) {
                String key = new String(inputStream.readAllBytes(), StandardCharsets.UTF_8);

                String cleanKey = key.replace("-----BEGIN PUBLIC KEY-----", "")
                        .replace("-----END PUBLIC KEY-----", "")
                        .replaceAll("\\s+", "");

                byte[] keyBytes = Base64.getDecoder().decode(cleanKey);
                X509EncodedKeySpec spec = new X509EncodedKeySpec(keyBytes);
                KeyFactory kf = KeyFactory.getInstance("RSA");

                return kf.generatePublic(spec);
            }
        } catch (Exception e) {
            throw new RuntimeException("Public key okunamadı!", e);
        }
    }
}

