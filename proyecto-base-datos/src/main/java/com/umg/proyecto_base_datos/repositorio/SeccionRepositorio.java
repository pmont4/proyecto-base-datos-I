package com.umg.proyecto_base_datos.repositorio;

import com.umg.proyecto_base_datos.entidad.seccion.Seccion;
import com.umg.proyecto_base_datos.util.Utils;
import io.agroal.api.AgroalDataSource;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class SeccionRepositorio implements Repositorio<Seccion> {

    private final AgroalDataSource agroalDataSource;

    @Inject
    Logger logger;

    @Inject
    public SeccionRepositorio(AgroalDataSource agroalDataSource) {
        this.agroalDataSource = agroalDataSource;
    }

    @Override
    public List<Seccion> listar() {
        List<Seccion> secciones = new ArrayList<>();

        try (Connection connection = this.agroalDataSource.getConnection();
             PreparedStatement preparedStatement = connection.prepareStatement(
                     "SELECT IdSeccion, IdCurso, IdDocente, CicloAcademico, SeccionCodigo, CupoMaximo FROM Seccion"
             );
             ResultSet resultSet = preparedStatement.executeQuery()) {
            while (resultSet.next()) {
                Seccion seccion = new Seccion();
                seccion.setIdSeccion(resultSet.getInt("IdSeccion"));
                seccion.setCursoId(resultSet.getInt("IdCurso"));
                seccion.setDocenteId(resultSet.getInt("IdDocente"));
                seccion.setCicloAcademico(resultSet.getString("CicloAcademico"));
                seccion.setSeccionCodigo(resultSet.getString("SeccionCodigo").charAt(0));
                seccion.setCupoMaximo(resultSet.getInt("CupoMaximo"));
                secciones.add(seccion);
            }
        } catch (SQLException e) {
            logger.error(e);
        }

        return secciones;
    }

    @Override
    public Optional<Seccion> obtener(int id) {
        Optional<Seccion> optionalSeccion = Optional.empty();

        try (Connection connection = this.agroalDataSource.getConnection();
             PreparedStatement preparedStatement = connection.prepareStatement(
                     "SELECT IdSeccion, IdCurso, IdDocente, CicloAcademico, SeccionCodigo, CupoMaximo FROM Seccion WHERE IdSeccion = ?"
             )) {
             try (ResultSet resultSet = preparedStatement.executeQuery()) {
                if (resultSet.next()) {
                    Seccion seccion = new Seccion();
                    seccion.setIdSeccion(resultSet.getInt("IdSeccion"));
                    seccion.setCursoId(resultSet.getInt("IdCurso"));
                    seccion.setDocenteId(resultSet.getInt("IdDocente"));
                    seccion.setCicloAcademico(resultSet.getString("CicloAcademico"));
                    seccion.setSeccionCodigo(resultSet.getString("SeccionCodigo").charAt(0));
                    seccion.setCupoMaximo(resultSet.getInt("CupoMaximo"));
                    optionalSeccion = Optional.of(seccion);
                }
            }
        } catch (SQLException e) {
            logger.error(e);
        }

        return optionalSeccion;
    }

    @Override
    public Seccion crear(Seccion tipo) {
        try (Connection connection = this.agroalDataSource.getConnection();
            PreparedStatement preparedStatement = connection.prepareStatement(
                    "INSERT INTO Seccion (IdCurso, IdDocente, CicloAcademico, SeccionCodigo, CupoMaximo) VALUES (?, ?, ?, ?, ?)",
                    Statement.RETURN_GENERATED_KEYS
            )) {
            preparedStatement.setInt(1, tipo.getCursoId());
            preparedStatement.setInt(2, tipo.getDocenteId());
            preparedStatement.setString(3, tipo.getCicloAcademico());
            preparedStatement.setString(4, String.valueOf(tipo.getSeccionCodigo()));
            preparedStatement.setInt(5, tipo.getCupoMaximo());
            int rows = preparedStatement.executeUpdate();
            if (rows > 0) {
                int idNuevaSeccion = Utils.getInstance().getLatestId(preparedStatement);
                tipo.setIdSeccion(idNuevaSeccion);
                return tipo;
            }
        } catch (SQLException e) {
            logger.error(e);
        }
        return null;
    }

    @Override
    public Seccion actualizar(Seccion tipo) {
        try (Connection connection = this.agroalDataSource.getConnection();
            PreparedStatement preparedStatement = connection.prepareStatement(
                    "UPDATE Seccion SET IdCurso = ?, IdDocente = ?, CicloAcademico = ?, SeccionCodigo = ?, CupoMaximo = ? WHERE IdSeccion = ?"
            )) {
            preparedStatement.setInt(1, tipo.getCursoId());
            preparedStatement.setInt(2, tipo.getDocenteId());
            preparedStatement.setString(3, tipo.getCicloAcademico());
            preparedStatement.setString(4, String.valueOf(tipo.getSeccionCodigo()));
            preparedStatement.setInt(5, tipo.getCupoMaximo());
            preparedStatement.setInt(6, tipo.getIdSeccion());
            int rows = preparedStatement.executeUpdate();
            if (rows > 0) {
                return tipo;
            }
        } catch (SQLException e) {
            logger.error(e);
        }
        return null;
    }

    @Override
    public boolean eliminar(int id) {
        try (Connection connection = this.agroalDataSource.getConnection();
             PreparedStatement preparedStatement = connection.prepareStatement(
                     "DELETE FROM Seccion WHERE IdSeccion = ?"
             )) {
            preparedStatement.setInt(1, id);
            int rows = preparedStatement.executeUpdate();
            return rows > 0;
        } catch (SQLException e) {
            logger.error(e);
        }
        return false;
    }

    @Override
    public boolean existe(int id) {
        try (Connection connection = this.agroalDataSource.getConnection();
             PreparedStatement preparedStatement = connection.prepareStatement(
                     "SELECT IdSeccion FROM Seccion WHERE IdSeccion=?"
             )) {
            preparedStatement.setInt(1, id);
            try (ResultSet resultSet = preparedStatement.executeQuery()) {
                return resultSet.next();
            }
        } catch (SQLException e) {
            logger.error(e);
        }
        return false;
    }

}
