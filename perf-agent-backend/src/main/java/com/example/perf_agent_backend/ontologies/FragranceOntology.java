package com.example.perf_agent_backend.ontologies;

import com.example.perf_agent_backend.models.Fragrance;
import org.semanticweb.owlapi.apibinding.OWLManager;
import org.semanticweb.owlapi.model.*;
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

    private String ontologyIRIStr;

    public FragranceOntology() {
        ontologyManager = OWLManager.createOWLOntologyManager();
        dataFactory = ontologyManager.getOWLDataFactory();

        loadOntology();

        ontologyIRIStr = fragranceOntology.getOntologyID().getOntologyIRI().toString() + "#";
    }

    private void loadOntology() {
        try (InputStream in = getClass().getClassLoader()
                .getResourceAsStream("ontologies/fragrAIntica.owx")) {
            if (in == null) {
                throw new IllegalStateException("Could not find fragrAIntica.owl on classpath!");
            }

            fragranceOntology = ontologyManager.loadOntologyFromOntologyDocument(in);
            // … now you can query or manipulate the ontology …
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public List<Fragrance> getFragrancesByNote(String note) {
        List<Fragrance> result = new ArrayList<>();

        // normalize & grab the NOTE individual
        String frag = Arrays.stream(note.trim().split("\\s+"))
                .map(w -> w.substring(0,1).toUpperCase() + w.substring(1).toLowerCase())
                .collect(Collectors.joining("_"));

        OWLNamedIndividual noteInd =
                dataFactory.getOWLNamedIndividual(IRI.create(ontologyIRIStr + frag));

        OWLObjectProperty topP    = dataFactory.getOWLObjectProperty(IRI.create(ontologyIRIStr + "hasTopNote"));
        OWLObjectProperty midP    = dataFactory.getOWLObjectProperty(IRI.create(ontologyIRIStr + "hasMiddleNote"));
        OWLObjectProperty baseP   = dataFactory.getOWLObjectProperty(IRI.create(ontologyIRIStr + "hasBaseNote"));
        Set<OWLObjectProperty> props = Set.of(topP, midP, baseP);

        // scan all assertion axioms where the OBJECT == our noteInd
        for (OWLObjectPropertyAssertionAxiom ax :
                fragranceOntology.getAxioms(AxiomType.OBJECT_PROPERTY_ASSERTION)) {
            if (!props.contains(ax.getProperty())) continue;
            if (!ax.getObject().equals(noteInd)) continue;

            OWLIndividual subj = ax.getSubject();
            if (!subj.isNamed()) continue;

            OWLNamedIndividual fragInd = subj.asOWLNamedIndividual();
            result.add( mapIndividualToFragrance(fragInd) );
        }

        return result;
    }

    public Fragrance mapIndividualToFragrance(OWLNamedIndividual ind) {
        Fragrance f = new Fragrance();

        f.setId(ind.toStringID());
        f.setName(getDataPropertyValue(ind, "fragranceName"));

        // 2) data-property: brand
        f.setBrand(getDataPropertyValue(ind, "brandName"));

        // 3) object-properties: notes
        f.setTopNotes(    getObjectPropertyValues(ind, "hasTopNote"));
        f.setMiddleNotes( getObjectPropertyValues(ind, "hasMiddleNote"));
        f.setBaseNotes(   getObjectPropertyValues(ind, "hasBaseNote"));

        // 4) sillage & longevity (single-valued)
        f.setSillage(   firstOrNull(getObjectPropertyValues(ind, "hasSillage")));
        f.setLongevity( firstOrNull(getObjectPropertyValues(ind, "hasLongevity")));

        // 5) all the “type” classes (Floral, Woody, Fresh, etc.)
        f.setTypes(getAllTypes(ind));

        return f;
    }

    private String getDataPropertyValue(OWLNamedIndividual ind, String dpName) {
        OWLDataProperty dp = dataFactory.getOWLDataProperty(
                IRI.create(ontologyIRIStr + dpName)
        );
        for (OWLDataPropertyAssertionAxiom ax : fragranceOntology.getDataPropertyAssertionAxioms(ind)) {
            if (ax.getProperty().equals(dp)) {
                return ax.getObject().getLiteral();
            }
        }
        return null;
    }

    private List<String> getObjectPropertyValues(OWLNamedIndividual ind, String opName) {
        OWLObjectProperty op = dataFactory.getOWLObjectProperty(
                IRI.create(ontologyIRIStr + opName)
        );
        List<String> values = new ArrayList<>();
        for (OWLObjectPropertyAssertionAxiom ax : fragranceOntology.getObjectPropertyAssertionAxioms(ind)) {
            if (ax.getProperty().equals(op) && ax.getObject().isNamed()) {
                OWLNamedIndividual filler = ax.getObject().asOWLNamedIndividual();
                String shortForm = getShortFormIndividual(filler);
                values.add(shortForm.replace("_", " "));
            }
        }
        return values;
    }

    private List<String> getAllTypes(OWLNamedIndividual ind) {
        List<String> types = new ArrayList<>();
        for (OWLClassAssertionAxiom ax : fragranceOntology.getClassAssertionAxioms(ind)) {
            OWLClassExpression ce = ax.getClassExpression();
            if (!ce.isAnonymous()) {
                types.add(getShortForm(ce.asOWLClass()));
            }
        }
        return types;
    }

    private <T> T firstOrNull(List<T> list) {
        return list.isEmpty() ? null : list.get(0);
    }

    private String getShortForm(OWLClass cls) {
        String label = cls.getIRI().toString();
        return label.substring(label.indexOf("#") + 1);
    }

    private String getShortFormIndividual(OWLNamedIndividual ind) {
        String label = ind.getIRI().toString();
        return label.substring(label.indexOf("#") + 1);
    }
}
