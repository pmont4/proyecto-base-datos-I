package com.umg.proyecto_base_datos.recurso;

import com.umg.proyecto_base_datos.entidad.Docente;
import com.umg.proyecto_base_datos.servicio.DocenteServicio;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;
import java.util.Optional;

@Path("/docente/")
public class DocenteRecurso implements Recurso<Docente> {

    private final DocenteServicio docenteServicio;

    @Inject
    public DocenteRecurso(DocenteServicio docenteServicio) {
        this.docenteServicio = docenteServicio;
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Override
    public Response listar() {
        List<Docente> docentes = this.docenteServicio.listar();
        if (docentes.isEmpty()) return Response.status(Response.Status.NOT_FOUND).build();
        return Response.status(Response.Status.OK).entity(docentes).build();
    }

    @GET
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    @Override
    public Response obtener(@PathParam("id") int id) {
        Optional<Docente> optionalDocente = this.docenteServicio.obtener(id);
        if (optionalDocente.isEmpty()) return Response.status(Response.Status.NOT_FOUND).build();
        return Response.status(Response.Status.OK).entity(optionalDocente.get()).build();
    }

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @Override
    public Response crear(Docente tipo) {
        Optional<Docente> optionalDocente = Optional.ofNullable(this.docenteServicio.crear(tipo));
        if (optionalDocente.isEmpty()) return Response.status(Response.Status.BAD_REQUEST).build();
        return Response.status(Response.Status.OK).entity(optionalDocente.get()).build();
    }

    @PUT
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @Override
    public Response actualizar(Docente tipo) {
        Optional<Docente> optionalDocente = Optional.ofNullable(this.docenteServicio.actualizar(tipo));
        if (optionalDocente.isEmpty()) return Response.status(Response.Status.BAD_REQUEST).build();
        return Response.status(Response.Status.OK).entity(optionalDocente.get()).build();
    }

    @DELETE
    @Path("/{id}")
    @Override
    public Response eliminar(@PathParam("id") int id) {
        if (this.docenteServicio.eliminar(id)) {
            return Response.status(Response.Status.NO_CONTENT).build();
        } else {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
    }

}
