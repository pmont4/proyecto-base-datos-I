package com.umg.proyecto_base_datos.recurso;

import com.umg.proyecto_base_datos.entidad.Matricula;
import com.umg.proyecto_base_datos.servicio.MatriculaServicio;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;
import java.util.Optional;

@Path("/matricula/")
public class MatriculaRecurso implements Recurso<Matricula> {

    private final MatriculaServicio matriculaServicio;

    @Inject
    public MatriculaRecurso(MatriculaServicio matriculaServicio) {
        this.matriculaServicio = matriculaServicio;
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Override
    public Response listar() {
        List<Matricula> matriculas = this.matriculaServicio.listar();
        if (matriculas.isEmpty()) return Response.status(Response.Status.NOT_FOUND).build();
        return Response.status(Response.Status.OK).entity(matriculas).build();
    }

    @GET
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    @Override
    public Response obtener(@PathParam("id") int id) {
        Optional<Matricula> optionalMatricula = this.matriculaServicio.obtener(id);
        if (optionalMatricula.isEmpty()) return Response.status(Response.Status.NOT_FOUND).build();
        return Response.status(Response.Status.OK).entity(optionalMatricula.get()).build();
    }

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @Override
    public Response crear(Matricula tipo) {
        Optional<Matricula> optionalMatricula = Optional.ofNullable(this.matriculaServicio.crear(tipo));
        if (optionalMatricula.isEmpty()) return Response.status(Response.Status.NOT_FOUND).build();
        return Response.status(Response.Status.OK).entity(optionalMatricula.get()).build();
    }

    @PUT
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @Override
    public Response actualizar(Matricula tipo) {
        Optional<Matricula> optionalMatricula = Optional.ofNullable(this.matriculaServicio.actualizar(tipo));
        if (optionalMatricula.isEmpty()) return Response.status(Response.Status.NOT_FOUND).build();
        return Response.status(Response.Status.OK).entity(optionalMatricula.get()).build();
    }

    @Override
    public Response eliminar(int id) {
        if (this.matriculaServicio.eliminar(id)) {
            return Response.status(Response.Status.NO_CONTENT).build();
        } else {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
    }

}
