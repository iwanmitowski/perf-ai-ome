package com.example.perf_agent_backend.models;

import java.util.List;

public class Fragrance {
    private String id;
    private String name;
    private String brand;
    private List<String> topNotes;
    private List<String> middleNotes;
    private List<String> baseNotes;
    private String sillage;
    private String longevity;
    private List<String> types;
    
    public String getId() {
        return id;
    }
    public void setId(String id) {
        this.id = id;
    }
    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }
    public String getBrand() {
        return brand;
    }
    public void setBrand(String brand) {
        this.brand = brand;
    }
    public List<String> getTopNotes() {
        return topNotes;
    }
    public void setTopNotes(List<String> topNotes) {
        this.topNotes = topNotes;
    }
    public List<String> getMiddleNotes() {
        return middleNotes;
    }
    public void setMiddleNotes(List<String> middleNotes) {
        this.middleNotes = middleNotes;
    }
    public List<String> getBaseNotes() {
        return baseNotes;
    }
    public void setBaseNotes(List<String> baseNotes) {
        this.baseNotes = baseNotes;
    }
    public String getSillage() {
        return sillage;
    }
    public void setSillage(String sillage) {
        this.sillage = sillage;
    }
    public String getLongevity() {
        return longevity;
    }
    public void setLongevity(String longevity) {
        this.longevity = longevity;
    }
    public List<String> getTypes() {
        return types;
    }
    public void setTypes(List<String> types) {
        this.types = types;
    }
}