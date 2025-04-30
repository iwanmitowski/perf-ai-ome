package com.example.perf_agent_backend.ontologies;

import com.example.perf_agent_backend.dtos.MessageDTO;
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
import java.util.*;
import java.util.stream.Collectors;

@Component
public class FragranceOntology {

    private final OWLOntologyManager ontologyManager;
    private OWLOntology            fragranceOntology;
    private final OWLDataFactory   dataFactory;
    private final OWLReasoner      reasoner;
    private final String           ontologyIRIStr;

    public FragranceOntology() {
        ontologyManager = OWLManager.createOWLOntologyManager();
        dataFactory     = ontologyManager.getOWLDataFactory();

        // Load your ontology document
        try (InputStream in = getClass().getClassLoader()
                .getResourceAsStream("ontologies/fragrAIntica.owx")) {
            if (in == null) {
                throw new IllegalStateException("Could not find fragrAIntica.owl on classpath!");
            }
            fragranceOntology = ontologyManager.loadOntologyFromOntologyDocument(in);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

        // Bootstrap the reasoner
        OWLReasonerFactory rf = new Reasoner.ReasonerFactory();
        reasoner = rf.createReasoner(fragranceOntology);
        reasoner.precomputeInferences(InferenceType.CLASS_HIERARCHY,
                InferenceType.CLASS_ASSERTIONS);

        ontologyIRIStr = fragranceOntology.getOntologyID()
                .getOntologyIRI().toString() + "#";
    }


    //    {
    //        "types": [],
    //        "notes": [],
    //        "hasLongevity": [],
    //        "hasSillage": [],
    //        "brandName": null,
    //        "fragranceName": null,
    //        "count": null
    //    }
    public List<Fragrance> getFragrances(MessageDTO message) {
        List<Fragrance> all = new ArrayList<>();

        for (OWLNamedIndividual ind : fragranceOntology.getIndividualsInSignature()) {
            Fragrance frag = mapIndividualToFragrance(ind);

            if (matchesFilters(frag, message)) {
                all.add(frag);
            }
        }

        Integer limit = message.getCount();
        if (limit != null && limit < all.size()) {
            return new ArrayList<>(all.subList(0, limit));
        }
        return all;
    }

    /** Returns true only if frag satisfies all non-empty filters in message (AND-across-categories). */
    private boolean matchesFilters(Fragrance frag, MessageDTO msg) {
        // brandName
        if (msg.getBrandName() != null &&
                !msg.getBrandName().equalsIgnoreCase(frag.getBrand())) {
            return false;
        }
        // fragranceName
        if (msg.getFragranceName() != null &&
                !msg.getFragranceName().equalsIgnoreCase(frag.getName())) {
            return false;
        }
        // types (must contain all requested types)
        if (!msg.getTypes().isEmpty() &&
                !frag.getTypes().containsAll(msg.getTypes())) {
            return false;
        }
        // notes (OR within notes: at least one requested note must appear in any base/middle/top)
        if (!msg.getNotes().isEmpty()) {
            List<String> allNotes = new ArrayList<>();
            allNotes.addAll(frag.getBaseNotes());
            allNotes.addAll(frag.getMiddleNotes());
            allNotes.addAll(frag.getTopNotes());
            boolean anyNoteMatches = msg.getNotes().stream()
                    .anyMatch(allNotes::contains);
            if (!anyNoteMatches) {
                return false;
            }
        }
        // longevity (OR within: at least one requested longevity must match)
        if (!msg.getHasLongevity().isEmpty()) {
            String lon = frag.getLongevity();
            if (lon == null || msg.getHasLongevity().stream().noneMatch(lon::equals)) {
                return false;
            }
        }
        // sillage (OR within)
        if (!msg.getHasSillage().isEmpty()) {
            String sil = frag.getSillage();
            if (sil == null || msg.getHasSillage().stream().noneMatch(sil::equals)) {
                return false;
            }
        }
        return true;
    }

    /** Your existing mapping logic — unchanged. */
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
                .map(ax -> getShortFormIndividual(ax.getObject().asOWLNamedIndividual())
                        .replace("_", " "))
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
