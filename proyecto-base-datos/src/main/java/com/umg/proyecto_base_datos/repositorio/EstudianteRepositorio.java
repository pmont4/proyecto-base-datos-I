package com.umg.proyecto_base_datos.repositorio;

import com.umg.proyecto_base_datos.entidad.Estudiante;
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
public class EstudianteRepositorio implements Repositorio<Estudiante> {

    private final AgroalDataSource agroalDataSource;

    @Inject
    Logger logger;

    @Inject
    public EstudianteRepositorio(AgroalDataSource agroalDataSource) {
        this.agroalDataSource = agroalDataSource;
    }

    @Override
    public List<Estudiante> listar() {
        List<Estudiante> estudiantes = new ArrayList<>();

        try (Connection connection = this.agroalDataSource.getConnection();
             PreparedStatement preparedStatement = connection.prepareStatement(
                     "SELECT IdEstudiante, Carnet, Nombre, Apellido, IdCarrera, Telefono, Correo FROM Estudiante"
             );
             ResultSet resultSet = preparedStatement.executeQuery()) {
            while (resultSet.next()) {
                Estudiante estudiante = new Estudiante();
                estudiante.setIdEstudiante(resultSet.getInt("IdEstudiante"));
                estudiante.setCarnet(resultSet.getString("Carnet"));
                estudiante.setNombre(resultSet.getString("Nombre"));
                estudiante.setApellido(resultSet.getString("Apellido"));
                estudiante.setCarrearId(resultSet.getInt("IdCarrera"));
                estudiante.setTelefono(resultSet.getString("Telefono"));
                estudiante.setCorreo(resultSet.getString("Correo"));
                estudiantes.add(estudiante);
            }
        } catch (SQLException e) {
            logger.error(e);
        }

        return estudiantes;
    }

    @Override
    public Optional<Estudiante> obtener(int id) {
        Optional<Estudiante> optionalEstudiante = Optional.empty();

        try (Connection connection = this.agroalDataSource.getConnection();
             PreparedStatement preparedStatement = connection.prepareStatement(
                     "SELECT IdEstudiante, Carnet, Nombre, Apellido, IdCarrera, Telefono, Correo FROM Estudiante WHERE idEstudiante = ?"
             )) {
             preparedStatement.setInt(1, id);
             try (ResultSet resultSet = preparedStatement.executeQuery()) {
                if (resultSet.next()) {
                    Estudiante estudiante = new Estudiante();
                    estudiante.setIdEstudiante(resultSet.getInt("IdEstudiante"));
                    estudiante.setCarnet(resultSet.getString("Carnet"));
                    estudiante.setNombre(resultSet.getString("Nombre"));
                    estudiante.setApellido(resultSet.getString("Apellido"));
                    estudiante.setCarrearId(resultSet.getInt("IdCarrera"));
                    estudiante.setTelefono(resultSet.getString("Telefono"));
                    estudiante.setCorreo(resultSet.getString("Correo"));
                    optionalEstudiante = Optional.of(estudiante);
                }
            }
        } catch (SQLException e) {
            logger.error(e);
        }

        return optionalEstudiante;
    }

    @Override
    public Estudiante crear(Estudiante tipo) {
        try (Connection connection = this.agroalDataSource.getConnection();
            PreparedStatement preparedStatement = connection.prepareStatement(
                    "INSERT INTO Estudiante(Carnet, Nombre, Apellido, IdCarrera, Telefono, Correo) VALUES (?,?,?,?,?,?)",
                    Statement.RETURN_GENERATED_KEYS
            )) {
            preparedStatement.setString(1, tipo.getCarnet());
            preparedStatement.setString(2, tipo.getNombre());
            preparedStatement.setString(3, tipo.getApellido());
            preparedStatement.setInt(4, tipo.getCarrera().getIdCarrera());
            preparedStatement.setString(5, tipo.getTelefono());
            preparedStatement.setString(6, tipo.getCorreo());
            int rows = preparedStatement.executeUpdate();
            if (rows > 0) {
                int idNuevoEstudiante = Utils.getInstance().getLatestId(preparedStatement);
                tipo.setIdEstudiante(idNuevoEstudiante);
                return tipo;
            }
        } catch (SQLException e) {
            logger.error(e);
        }
        return null;
    }

    @Override
    public Estudiante actualizar(Estudiante tipo) {
        try (Connection connection = this.agroalDataSource.getConnection();
            PreparedStatement preparedStatement = connection.prepareStatement(
                    "UPDATE Estudiante SET Nombre = ?, Apellido = ?, IdCarrera = ?, Telefono = ?, Correo = ? WHERE idEstudiante = ?"
            )) {
            preparedStatement.setString(1, tipo.getNombre());
            preparedStatement.setString(2, tipo.getApellido());
            preparedStatement.setInt(3, tipo.getCarrera().getIdCarrera());
            preparedStatement.setString(4, tipo.getTelefono());
            preparedStatement.setString(5, tipo.getCorreo());
            preparedStatement.setInt(6, tipo.getIdEstudiante());
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
                     "DELETE FROM Estudiante WHERE idEstudiante = ?"
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
                     "SELECT idEstudiante FROM Estudiante WHERE idEstudiante=?"
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
