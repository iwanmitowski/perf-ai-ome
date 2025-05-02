package com.example.perf_agent_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class PerfAgentBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(PerfAgentBackendApplication.class, args);
	}

}
