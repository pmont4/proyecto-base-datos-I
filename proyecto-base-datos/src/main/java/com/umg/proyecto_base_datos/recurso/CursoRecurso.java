package com.umg.proyecto_base_datos.recurso;

import com.umg.proyecto_base_datos.entidad.Curso;
import com.umg.proyecto_base_datos.servicio.CursoServicio;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;
import java.util.Optional;

@Path("/curso/")
public class CursoRecurso implements Recurso<Curso> {

    private final CursoServicio cursoServicio;

    @Inject
    public CursoRecurso(CursoServicio cursoServicio) {
        this.cursoServicio = cursoServicio;
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Override
    public Response listar() {
        List<Curso> cursos = cursoServicio.listar();
        if (cursos.isEmpty()) return Response.status(Response.Status.NOT_FOUND).build();
        return Response.status(Response.Status.OK).entity(cursos).build();
    }

    @GET
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    @Override
    public Response obtener(@PathParam("id") int id) {
        Optional<Curso> optionalCurso = this.cursoServicio.obtener(id);
        if (optionalCurso.isEmpty()) return Response.status(Response.Status.NOT_FOUND).build();
        return Response.status(Response.Status.OK).entity(optionalCurso.get()).build();
    }

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @Override
    public Response crear(Curso tipo) {
        Optional<Curso> optionalCurso = Optional.ofNullable(this.cursoServicio.crear(tipo));
        if (optionalCurso.isEmpty()) return Response.status(Response.Status.BAD_REQUEST).build();
        return Response.status(Response.Status.OK).entity(optionalCurso.get()).build();
    }

    @PUT
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @Override
    public Response actualizar(Curso tipo) {
        Optional<Curso> optionalCurso = Optional.ofNullable(this.cursoServicio.actualizar(tipo));
        if (optionalCurso.isEmpty()) return Response.status(Response.Status.BAD_REQUEST).build();
        return Response.status(Response.Status.OK).entity(optionalCurso.get()).build();
    }

    @DELETE
    @Path("/{id}")
    @Override
    public Response eliminar(@PathParam("id") int id) {
        if (this.cursoServicio.eliminar(id)) {
            return Response.status(Response.Status.NO_CONTENT).build();
        } else {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
    }

}
