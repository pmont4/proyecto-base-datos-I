package com.umg.proyecto_base_datos.repositorio;

import com.umg.proyecto_base_datos.entidad.Docente;
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
public class DocenteRepositorio implements Repositorio<Docente> {

    private final AgroalDataSource agroalDataSource;

    @Inject
    Logger logger;

    @Inject
    public DocenteRepositorio(AgroalDataSource agroalDataSource) {
        this.agroalDataSource = agroalDataSource;
    }

    @Override
    public List<Docente> listar() {
        List<Docente> docentes = new ArrayList<>();

        try (Connection connection = this.agroalDataSource.getConnection();
             PreparedStatement preparedStatement = connection.prepareStatement(
                     "SELECT idDocente, Nombre, Apellido, Especialidad, Telefono, Correo FROM Docente"
             );
             ResultSet resultSet = preparedStatement.executeQuery()) {
            while (resultSet.next()) {
                Docente docente = new Docente();
                docente.setIdDocente(resultSet.getInt("idDocente"));
                docente.setNombreDocente(resultSet.getString("Nombre"));
                docente.setApellidoDocente(resultSet.getString("Apellido"));
                docente.setEspecialidadDocente(resultSet.getString("Especialidad"));
                docente.setTelefonoDocente(resultSet.getString("Telefono"));
                docente.setCorreoDocente(resultSet.getString("Correo"));
                docentes.add(docente);
            }
        } catch (SQLException e) {
            logger.error(e);
        }

        return docentes;
    }

    @Override
    public Optional<Docente> obtener(int id) {
        Optional<Docente> optionalDocente = Optional.empty();

        try (Connection connection = this.agroalDataSource.getConnection();
             PreparedStatement preparedStatement = connection.prepareStatement(
                     "SELECT idDocente, Nombre, Apellido, Especialidad, Telefono, Correo FROM Docente WHERE idDocente = ?"
             )) {
            preparedStatement.setInt(1, id);
             try (ResultSet resultSet = preparedStatement.executeQuery()){
                if (resultSet.next()) {
                    Docente docente = new Docente();
                    docente.setIdDocente(resultSet.getInt("idDocente"));
                    docente.setNombreDocente(resultSet.getString("Nombre"));
                    docente.setApellidoDocente(resultSet.getString("Apellido"));
                    docente.setEspecialidadDocente(resultSet.getString("Especialidad"));
                    docente.setTelefonoDocente(resultSet.getString("Telefono"));
                    docente.setCorreoDocente(resultSet.getString("Correo"));
                    optionalDocente = Optional.of(docente);
                }
            }
        } catch (SQLException e) {
            logger.error(e);
        }

        return optionalDocente;
    }

    @Override
    public Docente crear(Docente tipo) {
        try (Connection connection = this.agroalDataSource.getConnection();
            PreparedStatement preparedStatement = connection.prepareStatement(
                    "INSERT INTO Docente (Nombre, Apellido, Especialidad, Telefono, Correo) VALUES (?,?,?,?,?)",
                    Statement.RETURN_GENERATED_KEYS
            )) {
            preparedStatement.setString(1, tipo.getNombreDocente());
            preparedStatement.setString(2, tipo.getApellidoDocente());
            preparedStatement.setString(3, tipo.getEspecialidadDocente());
            preparedStatement.setString(4, tipo.getTelefonoDocente());
            preparedStatement.setString(5, tipo.getCorreoDocente());
            int rows = preparedStatement.executeUpdate();
            if (rows > 0) {
                int idNuevoDocente = Utils.getInstance().getLatestId(preparedStatement);
                tipo.setIdDocente(idNuevoDocente);
                return tipo;
            }
        } catch (SQLException e) {
            logger.error(e);
        }
        return null;
    }

    @Override
    public Docente actualizar(Docente tipo) {
        try (Connection connection = this.agroalDataSource.getConnection();
            PreparedStatement preparedStatement = connection.prepareStatement(
                    "UPDATE Docente SET Nombre = ?, Apellido = ?, Especialidad = ?, Telefono = ?, Correo = ? WHERE idDocente = ?"
            )) {
            preparedStatement.setString(1, tipo.getNombreDocente());
            preparedStatement.setString(2, tipo.getApellidoDocente());
            preparedStatement.setString(3, tipo.getEspecialidadDocente());
            preparedStatement.setString(4, tipo.getTelefonoDocente());
            preparedStatement.setString(5, tipo.getCorreoDocente());
            preparedStatement.setInt(6, tipo.getIdDocente());
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
                     "DELETE FROM Docente WHERE idDocente = ?"
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
                     "SELECT idDocente FROM Docente WHERE idDocente=?"
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
