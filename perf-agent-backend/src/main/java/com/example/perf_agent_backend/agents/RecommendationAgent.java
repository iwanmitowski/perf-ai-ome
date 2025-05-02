package com.example.perf_agent_backend.agents;

import com.example.perf_agent_backend.dtos.MessageDTO;
import com.example.perf_agent_backend.ontologies.FragranceOntology;
import com.example.perf_agent_backend.models.Fragrance;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jade.core.Agent;
import jade.core.behaviours.CyclicBehaviour;
import jade.domain.DFService;
import jade.domain.FIPAAgentManagement.DFAgentDescription;
import jade.domain.FIPAAgentManagement.FailureException;
import jade.domain.FIPAAgentManagement.ServiceDescription;
import jade.domain.FIPAException;
import jade.lang.acl.ACLMessage;
import jade.lang.acl.MessageTemplate;
import jade.lang.acl.UnreadableException;
import jade.proto.AchieveREResponder;

import java.util.List;

public class RecommendationAgent extends Agent {
    public static RecommendationAgent instance;
    private FragranceOntology fragranceOntology;

    @Override
    protected void setup() {
        instance = this;
        fragranceOntology = new FragranceOntology();

        DFAgentDescription dfd = new DFAgentDescription();
        dfd.setName(getAID());
        ServiceDescription sd = new ServiceDescription();
        sd.setType("recommendator");
        sd.setName("Recommendator");
        dfd.addServices(sd);
        try {
            DFService.register(this, dfd);
        } catch (FIPAException e) {
            throw new RuntimeException(e);
        }

        addBehaviour(new jade.core.behaviours.CyclicBehaviour(this) {
            @Override
            public void action() {
                MessageTemplate mt = MessageTemplate.MatchPerformative(ACLMessage.CFP);
                ACLMessage msg = myAgent.receive(mt);
                if (msg == null) {
                    block();
                    return;
                }
                MessageDTO message;
                try {
                    message = (MessageDTO) msg.getContentObject();
                } catch (UnreadableException e) {
                    throw new RuntimeException(e);
                }
                List<Fragrance> found = fragranceOntology.getFragrances(message);

                ACLMessage reply = msg.createReply();
                ObjectMapper mapper = new ObjectMapper();

                if (!found.isEmpty()) {
                    reply.setPerformative(ACLMessage.INFORM);
                    try {
                        reply.setContent(mapper.writeValueAsString(found));
                        reply.setLanguage("JSON");
                    } catch (JsonProcessingException e) {
                        reply.setPerformative(ACLMessage.FAILURE);
                        reply.setContent("Serialization error: " + e.getMessage());
                    }
                } else {
                    reply.setPerformative(ACLMessage.FAILURE);
                    reply.setContent("No fragrances");
                }

                myAgent.send(reply);
            }
        });
    }
}
