package com.umg.proyecto_base_datos.repositorio;

import com.umg.proyecto_base_datos.entidad.seccion.SeccionHorario;
import com.umg.proyecto_base_datos.util.Utils;
import io.agroal.api.AgroalDataSource;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

import java.sql.*;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class SeccionHorarioRepositorio implements Repositorio<SeccionHorario> {

    private final AgroalDataSource agroalDataSource;

    @Inject
    Logger logger;

    @Inject
    public SeccionHorarioRepositorio(AgroalDataSource agroalDataSource) {
        this.agroalDataSource = agroalDataSource;
    }

    @Override
    public List<SeccionHorario> listar() {
        return new ArrayList<>();
    }

    @Override
    public Optional<SeccionHorario> obtener(int id) {
        Optional<SeccionHorario> optionalSeccionHorario = Optional.empty();

        try (Connection connection = this.agroalDataSource.getConnection();
             PreparedStatement preparedStatement = connection.prepareStatement(
                     "SELECT IdSeccionHorario, IdSeccion, DiaSemana, HoraInicio, HoraFin, Aula FROM SeccionHorario WHERE IdSeccion = ?"
             )) {
            preparedStatement.setInt(1, id);
            try (ResultSet resultSet = preparedStatement.executeQuery()) {
                if (resultSet.next()) {
                    SeccionHorario seccionHorario = new SeccionHorario();
                    seccionHorario.setIdSeccionHorario(resultSet.getInt("IdSeccionHorario"));
                    seccionHorario.setIdSeccion(resultSet.getInt("IdSeccion"));
                    seccionHorario.setDiaSemana(resultSet.getInt("DiaSemana"));

                    LocalTime horaInico = resultSet.getObject("HoraInicio", LocalTime.class);
                    seccionHorario.setHoraInicio(horaInico);

                    LocalTime horaFin = resultSet.getObject("HoraFin", LocalTime.class);
                    seccionHorario.setHoraFin(horaFin);

                    seccionHorario.setAula(resultSet.getString("Aula"));
                    optionalSeccionHorario = Optional.of(seccionHorario);
                }
            }
        } catch (SQLException e) {
            logger.error(e);
        }

        return optionalSeccionHorario;
    }

    @Override
    public SeccionHorario crear(SeccionHorario tipo) {
        try (Connection connection = this.agroalDataSource.getConnection();
            PreparedStatement preparedStatement = connection.prepareStatement(
                    "INSERT INTO SeccionHorario (IdSeccion, DiaSemana, HoraInicio, HoraFin, Aula) VALUES (?,?,?,?,?)",
                    Statement.RETURN_GENERATED_KEYS
            )) {
            preparedStatement.setInt(1, tipo.getIdSeccion());
            preparedStatement.setInt(2, tipo.getDiaSemana());
            preparedStatement.setObject(3, tipo.getHoraInicio());
            preparedStatement.setObject(4, tipo.getHoraFin());
            preparedStatement.setString(5, tipo.getAula());
            int rows = preparedStatement.executeUpdate();
            if (rows > 0) {
                int idNuevaSeccionHorario = Utils.getInstance().getLatestId(preparedStatement);
                tipo.setIdSeccionHorario(idNuevaSeccionHorario);
                return tipo;
            }
        } catch (SQLException e) {
            logger.error(e);
        }
        return null;
    }

    @Override
    public SeccionHorario actualizar(SeccionHorario tipo) {
        try (Connection connection = this.agroalDataSource.getConnection();
            PreparedStatement preparedStatement = connection.prepareStatement(
                    "UPDATE SeccionHorario SET DiaSemana = ?, HoraInicio = ?, HoraFin = ?, Aula = ? WHERE IdSeccion = ?"
            )) {
            preparedStatement.setInt(1, tipo.getDiaSemana());
            preparedStatement.setObject(2, tipo.getHoraInicio());
            preparedStatement.setObject(3, tipo.getHoraFin());
            preparedStatement.setString(4, tipo.getAula());
            preparedStatement.setInt(5, tipo.getIdSeccion());
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
                     "DELETE FROM SeccionHorario WHERE IdSeccion = ?"
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
                     "SELECT IdSeccion FROM SeccionHorario WHERE IdSeccion=?"
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
