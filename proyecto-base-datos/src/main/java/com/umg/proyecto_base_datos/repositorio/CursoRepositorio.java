package com.umg.proyecto_base_datos.repositorio;

import com.umg.proyecto_base_datos.entidad.Curso;
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
public class CursoRepositorio implements Repositorio<Curso> {

    private final AgroalDataSource agroalDataSource;

    @Inject
    Logger logger;

    @Inject
    public CursoRepositorio(AgroalDataSource agroalDataSource) {
        this.agroalDataSource = agroalDataSource;
    }

    @Override
    public List<Curso> listar() {
        List<Curso> cursos = new ArrayList<>();

        try (Connection connection = this.agroalDataSource.getConnection();
             PreparedStatement preparedStatement = connection.prepareStatement(
                     "SELECT IdCurso, CodigoCurso, NombreCurso, Creditos FROM Curso"
             );
             ResultSet resultSet = preparedStatement.executeQuery()) {
            while (resultSet.next()) {
                Curso curso = new Curso();
                curso.setIdCurso(resultSet.getInt("IdCurso"));
                curso.setCodigoCurso(resultSet.getString("CodigoCurso"));
                curso.setNombreCurso(resultSet.getString("NombreCurso"));
                curso.setCreditos(resultSet.getInt("Creditos"));
                cursos.add(curso);
            }
        } catch (SQLException e) {
            logger.error(e);
        }

        return cursos;
    }

    @Override
    public Optional<Curso> obtener(int id) {
        Optional<Curso> optionalCurso = Optional.empty();

        try (Connection connection = this.agroalDataSource.getConnection();
             PreparedStatement preparedStatement = connection.prepareStatement(
                     "SELECT IdCurso, CodigoCurso, NombreCurso, Creditos FROM Curso WHERE IdCurso=?"
             )) {
            preparedStatement.setInt(1, id);
             try (ResultSet resultSet = preparedStatement.executeQuery()) {
                if (resultSet.next()) {
                    Curso curso = new Curso();
                    curso.setIdCurso(resultSet.getInt("IdCurso"));
                    curso.setCodigoCurso(resultSet.getString("CodigoCurso"));
                    curso.setNombreCurso(resultSet.getString("NombreCurso"));
                    curso.setCreditos(resultSet.getInt("Creditos"));
                    optionalCurso = Optional.of(curso);
                }
            }
        } catch (SQLException e) {
            logger.error(e);
        }

        return optionalCurso;
    }

    @Override
    public Curso crear(Curso tipo) {
        try (Connection connection = this.agroalDataSource.getConnection();
            PreparedStatement preparedStatement = connection.prepareStatement(
                    "INSERT INTO Curso (CodigoCurso, NombreCurso, Creditos) VALUES (?,?,?)",
                    Statement.RETURN_GENERATED_KEYS
            )) {
            preparedStatement.setString(1, tipo.getCodigoCurso());
            preparedStatement.setString(2, tipo.getNombreCurso());
            preparedStatement.setInt(3, tipo.getCreditos());
            int rows = preparedStatement.executeUpdate();
            if (rows > 0) {
                int idNuevoCurso = Utils.getInstance().getLatestId(preparedStatement);
                tipo.setIdCurso(idNuevoCurso);
                return tipo;
            }
        } catch (SQLException e) {
            logger.error(e);
        }
        return null;
    }

    @Override
    public Curso actualizar(Curso tipo) {
        try (Connection connection = this.agroalDataSource.getConnection();
            PreparedStatement preparedStatement = connection.prepareStatement(
                    "UPDATE Curso SET NombreCurso = ?, Creditos = ? WHERE idCurso = ?"
            )) {
            preparedStatement.setString(1, tipo.getNombreCurso());
            preparedStatement.setInt(2, tipo.getCreditos());
            preparedStatement.setInt(3, tipo.getIdCurso());
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
                     "DELETE FROM Curso WHERE idCurso = ?"
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
                     "SELECT idCurso FROM Curso WHERE idCurso=?"
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
