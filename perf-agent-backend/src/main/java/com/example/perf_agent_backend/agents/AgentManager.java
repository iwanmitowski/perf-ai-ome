package com.example.perf_agent_backend.agents;

import jade.core.Profile;
import jade.core.ProfileImpl;
import jade.core.Runtime;
import jade.wrapper.AgentController;
import jade.wrapper.ContainerController;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;

@Component
public class AgentManager {
    private RecommendationAgent recommendationAgent;
    private ListeningAgent listeningAgent;

    @PostConstruct
    public void init() {
        try {
            Runtime runtime = Runtime.instance();
            Profile profile = new ProfileImpl();
            ContainerController container = runtime.createMainContainer(profile);

            AgentController recCtrl = container.createNewAgent(
                    "RecommendationAgent",
                    RecommendationAgent.class.getName(),
                    null
            );
            recCtrl.start();

            AgentController listenCtrl = container.createNewAgent(
                    "ListeningAgent",
                    ListeningAgent.class.getName(),
                    null
            );
            listenCtrl.start();

            Thread.sleep(1000);

            this.recommendationAgent = RecommendationAgent.instance;
            this.listeningAgent    = ListeningAgent.instance;

            System.out.println("RecAgent: " + (recommendationAgent != null));
            System.out.println("ListeningAgent: " + (listeningAgent != null));

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public RecommendationAgent getRecommendationAgent() {
        return recommendationAgent;
    }

    public ListeningAgent getListeningAgent() {
        return listeningAgent;
    }
}
