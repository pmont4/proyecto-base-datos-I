package com.umg.proyecto_base_datos.recurso;

import com.umg.proyecto_base_datos.entidad.Pago;
import com.umg.proyecto_base_datos.servicio.PagoServicio;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.Optional;

@Path("/pago/")
public class PagoRecurso implements Recurso<Pago> {

    private final PagoServicio pagoServicio;

    @Inject
    public PagoRecurso(PagoServicio pagoServicio) {
        this.pagoServicio = pagoServicio;
    }

    @Override
    public Response listar() {
        return null;
    }

    @Override
    public Response obtener(int id) {
        return null;
    }

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @Override
    public Response crear(Pago tipo) {
        Optional<Pago> optionalPago = Optional.ofNullable(this.pagoServicio.crear(tipo));
        if (optionalPago.isEmpty())  return Response.status(Response.Status.BAD_REQUEST).build();
        return Response.status(Response.Status.OK).entity(optionalPago.get()).build();
    }

    @PUT
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @Override
    public Response actualizar(Pago tipo) {
        Optional<Pago> optionalPago = Optional.ofNullable(this.pagoServicio.actualizar(tipo));
        if (optionalPago.isEmpty())  return Response.status(Response.Status.BAD_REQUEST).build();
        return Response.status(Response.Status.OK).entity(optionalPago.get()).build();
    }

    @Override
    public Response eliminar(int id) {
        return null;
    }

}
