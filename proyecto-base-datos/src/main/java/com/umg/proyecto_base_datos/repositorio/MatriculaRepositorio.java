package com.umg.proyecto_base_datos.repositorio;

import com.umg.proyecto_base_datos.entidad.Estado;
import com.umg.proyecto_base_datos.entidad.Matricula;
import com.umg.proyecto_base_datos.util.Utils;
import io.agroal.api.AgroalDataSource;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

import java.sql.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class MatriculaRepositorio implements Repositorio<Matricula> {

    private final AgroalDataSource agroalDataSource;

    @Inject
    Logger logger;

    public MatriculaRepositorio(AgroalDataSource agroalDataSource) {
        this.agroalDataSource = agroalDataSource;
    }

    @Override
    public List<Matricula> listar() {
        List<Matricula> matriculas = new ArrayList<>();

        try (Connection connection = this.agroalDataSource.getConnection();
             PreparedStatement preparedStatement = connection.prepareStatement(
                     "SELECT IdMatricula, IdEstudiante, IdSeccion, FechaInscripcion, Estado FROM Matricula"
             );
             ResultSet resultSet = preparedStatement.executeQuery()) {
            while (resultSet.next()) {
                Matricula matricula = new Matricula();
                matricula.setIdMatricula(resultSet.getInt("IdMatricula"));
                matricula.setEstudianteId(resultSet.getInt("IdEstudiante"));
                matricula.setSeccionId(resultSet.getInt("IdSeccion"));

                LocalDateTime fechaInscripcion = resultSet.getObject("FechaInscripcion", LocalDateTime.class);
                matricula.setFechaInscripcion(fechaInscripcion);
                matricula.setEstado(Estado.valueOf(resultSet.getString("Estado")));
                matriculas.add(matricula);
            }
        } catch (SQLException e) {
            logger.error(e);
        }

        return matriculas;
    }

    @Override
    public Optional<Matricula> obtener(int id) {
        Optional<Matricula> optMatricula = Optional.empty();

        try (Connection connection = this.agroalDataSource.getConnection();
             PreparedStatement preparedStatement = connection.prepareStatement(
                     "SELECT IdMatricula, IdEstudiante, IdSeccion, FechaInscripcion, Estado FROM Matricula WHERE IdMatricula = ?"
             )) {
            preparedStatement.setInt(1, id);
            try (ResultSet resultSet = preparedStatement.executeQuery()) {
                if (resultSet.next()) {
                    Matricula matricula = new Matricula();
                    matricula.setIdMatricula(resultSet.getInt("IdMatricula"));
                    matricula.setEstudianteId(resultSet.getInt("IdEstudiante"));
                    matricula.setSeccionId(resultSet.getInt("IdSeccion"));

                    LocalDateTime fechaInscripcion = resultSet.getObject("FechaInscripcion", LocalDateTime.class);
                    matricula.setFechaInscripcion(fechaInscripcion);
                    matricula.setEstado(Estado.valueOf(resultSet.getString("Estado")));

                    optMatricula = Optional.of(matricula);
                }
            }
        } catch (SQLException e) {
            logger.error(e);
        }

        return optMatricula;
    }

    @Override
    public Matricula crear(Matricula tipo) {
        try (Connection connection = this.agroalDataSource.getConnection();
            PreparedStatement preparedStatement = connection.prepareStatement(
                    "INSERT INTO Matricula (IdEstudiante, IdSeccion, FechaInscripcion, Estado) VALUES (?, ?, ?, ?)",
                    Statement.RETURN_GENERATED_KEYS
            )) {
            preparedStatement.setInt(1, tipo.getEstudiante().getIdEstudiante());
            preparedStatement.setInt(2, tipo.getSeccion().getIdSeccion());
            preparedStatement.setObject(3, tipo.getFechaInscripcion());
            preparedStatement.setString(4, Estado.CONGELADA.toString());
            int rows = preparedStatement.executeUpdate();
            if (rows > 0) {
                int idNuevoMatricula = Utils.getInstance().getLatestId(preparedStatement);
                tipo.setIdMatricula(idNuevoMatricula);
                return tipo;
            }
        } catch (SQLException e) {
            logger.error(e);
        }
        return null;
    }

    @Override
    public Matricula actualizar(Matricula tipo) {
        try (Connection connection = this.agroalDataSource.getConnection();
            PreparedStatement preparedStatement = connection.prepareStatement(
                    "UPDATE Matricula SET IdSeccion = ? WHERE IdMatricula = ?"
            )) {
            preparedStatement.setInt(1, tipo.getSeccion().getIdSeccion());
            preparedStatement.setInt(2, tipo.getIdMatricula());
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
                     "DELETE FROM Matricula WHERE IdMatricula = ?"
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
                     "SELECT IdMatricula FROM Matricula WHERE IdMatricula=?"
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

    public boolean actualizarEstadoMatricula(int id, Estado estado) {
        try (Connection connection = this.agroalDataSource.getConnection();
            PreparedStatement preparedStatement = connection.prepareStatement(
                    "UPDATE Matricula SET Estado = ? WHERE IdMatricula = ?"
            )) {
            preparedStatement.setString(1, estado.toString());
            preparedStatement.setInt(2, id);
            int rows = preparedStatement.executeUpdate();
            return rows > 0;
        } catch (Exception e) {
            logger.error(e);
        }
        return false;
    }

}
