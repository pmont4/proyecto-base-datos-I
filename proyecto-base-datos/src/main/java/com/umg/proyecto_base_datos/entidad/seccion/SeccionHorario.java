package com.umg.proyecto_base_datos.entidad.seccion;

import java.time.LocalTime;

public class SeccionHorario {

    private int idSeccionHorario;
    private int idSeccion;
    private int diaSemana;
    private LocalTime horaInicio;
    private LocalTime horaFin;
    private String aula;

    public SeccionHorario() {
    }

    public int getIdSeccionHorario() {
        return idSeccionHorario;
    }

    public void setIdSeccionHorario(int idSeccionHorario) {
        this.idSeccionHorario = idSeccionHorario;
    }

    public int getIdSeccion() {
        return idSeccion;
    }

    public void setIdSeccion(int idSeccion) {
        this.idSeccion = idSeccion;
    }

    public int getDiaSemana() {
        return diaSemana;
    }

    public void setDiaSemana(int diaSemana) {
        this.diaSemana = diaSemana;
    }

    public LocalTime getHoraInicio() {
        return horaInicio;
    }

    public void setHoraInicio(LocalTime horaInicio) {
        this.horaInicio = horaInicio;
    }

    public LocalTime getHoraFin() {
        return horaFin;
    }

    public void setHoraFin(LocalTime horaFin) {
        this.horaFin = horaFin;
    }

    public String getAula() {
        return aula;
    }

    public void setAula(String aula) {
        this.aula = aula;
    }

    @Override
    public String toString() {
        return "SeccionHorario{" +
                "idSeccionHorario=" + idSeccionHorario +
                ", idSeccion=" + idSeccion +
                ", diaSemana=" + diaSemana +
                ", horaInicio=" + horaInicio +
                ", horaFin=" + horaFin +
                ", aula='" + aula + '\'' +
                '}';
    }

}
