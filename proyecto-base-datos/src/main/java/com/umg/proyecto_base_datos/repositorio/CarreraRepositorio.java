package com.umg.proyecto_base_datos.repositorio;

import com.umg.proyecto_base_datos.entidad.Carrera;
import com.umg.proyecto_base_datos.entidad.Facultad;
import com.umg.proyecto_base_datos.util.Utils;
import io.agroal.api.AgroalDataSource;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class CarreraRepositorio implements Repositorio<Carrera> {

    private final AgroalDataSource agroalDataSource;

    @Inject
    Logger logger;

    @Inject
    public CarreraRepositorio(AgroalDataSource agroalDataSource) {
        this.agroalDataSource = agroalDataSource;
    }

    @Override
    public List<Carrera> listar() {
        List<Carrera> carreras = new ArrayList<>();

        try (Connection connection = this.agroalDataSource.getConnection();
             PreparedStatement preparedStatement = connection.prepareStatement(
                     "SELECT IdCarrera, Codigo, Nombre, Facultad FROM Carrera"
             );
             ResultSet resultSet = preparedStatement.executeQuery()) {
                while (resultSet.next()) {
                    Carrera carrera = new Carrera();
                    carrera.setIdCarrera(resultSet.getInt("IdCarrera"));
                    carrera.setCodigoCarrera(resultSet.getString("Codigo"));
                    carrera.setNombreCarrera(resultSet.getString("Nombre"));
                    carrera.setFacultad(Facultad.valueOf(resultSet.getString("Facultad").toUpperCase()));
                    carreras.add(carrera);
                }
        } catch (SQLException e) {
            logger.error(e);
        }

        return carreras;
    }

    @Override
    public Optional<Carrera> obtener(int id) {
        Optional<Carrera> optionalCarrera = Optional.empty();

        try (Connection connection = this.agroalDataSource.getConnection();
             PreparedStatement preparedStatement = connection.prepareStatement(
                     "SELECT IdCarrera, Codigo, Nombre, Facultad FROM Carrera WHERE IdCarrera=?"
             )) {
            preparedStatement.setInt(1, id);
             try (ResultSet resultSet = preparedStatement.executeQuery()) {
                if (resultSet.next()) {
                    Carrera carrera = new Carrera();
                    carrera.setIdCarrera(resultSet.getInt("IdCarrera"));
                    carrera.setCodigoCarrera(resultSet.getString("Codigo"));
                    carrera.setNombreCarrera(resultSet.getString("Nombre"));
                    carrera.setFacultad(Facultad.valueOf(resultSet.getString("Facultad").toUpperCase()));
                    optionalCarrera = Optional.of(carrera);
                }
            }
        } catch (SQLException e) {
            logger.error(e);
        }

        return optionalCarrera;
    }

    @Override
    public Carrera crear(Carrera tipo) {
        try (Connection connection = this.agroalDataSource.getConnection();
            PreparedStatement preparedStatement = connection.prepareStatement(
                    "INSERT INTO Carrera (Codigo, Nombre, Facultad) VALUES (?,?,?)"
            )) {
                preparedStatement.setString(1, tipo.getCodigoCarrera());
                preparedStatement.setString(2, tipo.getNombreCarrera());
                preparedStatement.setString(3, tipo.getFacultad().name());
                int rows = preparedStatement.executeUpdate();
                if (rows > 0) {
                    int idNuevaCarrera = Utils.getInstance().getLatestId(preparedStatement);
                    tipo.setIdCarrera(idNuevaCarrera);
                    return tipo;
                }
        } catch (SQLException e) {
            logger.error(e);
        }
        return null;
    }

    @Override
    public Carrera actualizar(Carrera tipo) {
        try (Connection connection = this.agroalDataSource.getConnection();
            PreparedStatement preparedStatement = connection.prepareStatement(
                    "UPDATE Carrera SET Nombre = ?, Facultad = ? WHERE IdCarrera = ?"
            )) {
                preparedStatement.setString(1, tipo.getNombreCarrera());
                preparedStatement.setString(2, tipo.getFacultad().name());
                preparedStatement.setInt(3, tipo.getIdCarrera());
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
                    "DELETE FROM Carrera WHERE idCarrera = ?"
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
                    "SELECT idCarrera FROM Carrera WHERE idCarrera=?"
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
