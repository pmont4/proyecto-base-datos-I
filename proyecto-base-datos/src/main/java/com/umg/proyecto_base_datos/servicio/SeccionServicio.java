package com.umg.proyecto_base_datos.servicio;

import com.umg.proyecto_base_datos.entidad.Curso;
import com.umg.proyecto_base_datos.entidad.Docente;
import com.umg.proyecto_base_datos.entidad.seccion.Seccion;
import com.umg.proyecto_base_datos.entidad.seccion.SeccionHorario;
import com.umg.proyecto_base_datos.repositorio.SeccionRepositorio;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class SeccionServicio implements Servicio<Seccion> {

    private final SeccionRepositorio seccionRepositorio;

    private final CursoServicio cursoServicio;
    private final DocenteServicio docenteServicio;
    private final SeccionHorarioServicio seccionHorarioServicio;

    @Inject
    public SeccionServicio(SeccionRepositorio seccionRepositorio, CursoServicio cursoServicio, DocenteServicio docenteServicio, SeccionHorarioServicio seccionHorarioServicio) {
        this.seccionRepositorio = seccionRepositorio;
        this.cursoServicio = cursoServicio;
        this.docenteServicio = docenteServicio;
        this.seccionHorarioServicio = seccionHorarioServicio;
    }

    @Override
    public List<Seccion> listar() {
        List<Seccion> secciones = this.seccionRepositorio.listar();

        if (secciones.isEmpty()) return secciones;

        for (Seccion seccion : secciones) {
            Optional<Curso> optionalCurso = this.cursoServicio.obtener(seccion.getCursoId());
            optionalCurso.ifPresent(seccion::setCurso);

            Optional<Docente> optionalDocente = this.docenteServicio.obtener(seccion.getDocenteId());
            optionalDocente.ifPresent(seccion::setDocente);

            Optional<SeccionHorario> optionalSeccionHorario = this.seccionHorarioServicio.obtener(seccion.getIdSeccion());
            optionalSeccionHorario.ifPresent(seccion::setSeccionHorario);
        }

        return secciones;
    }

    @Override
    public Optional<Seccion> obtener(int id) {
        Optional<Seccion> optionalSeccion = this.seccionRepositorio.obtener(id);

        if (optionalSeccion.isEmpty()) return Optional.empty();

        Seccion seccion = optionalSeccion.get();
        Optional<Curso> optionalCurso = this.cursoServicio.obtener(seccion.getCursoId());
        optionalCurso.ifPresent(seccion::setCurso);

        Optional<Docente> optionalDocente = this.docenteServicio.obtener(seccion.getDocenteId());
        optionalDocente.ifPresent(seccion::setDocente);

        Optional<SeccionHorario> optionalSeccionHorario = this.seccionHorarioServicio.obtener(seccion.getIdSeccion());
        optionalSeccionHorario.ifPresent(seccion::setSeccionHorario);
        return Optional.of(seccion);
    }

    @Transactional(rollbackOn = SQLException.class)
    @Override
    public Seccion crear(Seccion tipo) {
        Optional<Seccion> optionalSeccion = Optional.ofNullable(this.seccionRepositorio.crear(tipo));

        if (optionalSeccion.isEmpty()) return null;

        Seccion seccion = optionalSeccion.get();
        tipo.setIdSeccion(seccion.getIdSeccion());
        tipo.getSeccionHorario().setIdSeccion(seccion.getIdSeccion());

        Optional<SeccionHorario> optionalSeccionHorario = Optional.ofNullable(this.seccionHorarioServicio.crear(tipo.getSeccionHorario()));
        if (optionalSeccionHorario.isEmpty()) return null;
        tipo.setSeccionHorario(optionalSeccionHorario.get());
        return tipo;
    }

    @Transactional(rollbackOn = SQLException.class)
    @Override
    public Seccion actualizar(Seccion tipo) {
        Optional<Seccion> optionalSeccion = Optional.ofNullable(this.seccionRepositorio.actualizar(tipo));

        if (optionalSeccion.isEmpty()) return null;

        Optional<SeccionHorario> optionalSeccionHorario;
        if (!this.seccionHorarioServicio.existe(tipo.getIdSeccion())) {
            optionalSeccionHorario = Optional.ofNullable(this.seccionHorarioServicio.crear(tipo.getSeccionHorario()));
        } else {
            optionalSeccionHorario = Optional.ofNullable(this.seccionHorarioServicio.actualizar(tipo.getSeccionHorario()));
        }

        if (optionalSeccionHorario.isEmpty()) return null;
        tipo.setSeccionHorario(optionalSeccionHorario.get());

        return tipo;
    }

    @Transactional(rollbackOn = SQLException.class)
    @Override
    public boolean eliminar(int id) {
        boolean eliminarSeccionHorario = this.seccionHorarioServicio.eliminar(id);
        if (!eliminarSeccionHorario) return false;

        return this.seccionRepositorio.eliminar(id);
    }

    @Override
    public boolean existe(int id) {
        return this.seccionRepositorio.existe(id);
    }

}
