package com.umg.proyecto_base_datos.entidad.seccion;

import com.umg.proyecto_base_datos.entidad.Curso;
import com.umg.proyecto_base_datos.entidad.Docente;

public class Seccion {

    private int idSeccion;
    private Curso curso;
    private Docente docente;
    private String cicloAcademico;
    private char seccionCodigo;
    private int cupoMaximo;
    private SeccionHorario seccionHorario;

    public Seccion() {
    }

    public int getIdSeccion() {
        return idSeccion;
    }

    public void setIdSeccion(int idSeccion) {
        this.idSeccion = idSeccion;
    }

    public Curso getCurso() {
        return curso;
    }

    public void setCurso(Curso curso) {
        this.curso = curso;
    }

    public Docente getDocente() {
        return docente;
    }

    public void setDocente(Docente docente) {
        this.docente = docente;
    }

    public String getCicloAcademico() {
        return cicloAcademico;
    }

    public void setCicloAcademico(String cicloAcademico) {
        this.cicloAcademico = cicloAcademico;
    }

    public char getSeccionCodigo() {
        return seccionCodigo;
    }

    public void setSeccionCodigo(char seccionCodigo) {
        this.seccionCodigo = seccionCodigo;
    }

    public int getCupoMaximo() {
        return cupoMaximo;
    }

    public void setCupoMaximo(int cupoMaximo) {
        this.cupoMaximo = cupoMaximo;
    }

    public SeccionHorario getSeccionHorario() {
        return seccionHorario;
    }

    public void setSeccionHorario(SeccionHorario seccionHorario) {
        this.seccionHorario = seccionHorario;
    }

    @Override
    public String toString() {
        return "Seccion{" +
                "idSeccion=" + idSeccion +
                ", curso=" + curso +
                ", docente=" + docente +
                ", cicloAcademico='" + cicloAcademico + '\'' +
                ", seccionCodigo=" + seccionCodigo +
                ", cupoMaximo=" + cupoMaximo +
                ", seccionHorario=" + seccionHorario +
                '}';
    }

}
