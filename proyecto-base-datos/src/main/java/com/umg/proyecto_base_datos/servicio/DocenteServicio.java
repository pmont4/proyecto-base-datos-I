package com.umg.proyecto_base_datos.servicio;

import com.umg.proyecto_base_datos.entidad.Docente;
import com.umg.proyecto_base_datos.repositorio.DocenteRepositorio;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class DocenteServicio implements Servicio<Docente> {

    private final DocenteRepositorio docenteRepositorio;

    @Inject
    public DocenteServicio(DocenteRepositorio docenteRepositorio) {
        this.docenteRepositorio = docenteRepositorio;
    }

    @Override
    public List<Docente> listar() {
        return this.docenteRepositorio.listar();
    }

    @Override
    public Optional<Docente> obtener(int id) {
        return this.docenteRepositorio.obtener(id);
    }

    @Transactional(rollbackOn = SQLException.class)
    @Override
    public Docente crear(Docente tipo) {
        return this.docenteRepositorio.crear(tipo);
    }

    @Transactional(rollbackOn = SQLException.class)
    @Override
    public Docente actualizar(Docente tipo) {
        return this.docenteRepositorio.actualizar(tipo);
    }

    @Transactional(rollbackOn = SQLException.class)
    @Override
    public boolean eliminar(int id) {
        return this.docenteRepositorio.eliminar(id);
    }

    @Override
    public boolean existe(int id) {
        return this.docenteRepositorio.existe(id);
    }

}
