package com.example.perf_agent_backend.agents;

import com.example.perf_agent_backend.dtos.MessageDTO;
import jade.core.AID;
import jade.core.Agent;
import jade.core.behaviours.OneShotBehaviour;
import jade.lang.acl.ACLMessage;
import jade.lang.acl.MessageTemplate;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;

public class ListeningAgent extends Agent {
    public static ListeningAgent instance;
    private ObjectMapper mapper = new ObjectMapper();

    @Override
    protected void setup() {
        instance = this;
        System.out.println(getLocalName() + " ready to proxy requests...");
    }

    public String askRecommendation(MessageDTO message) {
        ACLMessage cfp = new ACLMessage(ACLMessage.CFP);
        cfp.addReceiver(new AID("RecommendationAgent", AID.ISLOCALNAME));
        try {
            cfp.setContentObject(message);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        String conv = "inner-" + System.currentTimeMillis();
        String tag  = "reply-" + System.currentTimeMillis();
        cfp.setConversationId(conv);
        cfp.setReplyWith(tag);

        send(cfp);

        // wait up to 5s
        MessageTemplate mt = MessageTemplate.and(
                MessageTemplate.MatchConversationId(conv),
                MessageTemplate.MatchInReplyTo(tag)
        );
        ACLMessage resp = blockingReceive(mt, 10000);
        if (resp == null) {
            return "Timeout waiting for RecommendationAgent";
        }

        switch (resp.getPerformative()) {
            case ACLMessage.INFORM:
                return resp.getContent();
            case ACLMessage.FAILURE:
                return "RecommendationAgent failure: " + resp.getContent();
            default:
                return "Unexpected performative: " + resp.getPerformative();
        }
    }
}
