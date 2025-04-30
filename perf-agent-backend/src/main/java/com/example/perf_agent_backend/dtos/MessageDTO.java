package com.example.perf_agent_backend.dtos;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

public class MessageDTO implements Serializable {
    private List<String> types        = new ArrayList<>();
    private List<String> notes        = new ArrayList<>();
    private List<String> hasLongevity = new ArrayList<>();
    private List<String> hasSillage   = new ArrayList<>();
    private String      brandName;
    private String      fragranceName;
    private Integer     count;

    public List<String> getTypes() {
        return types;
    }

    public void setTypes(List<String> types) {
        this.types = (types != null ? types : new ArrayList<>());
    }

    public List<String> getNotes() {
        return notes;
    }

    public void setNotes(List<String> notes) {
        this.notes = (notes != null ? notes : new ArrayList<>());
    }

    public List<String> getHasLongevity() {
        return hasLongevity;
    }

    public void setHasLongevity(List<String> hasLongevity) {
        this.hasLongevity = (hasLongevity != null ? hasLongevity : new ArrayList<>());
    }

    public List<String> getHasSillage() {
        return hasSillage;
    }

    public void setHasSillage(List<String> hasSillage) {
        this.hasSillage = (hasSillage != null ? hasSillage : new ArrayList<>());
    }

    public String getBrandName() {
        return brandName;
    }

    public void setBrandName(String brandName) {
        this.brandName = brandName;
    }

    public String getFragranceName() {
        return fragranceName;
    }

    public void setFragranceName(String fragranceName) {
        this.fragranceName = fragranceName;
    }

    public Integer getCount() {
        return count;
    }

    public void setCount(Integer count) {
        this.count = count;
    }
}
