package com.example.perf_agent_backend.services;

import com.example.perf_agent_backend.agents.AgentManager;
import com.example.perf_agent_backend.agents.ListeningAgent;
import com.example.perf_agent_backend.dtos.MessageDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;

@Service
public class AgentService {
    @Autowired
    private AgentManager agentManager;

    @Async("agentExecutor")
    public CompletableFuture<String> getRecommendations(MessageDTO message) {
        ListeningAgent listener = agentManager.getListeningAgent();
        if (listener == null) {
            return CompletableFuture.completedFuture("ListeningAgent not available");
        }
        // askRecommendation does the CFP → RecommendationAgent → reply cycle
        String result = listener.askRecommendation(message);
        return CompletableFuture.completedFuture(result);
    }
}
