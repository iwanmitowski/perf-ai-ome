package com.example.perf_agent_backend.controllers;

import com.example.perf_agent_backend.dtos.MessageDTO;
import com.example.perf_agent_backend.services.AgentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/agent")
public class AgentController {

    @Autowired
    private AgentService agentService;

    @PostMapping("/recommend")
    public CompletableFuture<String> sendMessage(@RequestBody MessageDTO messageDTO) {
        return agentService.getRecommendationsByNote(messageDTO.getMessage());
    }
}
