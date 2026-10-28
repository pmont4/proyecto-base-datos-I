package com.umg.proyecto_base_datos.entidad;

public class Carrera {

    private int idCarrera;
    private String codigoCarrera;
    private String nombreCarrera;
    private Facultad facultad;

    public Carrera() {
    }

    public int getIdCarrera() {
        return idCarrera;
    }

    public void setIdCarrera(int idCarrera) {
        this.idCarrera = idCarrera;
    }

    public String getCodigoCarrera() {
        return codigoCarrera;
    }

    public void setCodigoCarrera(String codigoCarrera) {
        this.codigoCarrera = codigoCarrera;
    }

    public String getNombreCarrera() {
        return nombreCarrera;
    }

    public void setNombreCarrera(String nombreCarrera) {
        this.nombreCarrera = nombreCarrera;
    }

    public Facultad getFacultad() {
        return facultad;
    }

    public void setFacultad(Facultad facultad) {
        this.facultad = facultad;
    }

    @Override
    public String toString() {
        return "Carrera{" +
                "idCarrera=" + idCarrera +
                ", codigoCarrera='" + codigoCarrera + '\'' +
                ", nombreCarrera='" + nombreCarrera + '\'' +
                ", facultad=" + facultad +
                '}';
    }

}
