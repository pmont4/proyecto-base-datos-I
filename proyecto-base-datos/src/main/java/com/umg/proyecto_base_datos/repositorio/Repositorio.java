package com.umg.proyecto_base_datos.repositorio;

import java.util.List;

public interface Repositorio<T> {

    List<T> listar();
    T crear(T tipo);
    T actualizar(T tipo);
    boolean eliminar(int id);
    boolean existe(int id);

}
