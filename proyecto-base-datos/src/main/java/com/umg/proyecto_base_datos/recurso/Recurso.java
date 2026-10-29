package com.umg.proyecto_base_datos.recurso;

import jakarta.ws.rs.core.Response;

public interface Recurso<T> {

    Response listar();
    Response obtener(int id);
    Response crear(T tipo);
    Response actualizar(T tipo);
    Response eliminar(int id);

}
