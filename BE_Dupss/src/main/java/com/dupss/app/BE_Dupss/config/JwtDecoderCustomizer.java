package com.dupss.app.BE_Dupss.config;


import com.dupss.app.BE_Dupss.service.JwtService;
import com.nimbusds.jose.JOSEException;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.stereotype.Component;

import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.text.ParseException;
import java.util.Objects;

@Component
@RequiredArgsConstructor
public class JwtDecoderCustomizer implements JwtDecoder {

    @Value("${jwt.secret-key}")
    private String secretKey;

    private NimbusJwtDecoder nimbusJwtDecoder = null;

    private final JwtService jwtService;

    @Override
    public Jwt decode(String token) throws JwtException {
        try {
            if(!jwtService.verifyToken(token)) {
                throw new JwtException("Invalid token");
            }

            if(Objects.isNull(nimbusJwtDecoder)) {
                SecretKeySpec secretKeySpec = new SecretKeySpec(
                        secretKey.getBytes(StandardCharsets.UTF_8),
                        "HS384");

                nimbusJwtDecoder = NimbusJwtDecoder.withSecretKey(secretKeySpec)
                        .macAlgorithm(MacAlgorithm.HS384)
                        .build();
            }
        } catch (ParseException | JOSEException e) {
            throw new RuntimeException(e);
        }
        return nimbusJwtDecoder.decode(token);
    }

}

