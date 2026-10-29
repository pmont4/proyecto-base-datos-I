package com.umg.proyecto_base_datos.repositorio;

import com.umg.proyecto_base_datos.entidad.MetodoPago;
import com.umg.proyecto_base_datos.entidad.Pago;
import com.umg.proyecto_base_datos.util.Utils;
import io.agroal.api.AgroalDataSource;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class PagoRepositorio implements Repositorio<Pago> {

    private final AgroalDataSource agroalDataSource;

    @Inject
    Logger logger;

    @Inject
    public PagoRepositorio(AgroalDataSource agroalDataSource) {
        this.agroalDataSource = agroalDataSource;
    }

    @Override
    public List<Pago> listar() {
        List<Pago> pagos = new ArrayList<>();

        try (Connection connection = this.agroalDataSource.getConnection();
             PreparedStatement preparedStatement = connection.prepareStatement(
                     "SELECT IdPago, IdMatricula, Monto, MetodoPago, FechaPago, ReferenciaTransaccion FROM Pago"
             );
             ResultSet resultSet = preparedStatement.executeQuery()) {
            while (resultSet.next()) {
                Pago pago = new Pago();
                pago.setIdMatricula(resultSet.getInt("IdMatricula"));
                pago.setIdPago(resultSet.getInt("IdPago"));
                BigDecimal monto = resultSet.getBigDecimal("Monto");

                pago.setMonto(monto.toString());
                pago.setMetodoPago(MetodoPago.valueOf(resultSet.getString("MetodoPago")));

                LocalDateTime fechaPago = resultSet.getObject("FechaPago", LocalDateTime.class);
                pago.setFechaPago(fechaPago);
                pago.setReferenciaTransaccion(resultSet.getString("ReferenciaTransaccion"));
                pagos.add(pago);
            }
        } catch (SQLException e) {
            logger.error(e);
        }

        return pagos;
    }

    @Override
    public Optional<Pago> obtener(int id) {
        Optional<Pago> optionalPago = Optional.empty();

        try (Connection connection = this.agroalDataSource.getConnection();
             PreparedStatement preparedStatement = connection.prepareStatement(
                     "SELECT IdPago, IdMatricula, Monto, MetodoPago, FechaPago, ReferenciaTransaccion FROM Pago WHERE IdMatricula = ?"
             )) {
            preparedStatement.setInt(1, id);
             try (ResultSet resultSet = preparedStatement.executeQuery()) {
                if (resultSet.next()) {
                    Pago pago = new Pago();
                    pago.setIdMatricula(resultSet.getInt("IdMatricula"));
                    pago.setIdPago(resultSet.getInt("IdPago"));

                    BigDecimal monto = resultSet.getBigDecimal("Monto");

                    pago.setMonto(monto.toString());
                    pago.setMetodoPago(MetodoPago.valueOf(resultSet.getString("MetodoPago")));

                    LocalDateTime fechaPago = resultSet.getObject("FechaPago", LocalDateTime.class);
                    pago.setFechaPago(fechaPago);
                    pago.setReferenciaTransaccion(resultSet.getString("ReferenciaTransaccion"));
                    optionalPago = Optional.of(pago);
                }
            }
        } catch (SQLException e) {
            logger.error(e);
        }

        return optionalPago;
    }

    @Override
    public Pago crear(Pago tipo) {
        try (Connection connection = this.agroalDataSource.getConnection();
            PreparedStatement preparedStatement = connection.prepareStatement(
                    "INSERT INTO Pago (IdMatricula, Monto, MetodoPago, FechaPago, ReferenciaTransaccion) VALUES (?,?,?,?,?)",
                    Statement.RETURN_GENERATED_KEYS
            )) {
            preparedStatement.setInt(1, tipo.getIdMatricula());

            BigDecimal monto = new BigDecimal(tipo.getMonto());
            monto = monto.setScale(2, RoundingMode.HALF_UP);
            preparedStatement.setDouble(2, monto.doubleValue());
            preparedStatement.setString(3, tipo.getMetodoPago().name());
            preparedStatement.setObject(4, tipo.getFechaPago());
            preparedStatement.setString(5, tipo.getReferenciaTransaccion());
            int rows = preparedStatement.executeUpdate();
            if (rows > 0) {
                int idNuevoPago = Utils.getInstance().getLatestId(preparedStatement);
                tipo.setIdPago(idNuevoPago);
                return tipo;
            }
        } catch (SQLException e) {
            logger.error(e);
        }
        return null;
    }

    @Override
    public Pago actualizar(Pago tipo) {
        return tipo;
    }

    @Override
    public boolean eliminar(int id) {
        try (Connection connection = this.agroalDataSource.getConnection();
             PreparedStatement preparedStatement = connection.prepareStatement(
                     "DELETE FROM Pago WHERE IdMatricula = ?"
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
                     "SELECT IdMatricula FROM Pago WHERE IdMatricula=?"
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
