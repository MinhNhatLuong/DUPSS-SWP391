package com.dupss.app.BE_Dupss.service;


import com.dupss.app.BE_Dupss.entity.InvalidatedToken;
import com.dupss.app.BE_Dupss.entity.User;
import com.dupss.app.BE_Dupss.respository.InvalidatedTokenRepository;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import com.nimbusds.oauth2.sdk.util.StringUtils;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import lombok.RequiredArgsConstructor;

import net.minidev.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.text.ParseException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;


public interface JwtService {
     String generateAccessToken(User user);
     String generateRefreshToken(User user);
     boolean verifyToken(String token) throws ParseException, JOSEException;
     String getUsernameFromToken(String token);
}
