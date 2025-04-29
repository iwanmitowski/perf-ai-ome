package com.example.perf_agent_backend.agents;

import jade.core.AID;
import jade.core.Agent;
import jade.core.behaviours.OneShotBehaviour;
import jade.lang.acl.ACLMessage;
import jade.lang.acl.MessageTemplate;
import com.fasterxml.jackson.databind.ObjectMapper;

public class ListeningAgent extends Agent {
    public static ListeningAgent instance;
    private ObjectMapper mapper = new ObjectMapper();

    @Override
    protected void setup() {
        instance = this;
        System.out.println(getLocalName() + " ready to proxy requests...");
        // Nothing else here—each request is handled on demand.
    }

    public String askRecommendation(String note) {
        ACLMessage cfp = new ACLMessage(ACLMessage.CFP);
        cfp.addReceiver(new AID("RecommendationAgent", AID.ISLOCALNAME));
        cfp.setContent(note);

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
