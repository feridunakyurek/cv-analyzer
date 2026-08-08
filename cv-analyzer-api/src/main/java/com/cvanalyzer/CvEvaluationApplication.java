package com.cvanalyzer;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class CvEvaluationApplication {

	public static void main(String[] args) {
		SpringApplication.run(CvEvaluationApplication.class, args);
	}

}
