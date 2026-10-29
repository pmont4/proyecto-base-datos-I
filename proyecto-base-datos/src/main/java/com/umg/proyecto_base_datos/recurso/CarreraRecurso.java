package com.umg.proyecto_base_datos.recurso;

import com.umg.proyecto_base_datos.entidad.Carrera;
import com.umg.proyecto_base_datos.servicio.CarreraSerivicio;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;
import java.util.Optional;

@Path("/carrera/")
public class CarreraRecurso implements Recurso<Carrera> {

    private final CarreraSerivicio carreraSerivicio;

    @Inject
    public CarreraRecurso(CarreraSerivicio carreraSerivicio) {
        this.carreraSerivicio = carreraSerivicio;
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Override
    public Response listar() {
        List<Carrera> carreras = carreraSerivicio.listar();
        if (carreras.isEmpty()) return Response.status(Response.Status.NOT_FOUND).build();
        return Response.status(Response.Status.OK).entity(carreras).build();
    }

    @GET
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    @Override
    public Response obtener(@PathParam("id") int id) {
        Optional<Carrera> optionalCarrera = this.carreraSerivicio.obtener(id);
        if (optionalCarrera.isEmpty()) return Response.status(Response.Status.NOT_FOUND).build();
        return Response.status(Response.Status.OK).entity(optionalCarrera.get()).build();
    }

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @Override
    public Response crear(Carrera tipo) {
        Optional<Carrera> optionalCarrera = Optional.ofNullable(this.carreraSerivicio.crear(tipo));
        if (optionalCarrera.isEmpty()) return Response.status(Response.Status.NOT_FOUND).build();
        return Response.status(Response.Status.OK).entity(optionalCarrera.get()).build();
    }

    @PUT
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @Override
    public Response actualizar(Carrera tipo) {
        Optional<Carrera> optionalCarrera = Optional.ofNullable(this.carreraSerivicio.actualizar(tipo));
        if (optionalCarrera.isEmpty()) return Response.status(Response.Status.NOT_FOUND).build();
        return Response.status(Response.Status.OK).entity(optionalCarrera.get()).build();
    }

    @DELETE
    @Path("/{id}")
    @Override
    public Response eliminar(@PathParam("id") int id) {
        if (this.carreraSerivicio.eliminar(id)) {
            return Response.status(Response.Status.NO_CONTENT).build();
        } else {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
    }

}
