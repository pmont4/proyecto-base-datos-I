package com.umg.proyecto_base_datos.recurso;

import com.umg.proyecto_base_datos.entidad.seccion.Seccion;
import com.umg.proyecto_base_datos.servicio.SeccionServicio;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;
import java.util.Optional;

@Path("/seccion/")
public class SeccionRecurso implements Recurso<Seccion> {

    private final SeccionServicio seccionServicio;

    @Inject
    public SeccionRecurso(SeccionServicio seccionServicio) {
        this.seccionServicio = seccionServicio;
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Override
    public Response listar() {
        List<Seccion> secciones = this.seccionServicio.listar();
        if (secciones.isEmpty()) return Response.status(Response.Status.NOT_FOUND).build();
        return Response.status(Response.Status.OK).entity(secciones).build();
    }

    @GET
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    @Override
    public Response obtener(@PathParam("id") int id) {
        Optional<Seccion> optionalSeccion = this.seccionServicio.obtener(id);
        if (optionalSeccion.isEmpty()) return Response.status(Response.Status.NOT_FOUND).build();
        return Response.status(Response.Status.OK).entity(optionalSeccion.get()).build();
    }

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @Override
    public Response crear(Seccion tipo) {
        Optional<Seccion> optionalSeccion = Optional.ofNullable(this.seccionServicio.crear(tipo));
        if (optionalSeccion.isEmpty()) return Response.status(Response.Status.BAD_REQUEST).build();
        return Response.status(Response.Status.OK).entity(optionalSeccion.get()).build();
    }

    @PUT
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @Override
    public Response actualizar(Seccion tipo) {
        Optional<Seccion> optionalSeccion = Optional.ofNullable(this.seccionServicio.actualizar(tipo));
        if (optionalSeccion.isEmpty()) return Response.status(Response.Status.BAD_REQUEST).build();
        return Response.status(Response.Status.OK).entity(optionalSeccion.get()).build();
    }

    @DELETE
    @Path("/{id}")
    @Override
    public Response eliminar(@PathParam("id") int id) {
        if (this.seccionServicio.eliminar(id)) {
            return Response.status(Response.Status.NO_CONTENT).build();
        } else {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
    }

}
