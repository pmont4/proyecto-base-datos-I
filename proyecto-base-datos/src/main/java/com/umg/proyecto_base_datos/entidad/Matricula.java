package com.umg.proyecto_base_datos.entidad;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.umg.proyecto_base_datos.entidad.seccion.Seccion;

import java.time.LocalDateTime;

public class Matricula {

    private int idMatricula;

    @JsonIgnore
    private int estudianteId;
    private Estudiante estudiante;

    @JsonIgnore
    private int seccionId;
    private Seccion seccion;

    private LocalDateTime fechaInscripcion;
    private Estado estado;

    private Pago pago;

    public int getIdMatricula() {
        return idMatricula;
    }

    public void setIdMatricula(int idMatricula) {
        this.idMatricula = idMatricula;
    }

    public int getEstudianteId() {
        return estudianteId;
    }

    public void setEstudianteId(int estudianteId) {
        this.estudianteId = estudianteId;
    }

    public Estudiante getEstudiante() {
        return estudiante;
    }

    public void setEstudiante(Estudiante estudiante) {
        this.estudiante = estudiante;
    }

    public int getSeccionId() {
        return seccionId;
    }

    public void setSeccionId(int seccionId) {
        this.seccionId = seccionId;
    }

    public Seccion getSeccion() {
        return seccion;
    }

    public void setSeccion(Seccion seccion) {
        this.seccion = seccion;
    }

    public LocalDateTime getFechaInscripcion() {
        return fechaInscripcion;
    }

    public void setFechaInscripcion(LocalDateTime fechaInscripcion) {
        this.fechaInscripcion = fechaInscripcion;
    }

    public Estado getEstado() {
        return estado;
    }

    public void setEstado(Estado estado) {
        this.estado = estado;
    }

    public Pago getPago() {
        return pago;
    }

    public void setPago(Pago pago) {
        this.pago = pago;
    }

    @Override
    public String toString() {
        return "Matricula{" +
                "idMatricula=" + idMatricula +
                ", estudianteId=" + estudianteId +
                ", estudiante=" + estudiante +
                ", seccionId=" + seccionId +
                ", seccion=" + seccion +
                ", fechaInscripcion=" + fechaInscripcion +
                ", estado=" + estado +
                ", pago=" + pago +
                '}';
    }

}
