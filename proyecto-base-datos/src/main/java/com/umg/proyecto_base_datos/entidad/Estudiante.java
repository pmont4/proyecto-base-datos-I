package com.umg.proyecto_base_datos.entidad;

import com.fasterxml.jackson.annotation.JsonIgnore;

public class Estudiante {

    private int idEstudiante;
    private String carnet;
    private String nombre;
    private String apellido;

    @JsonIgnore
    private int carrearId;
    private Carrera carrera;

    private String telefono;
    private String correo;

    public Estudiante() {
    }

    public int getIdEstudiante() {
        return idEstudiante;
    }

    public void setIdEstudiante(int idEstudiante) {
        this.idEstudiante = idEstudiante;
    }

    public String getCarnet() {
        return carnet;
    }

    public void setCarnet(String carnet) {
        this.carnet = carnet;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getApellido() {
        return apellido;
    }

    public void setApellido(String apellido) {
        this.apellido = apellido;
    }

    public int getCarrearId() {
        return carrearId;
    }

    public void setCarrearId(int carrearId) {
        this.carrearId = carrearId;
    }

    public Carrera getCarrera() {
        return carrera;
    }

    public void setCarrera(Carrera carrera) {
        this.carrera = carrera;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public String getCorreo() {
        return correo;
    }

    public void setCorreo(String correo) {
        this.correo = correo;
    }

    @Override
    public String toString() {
        return "Estudiante{" +
                "idEstudiante=" + idEstudiante +
                ", carnet='" + carnet + '\'' +
                ", nombre='" + nombre + '\'' +
                ", apellido='" + apellido + '\'' +
                ", carrera=" + carrera +
                ", telefono=" + telefono +
                ", correo='" + correo + '\'' +
                '}';
    }

}
