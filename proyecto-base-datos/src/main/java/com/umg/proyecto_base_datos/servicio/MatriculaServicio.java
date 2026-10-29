package com.umg.proyecto_base_datos.servicio;

import com.umg.proyecto_base_datos.entidad.Estado;
import com.umg.proyecto_base_datos.entidad.Estudiante;
import com.umg.proyecto_base_datos.entidad.Matricula;
import com.umg.proyecto_base_datos.entidad.Pago;
import com.umg.proyecto_base_datos.entidad.seccion.Seccion;
import com.umg.proyecto_base_datos.repositorio.MatriculaRepositorio;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class MatriculaServicio implements Servicio<Matricula> {

    private final MatriculaRepositorio matriculaRepositorio;

    private final SeccionServicio seccionServicio;
    private final EstudianteServicio estudianteServicio;
    private final PagoServicio pagoServicio;

    @Inject
    public MatriculaServicio(MatriculaRepositorio matriculaRepositorio, SeccionServicio seccionServicio, EstudianteServicio estudianteServicio, PagoServicio pagoServicio) {
        this.matriculaRepositorio = matriculaRepositorio;
        this.seccionServicio = seccionServicio;
        this.estudianteServicio = estudianteServicio;
        this.pagoServicio = pagoServicio;
    }

    @Override
    public List<Matricula> listar() {
        List<Matricula> matriculas = this.matriculaRepositorio.listar();

        if (matriculas.isEmpty()) return matriculas;

        for (Matricula matricula : matriculas) {
            Optional<Seccion> optionalSeccion = this.seccionServicio.obtener(matricula.getSeccionId());
            optionalSeccion.ifPresent(matricula::setSeccion);

            Optional<Estudiante> optionalEstudiante = this.estudianteServicio.obtener(matricula.getEstudianteId());
            optionalEstudiante.ifPresent(matricula::setEstudiante);

            Optional<Pago> optionalPago = this.pagoServicio.obtener(matricula.getIdMatricula());
            optionalPago.ifPresent(matricula::setPago);
        }

        return matriculas;
    }

    @Override
    public Optional<Matricula> obtener(int id) {
        Optional<Matricula> optionalMatricula = this.matriculaRepositorio.obtener(id);

        if (optionalMatricula.isEmpty()) return Optional.empty();

        Matricula matricula = optionalMatricula.get();
        Optional<Seccion> optionalSeccion = this.seccionServicio.obtener(matricula.getSeccionId());
        optionalSeccion.ifPresent(matricula::setSeccion);

        Optional<Estudiante> optionalEstudiante = this.estudianteServicio.obtener(matricula.getEstudianteId());
        optionalEstudiante.ifPresent(matricula::setEstudiante);

        Optional<Pago> optionalPago = this.pagoServicio.obtener(matricula.getIdMatricula());
        optionalPago.ifPresent(matricula::setPago);

        return Optional.of(matricula);
    }

    @Transactional(rollbackOn = SQLException.class)
    @Override
    public Matricula crear(Matricula tipo) {
        return this.matriculaRepositorio.crear(tipo);
    }

    @Transactional(rollbackOn = SQLException.class)
    @Override
    public Matricula actualizar(Matricula tipo) {
        return this.matriculaRepositorio.actualizar(tipo);
    }

    @Transactional(rollbackOn = SQLException.class)
    @Override
    public boolean eliminar(int id) {
        boolean borrarPago = this.pagoServicio.eliminar(id);
        if (!borrarPago) return false;

        return this.matriculaRepositorio.eliminar(id);
    }

    @Override
    public boolean existe(int id) {
        return this.matriculaRepositorio.existe(id);
    }

    @Transactional(rollbackOn = SQLException.class)
    boolean actualizarEstadoMatricula(int id, Estado estado) {
        return this.matriculaRepositorio.actualizarEstadoMatricula(id, estado);
    }

}
