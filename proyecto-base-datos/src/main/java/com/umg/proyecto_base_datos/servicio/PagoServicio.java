package com.umg.proyecto_base_datos.servicio;

import com.umg.proyecto_base_datos.entidad.Pago;
import com.umg.proyecto_base_datos.repositorio.PagoRepositorio;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class PagoServicio implements Servicio<Pago> {

    private final PagoRepositorio pagoRepositorio;

    private final MatriculaServicio matriculaServicio;

    @Inject
    public PagoServicio(PagoRepositorio pagoRepositorio, MatriculaServicio matriculaServicio) {
        this.pagoRepositorio = pagoRepositorio;
        this.matriculaServicio = matriculaServicio;
    }

    @Override
    public List<Pago> listar() {
        return this.pagoRepositorio.listar();
    }

    @Override
    public Optional<Pago> obtener(int id) {
        return this.pagoRepositorio.obtener(id);
    }

    @Transactional(rollbackOn = SQLException.class)
    @Override
    public Pago crear(Pago tipo) {
        Optional<Pago> optionalPago = Optional.ofNullable(this.pagoRepositorio.crear(tipo));

        if (optionalPago.isEmpty()) return null;

        Pago pago = optionalPago.get();
        int idMatricula = pago.getIdMatricula();

        if (this.matriculaServicio.actualizarEstadoMatricula(idMatricula)) {
            return pago;
        }

        return null;
    }

    @Transactional(rollbackOn = SQLException.class)
    @Override
    public Pago actualizar(Pago tipo) {
        return this.pagoRepositorio.actualizar(tipo);
    }

    @Transactional(rollbackOn = SQLException.class)
    @Override
    public boolean eliminar(int id) {
        return this.pagoRepositorio.eliminar(id);
    }

    @Override
    public boolean existe(int id) {
        return this.pagoRepositorio.existe(id);
    }

}
