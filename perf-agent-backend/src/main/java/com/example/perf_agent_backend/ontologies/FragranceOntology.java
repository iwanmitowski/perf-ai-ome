package com.example.perf_agent_backend.ontologies;

import com.example.perf_agent_backend.models.Fragrance;
import org.semanticweb.HermiT.Reasoner;
import org.semanticweb.owlapi.apibinding.OWLManager;
import org.semanticweb.owlapi.model.*;
import org.semanticweb.owlapi.reasoner.InferenceType;
import org.semanticweb.owlapi.reasoner.NodeSet;
import org.semanticweb.owlapi.reasoner.OWLReasoner;
import org.semanticweb.owlapi.reasoner.OWLReasonerFactory;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class FragranceOntology {

    private OWLOntologyManager ontologyManager;
    private OWLOntology fragranceOntology;
    private OWLDataFactory dataFactory;

    private OWLReasoner reasoner;
    private String ontologyIRIStr;

    public FragranceOntology() {
        ontologyManager = OWLManager.createOWLOntologyManager();
        dataFactory = ontologyManager.getOWLDataFactory();

        loadOntology();

        OWLReasonerFactory rf = new Reasoner.ReasonerFactory();
        reasoner = rf.createReasoner(fragranceOntology);
        reasoner.precomputeInferences(InferenceType.CLASS_HIERARCHY, InferenceType.CLASS_ASSERTIONS);

        ontologyIRIStr = fragranceOntology.getOntologyID().getOntologyIRI().toString() + "#";
    }

    private void loadOntology() {
        try (InputStream in = getClass().getClassLoader()
                .getResourceAsStream("ontologies/fragrAIntica.owx")) {
            if (in == null) {
                throw new IllegalStateException("Could not find fragrAIntica.owl on classpath!");
            }

            fragranceOntology = ontologyManager.loadOntologyFromOntologyDocument(in);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public List<Fragrance> getFragrancesByNote(String note) {
        List<Fragrance> result = new ArrayList<>();

        String frag = Arrays.stream(note.trim().split("\\s+"))
                .map(w -> w.substring(0,1).toUpperCase() + w.substring(1).toLowerCase())
                .collect(Collectors.joining("_"));

        OWLNamedIndividual noteInd = dataFactory.getOWLNamedIndividual(
                IRI.create(ontologyIRIStr + frag)
        );

        Set<OWLObjectProperty> props = Set.of(
                dataFactory.getOWLObjectProperty(IRI.create(ontologyIRIStr + "hasTopNote")),
                dataFactory.getOWLObjectProperty(IRI.create(ontologyIRIStr + "hasMiddleNote")),
                dataFactory.getOWLObjectProperty(IRI.create(ontologyIRIStr + "hasBaseNote"))
        );

        for (OWLObjectPropertyAssertionAxiom ax : fragranceOntology.getAxioms(AxiomType.OBJECT_PROPERTY_ASSERTION)) {
            if (!props.contains(ax.getProperty())) continue;
            if (!ax.getObject().equals(noteInd)) continue;

            OWLIndividual subj = ax.getSubject();
            if (!subj.isNamed()) continue;

            OWLNamedIndividual fragInd = subj.asOWLNamedIndividual();
            result.add(mapIndividualToFragrance(fragInd));
        }

        return result;
    }

    public Fragrance mapIndividualToFragrance(OWLNamedIndividual ind) {
        Fragrance f = new Fragrance();

        f.setId(ind.toStringID());
        f.setName(getDataPropertyValue(ind, "fragranceName"));
        f.setBrand(getDataPropertyValue(ind, "brandName"));

        f.setTopNotes(getObjectPropertyValues(ind, "hasTopNote"));
        f.setMiddleNotes(getObjectPropertyValues(ind, "hasMiddleNote"));
        f.setBaseNotes(getObjectPropertyValues(ind, "hasBaseNote"));

        f.setSillage(firstOrNull(getObjectPropertyValues(ind, "hasSillage")));
        f.setLongevity(firstOrNull(getObjectPropertyValues(ind, "hasLongevity")));

        f.setTypes(getAllTypes(ind));

        return f;
    }

    private String getDataPropertyValue(OWLNamedIndividual ind, String dpName) {
        OWLDataProperty dp = dataFactory.getOWLDataProperty(
                IRI.create(ontologyIRIStr + dpName)
        );
        return fragranceOntology.getDataPropertyAssertionAxioms(ind).stream()
                .filter(ax -> ax.getProperty().equals(dp))
                .map(ax -> ax.getObject().getLiteral())
                .findFirst()
                .orElse(null);
    }

    private List<String> getObjectPropertyValues(OWLNamedIndividual ind, String opName) {
        OWLObjectProperty op = dataFactory.getOWLObjectProperty(
                IRI.create(ontologyIRIStr + opName)
        );
        return fragranceOntology.getObjectPropertyAssertionAxioms(ind).stream()
                .filter(ax -> ax.getProperty().equals(op) && ax.getObject().isNamed())
                .map(ax -> getShortFormIndividual(ax.getObject().asOWLNamedIndividual()).replace("_", " "))
                .collect(Collectors.toList());
    }

    private List<String> getAllTypes(OWLNamedIndividual ind) {
        NodeSet<OWLClass> typeNodes = reasoner.getTypes(ind, true);
        return typeNodes.getFlattened().stream()
                .filter(c -> !c.isOWLThing())
                .map(this::getShortForm)
                .collect(Collectors.toList());
    }

    private <T> T firstOrNull(List<T> list) {
        return list.isEmpty() ? null : list.get(0);
    }

    private String getShortForm(OWLClass cls) {
        return cls.getIRI().getFragment();
    }

    private String getShortFormIndividual(OWLNamedIndividual ind) {
        return ind.getIRI().getFragment();
    }
}
