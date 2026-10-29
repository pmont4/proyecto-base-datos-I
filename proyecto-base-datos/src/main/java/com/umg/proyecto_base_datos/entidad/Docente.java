package com.umg.proyecto_base_datos.entidad;

public class Docente {

    private int idDocente;
    private String nombreDocente;
    private String apellidoDocente;
    private String especialidadDocente;
    private String telefonoDocente;
    private String correoDocente;

    public Docente() {
    }

    public int getIdDocente() {
        return idDocente;
    }

    public void setIdDocente(int idDocente) {
        this.idDocente = idDocente;
    }

    public String getNombreDocente() {
        return nombreDocente;
    }

    public void setNombreDocente(String nombreDocente) {
        this.nombreDocente = nombreDocente;
    }

    public String getApellidoDocente() {
        return apellidoDocente;
    }

    public void setApellidoDocente(String apellidoDocente) {
        this.apellidoDocente = apellidoDocente;
    }

    public String getEspecialidadDocente() {
        return especialidadDocente;
    }

    public void setEspecialidadDocente(String especialidadDocente) {
        this.especialidadDocente = especialidadDocente;
    }

    public String getTelefonoDocente() {
        return telefonoDocente;
    }

    public void setTelefonoDocente(String telefonoDocente) {
        this.telefonoDocente = telefonoDocente;
    }

    public String getCorreoDocente() {
        return correoDocente;
    }

    public void setCorreoDocente(String correoDocente) {
        this.correoDocente = correoDocente;
    }

    @Override
    public String toString() {
        return "Docente{" +
                "idDocente=" + idDocente +
                ", nombreDocente='" + nombreDocente + '\'' +
                ", apellidoDocente='" + apellidoDocente + '\'' +
                ", especialidadDocente='" + especialidadDocente + '\'' +
                ", telefonoDocente='" + telefonoDocente + '\'' +
                ", correoDocente='" + correoDocente + '\'' +
                '}';
    }

}
