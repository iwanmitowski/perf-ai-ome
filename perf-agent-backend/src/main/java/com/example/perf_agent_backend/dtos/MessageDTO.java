package com.example.perf_agent_backend.dtos;

public class MessageDTO {
    private String agentName;
    private String message;

    public String getAgentName() { return agentName; }
    public void setAgentName(String agentName) { this.agentName = agentName; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
