package com.umg.proyecto_base_datos.servicio;

import com.umg.proyecto_base_datos.entidad.Carrera;
import com.umg.proyecto_base_datos.repositorio.CarreraRepositorio;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class CarreraSerivicio implements Servicio<Carrera> {

    private final CarreraRepositorio carreraRepositorio;

    @Inject
    public CarreraSerivicio(CarreraRepositorio carreraRepositorio) {
        this.carreraRepositorio = carreraRepositorio;
    }

    @Override
    public List<Carrera> listar() {
        return this.carreraRepositorio.listar();
    }

    @Override
    public Optional<Carrera> obtener(int id) {
        return this.carreraRepositorio.obtener(id);
    }

    @Transactional(rollbackOn = SQLException.class)
    @Override
    public Carrera crear(Carrera tipo) {
        return this.carreraRepositorio.crear(tipo);
    }

    @Transactional(rollbackOn = SQLException.class)
    @Override
    public Carrera actualizar(Carrera tipo) {
        return this.carreraRepositorio.actualizar(tipo);
    }

    @Transactional(rollbackOn = SQLException.class)
    @Override
    public boolean eliminar(int id) {
        return this.carreraRepositorio.eliminar(id);
    }

    @Override
    public boolean existe(int id) {
        return this.carreraRepositorio.existe(id);
    }

}
