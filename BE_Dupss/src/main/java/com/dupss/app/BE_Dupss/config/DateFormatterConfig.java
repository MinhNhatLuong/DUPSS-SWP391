package com.dupss.app.BE_Dupss.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.format.FormatterRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Configuration
public class DateFormatterConfig implements WebMvcConfigurer {

    @Override
    public void addFormatters(FormatterRegistry registry) {
        registry.addFormatterForFieldType(LocalDate.class, new org.springframework.format.datetime.standard.TemporalAccessorPrinter(DateTimeFormatter.ofPattern("dd/MM/yyyy")),
                new org.springframework.format.datetime.standard.TemporalAccessorParser(LocalDate.class, DateTimeFormatter.ofPattern("dd/MM/yyyy")));
    }
}