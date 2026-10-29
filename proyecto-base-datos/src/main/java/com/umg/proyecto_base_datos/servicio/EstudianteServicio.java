package com.umg.proyecto_base_datos.servicio;

import com.umg.proyecto_base_datos.entidad.Carrera;
import com.umg.proyecto_base_datos.entidad.Estudiante;
import com.umg.proyecto_base_datos.repositorio.EstudianteRepositorio;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class EstudianteServicio implements Servicio<Estudiante> {

    private final EstudianteRepositorio estudianteRepositorio;
    private final CarreraSerivicio carreraSerivicio;

    @Inject
    public EstudianteServicio(EstudianteRepositorio estudianteRepositorio, CarreraSerivicio carreraSerivicio) {
        this.estudianteRepositorio = estudianteRepositorio;
        this.carreraSerivicio = carreraSerivicio;
    }

    @Override
    public List<Estudiante> listar() {
        List<Estudiante> baseLista = this.estudianteRepositorio.listar();

        if (baseLista.isEmpty()) return baseLista;

        for (Estudiante estudiante : baseLista) {
            Optional<Carrera> optionalCarrera = this.carreraSerivicio.obtener(estudiante.getCarrearId());
            optionalCarrera.ifPresent(estudiante::setCarrera);
        }

        return baseLista;
    }

    @Override
    public Optional<Estudiante> obtener(int id) {
        Optional<Estudiante> optional = this.estudianteRepositorio.obtener(id);

        if (optional.isEmpty()) return Optional.empty();

        Estudiante estudiante = optional.get();
        Optional<Carrera> optionalCarrera = this.carreraSerivicio.obtener(estudiante.getCarrearId());
        optionalCarrera.ifPresent(estudiante::setCarrera);
        return Optional.of(estudiante);
    }

    @Transactional(rollbackOn = SQLException.class)
    @Override
    public Estudiante crear(Estudiante tipo) {
        return this.estudianteRepositorio.crear(tipo);
    }

    @Transactional(rollbackOn = SQLException.class)
    @Override
    public Estudiante actualizar(Estudiante tipo) {
        return this.estudianteRepositorio.actualizar(tipo);
    }

    @Transactional(rollbackOn = SQLException.class)
    @Override
    public boolean eliminar(int id) {
        return this.estudianteRepositorio.eliminar(id);
    }

    @Override
    public boolean existe(int id) {
        return this.estudianteRepositorio.existe(id);
    }

}
