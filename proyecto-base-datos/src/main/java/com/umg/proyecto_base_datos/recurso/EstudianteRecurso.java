package com.umg.proyecto_base_datos.recurso;

import com.umg.proyecto_base_datos.entidad.Estudiante;
import com.umg.proyecto_base_datos.servicio.EstudianteServicio;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;
import java.util.Optional;

@Path("/estudiante/")
public class EstudianteRecurso implements Recurso<Estudiante> {

    private final EstudianteServicio estudianteServicio;

    @Inject
    public EstudianteRecurso(EstudianteServicio estudianteServicio) {
        this.estudianteServicio = estudianteServicio;
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Override
    public Response listar() {
        List<Estudiante> estudiantes = estudianteServicio.listar();
        if (estudiantes.isEmpty()) return Response.status(Response.Status.NOT_FOUND).build();
        return Response.status(Response.Status.OK).entity(estudiantes).build();
    }

    @GET
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    @Override
    public Response obtener(@PathParam("id") int id) {
        Optional<Estudiante> optionalEstudiante = estudianteServicio.obtener(id);
        if (optionalEstudiante.isEmpty()) return Response.status(Response.Status.NOT_FOUND).build();
        return Response.status(Response.Status.OK).entity(optionalEstudiante.get()).build();
    }

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @Override
    public Response crear(Estudiante tipo) {
        Optional<Estudiante> optionalEstudiante = Optional.ofNullable(this.estudianteServicio.crear(tipo));
        if (optionalEstudiante.isEmpty()) return Response.status(Response.Status.NOT_FOUND).build();
        return Response.status(Response.Status.OK).entity(optionalEstudiante.get()).build();
    }

    @PUT
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @Override
    public Response actualizar(Estudiante tipo) {
        Optional<Estudiante> optionalEstudiante = Optional.ofNullable(this.estudianteServicio.actualizar(tipo));
        if (optionalEstudiante.isEmpty()) return Response.status(Response.Status.NOT_FOUND).build();
        return Response.status(Response.Status.OK).entity(optionalEstudiante.get()).build();
    }

    @DELETE
    @Path("/{id}")
    @Override
    public Response eliminar(@PathParam("id") int id) {
        if (this.estudianteServicio.eliminar(id)) {
            return Response.status(Response.Status.NO_CONTENT).build();
        } else {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
    }

}
