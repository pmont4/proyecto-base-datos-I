package com.umg.proyecto_base_datos.servicio;

import com.umg.proyecto_base_datos.entidad.seccion.SeccionHorario;
import com.umg.proyecto_base_datos.repositorio.SeccionHorarioRepositorio;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class SeccionHorarioServicio implements Servicio<SeccionHorario> {

    private final SeccionHorarioRepositorio seccionHorarioRepositorio;

    @Inject
    public SeccionHorarioServicio(SeccionHorarioRepositorio seccionHorarioRepositorio) {
        this.seccionHorarioRepositorio = seccionHorarioRepositorio;
    }

    @Override
    public List<SeccionHorario> listar() {
        return this.seccionHorarioRepositorio.listar();
    }

    @Override
    public Optional<SeccionHorario> obtener(int id) {
        return this.seccionHorarioRepositorio.obtener(id);
    }

    @Transactional(rollbackOn = SQLException.class)
    @Override
    public SeccionHorario crear(SeccionHorario tipo) {
        return this.seccionHorarioRepositorio.crear(tipo);
    }

    @Transactional(rollbackOn = SQLException.class)
    @Override
    public SeccionHorario actualizar(SeccionHorario tipo) {
        return this.seccionHorarioRepositorio.actualizar(tipo);
    }

    @Transactional(rollbackOn = SQLException.class)
    @Override
    public boolean eliminar(int id) {
        return this.seccionHorarioRepositorio.eliminar(id);
    }

    @Override
    public boolean existe(int id) {
        return this.seccionHorarioRepositorio.existe(id);
    }

}
