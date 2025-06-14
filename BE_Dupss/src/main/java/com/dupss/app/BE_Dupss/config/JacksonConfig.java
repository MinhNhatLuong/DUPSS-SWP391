package com.dupss.app.BE_Dupss.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateDeserializer;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalTimeDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateSerializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalTimeSerializer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

@Configuration
public class JacksonConfig {

    private static final String DATE_FORMAT = "dd/MM/yyyy";
    private static final String TIME_FORMAT = "HH:mm";

    @Bean
    public ObjectMapper objectMapper() {
        JavaTimeModule module = new JavaTimeModule();
        
        // Cấu hình deserializer và serializer cho LocalDate
        LocalDateDeserializer localDateDeserializer = new LocalDateDeserializer(
                DateTimeFormatter.ofPattern(DATE_FORMAT));
        LocalDateSerializer localDateSerializer = new LocalDateSerializer(
                DateTimeFormatter.ofPattern(DATE_FORMAT));
        module.addDeserializer(LocalDate.class, localDateDeserializer);
        module.addSerializer(LocalDate.class, localDateSerializer);
        
        // Cấu hình deserializer và serializer cho LocalTime
        LocalTimeDeserializer localTimeDeserializer = new LocalTimeDeserializer(
                DateTimeFormatter.ofPattern(TIME_FORMAT));
        LocalTimeSerializer localTimeSerializer = new LocalTimeSerializer(
                DateTimeFormatter.ofPattern(TIME_FORMAT));
        module.addDeserializer(LocalTime.class, localTimeDeserializer);
        module.addSerializer(LocalTime.class, localTimeSerializer);

        return Jackson2ObjectMapperBuilder.json()
                .modules(module)
                .featuresToDisable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
                .build();
    }
} 