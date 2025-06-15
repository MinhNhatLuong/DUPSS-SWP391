package com.dupss.app.BE_Dupss;

import net.minidev.json.JSONUtil;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class BeDupssApplication {

	public static void main(String[] args) {

		SpringApplication.run(BeDupssApplication.class, args);
	}

}
