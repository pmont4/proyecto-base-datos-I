package com.umg.proyecto_base_datos.entidad.seccion;

import java.time.LocalDateTime;

public class SeccionHorario {

    private int idSeccionHorario;
    private int idSeccion;
    private int diaSemana;
    private LocalDateTime horaInicio;
    private LocalDateTime horaFin;
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

    public LocalDateTime getHoraInicio() {
        return horaInicio;
    }

    public void setHoraInicio(LocalDateTime horaInicio) {
        this.horaInicio = horaInicio;
    }

    public LocalDateTime getHoraFin() {
        return horaFin;
    }

    public void setHoraFin(LocalDateTime horaFin) {
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
