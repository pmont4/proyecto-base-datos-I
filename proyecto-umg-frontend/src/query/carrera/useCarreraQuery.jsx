import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { CarreraKey } from "./CarreraKey";
import { APIBackend } from "../../api/APIClient";

export const useCarreraQuery = () => {

    return useQuery({
        queryKey: CarreraKey.carreraList(),
        placeholderData: keepPreviousData,
        queryFn: async () => {
            const res = await APIBackend.get('/carrera/');
            if (res.status !== 200) throw new Error("Error al obtener carreras");
            const data = res.data;
            const arrayData = Array.isArray(data) ? data : [data];
            return arrayData;
        },
        staleTime: 30_000,
        refetchOnWindowFocus: true,
    });

}
