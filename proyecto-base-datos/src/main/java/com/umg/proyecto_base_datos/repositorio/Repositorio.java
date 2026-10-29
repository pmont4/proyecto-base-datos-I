package com.umg.proyecto_base_datos.repositorio;

import java.util.List;
import java.util.Optional;

public interface Repositorio<T> {

    List<T> listar();
    Optional<T> obtener(int id);
    T crear(T tipo);
    T actualizar(T tipo);
    boolean eliminar(int id);
    boolean existe(int id);

}
