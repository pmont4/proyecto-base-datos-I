package com.umg.proyecto_base_datos.servicio;

import com.umg.proyecto_base_datos.entidad.Curso;
import com.umg.proyecto_base_datos.repositorio.CursoRepositorio;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class CursoServicio implements Servicio<Curso> {

    private final CursoRepositorio cursoRepositorio;

    @Inject
    public CursoServicio(CursoRepositorio cursoRepositorio) {
        this.cursoRepositorio = cursoRepositorio;
    }

    @Override
    public List<Curso> listar() {
        return this.cursoRepositorio.listar();
    }

    @Override
    public Optional<Curso> obtener(int id) {
        return this.cursoRepositorio.obtener(id);
    }

    @Transactional(rollbackOn = SQLException.class)
    @Override
    public Curso crear(Curso tipo) {
        return this.cursoRepositorio.crear(tipo);
    }

    @Transactional(rollbackOn = SQLException.class)
    @Override
    public Curso actualizar(Curso tipo) {
        return this.cursoRepositorio.actualizar(tipo);
    }

    @Transactional(rollbackOn = SQLException.class)
    @Override
    public boolean eliminar(int id) {
        return this.cursoRepositorio.eliminar(id);
    }

    @Override
    public boolean existe(int id) {
        return this.cursoRepositorio.existe(id);
    }

}
