package com.umg.proyecto_base_datos.entidad;

import java.time.LocalDateTime;

public class Pago {

    private int idPago;
    private int idMatricula;
    private String monto;
    private MetodoPago metodoPago;
    private LocalDateTime fechaPago;
    private String referenciaTransaccion;

    public int getIdPago() {
        return idPago;
    }

    public void setIdPago(int idPago) {
        this.idPago = idPago;
    }

    public int getIdMatricula() {
        return idMatricula;
    }

    public void setIdMatricula(int idMatricula) {
        this.idMatricula = idMatricula;
    }

    public String getMonto() {
        return monto;
    }

    public void setMonto(String monto) {
        this.monto = monto;
    }

    public MetodoPago getMetodoPago() {
        return metodoPago;
    }

    public void setMetodoPago(MetodoPago metodoPago) {
        this.metodoPago = metodoPago;
    }

    public LocalDateTime getFechaPago() {
        return fechaPago;
    }

    public void setFechaPago(LocalDateTime fechaPago) {
        this.fechaPago = fechaPago;
    }

    public String getReferenciaTransaccion() {
        return referenciaTransaccion;
    }

    public void setReferenciaTransaccion(String referenciaTransaccion) {
        this.referenciaTransaccion = referenciaTransaccion;
    }

    @Override
    public String toString() {
        return "Pago{" +
                "idPago=" + idPago +
                ", idMatricula=" + idMatricula +
                ", monto='" + monto + '\'' +
                ", metodoPago=" + metodoPago +
                ", fechaPago=" + fechaPago +
                ", referenciaTransaccion='" + referenciaTransaccion + '\'' +
                '}';
    }

}
