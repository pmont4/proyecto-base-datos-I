package com.umg.proyecto_base_datos.entidad;

public class Curso {

    private int idCurso;
    private String codigoCurso;
    private String nombreCurso;
    private int creditos;

    public Curso() {
    }

    public int getIdCurso() {
        return idCurso;
    }

    public void setIdCurso(int idCurso) {
        this.idCurso = idCurso;
    }

    public String getCodigoCurso() {
        return codigoCurso;
    }

    public void setCodigoCurso(String codigoCurso) {
        this.codigoCurso = codigoCurso;
    }

    public String getNombreCurso() {
        return nombreCurso;
    }

    public void setNombreCurso(String nombreCurso) {
        this.nombreCurso = nombreCurso;
    }

    public int getCreditos() {
        return creditos;
    }

    public void setCreditos(int creditos) {
        this.creditos = creditos;
    }

    @Override
    public String toString() {
        return "Curso{" +
                "idCurso=" + idCurso +
                ", codigoCurso='" + codigoCurso + '\'' +
                ", nombreCurso='" + nombreCurso + '\'' +
                ", creditos=" + creditos +
                '}';
    }

}
