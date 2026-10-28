package com.umg.proyecto_base_datos.util;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class Utils {

    private static Utils instance;

    private Utils() {}

    public int getLatestId(PreparedStatement statement) throws SQLException {
        try (ResultSet resultSet = statement.getGeneratedKeys()) {
            if (resultSet.next()) {
                return resultSet.getInt(1);
            }
        }
        return 0;
    }

    public static Utils getInstance(){
        if(instance == null){
            instance = new Utils();
        }
        return instance;
    }

}
