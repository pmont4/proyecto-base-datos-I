import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { APIBackend } from "../../api/APIClient";
import { DocenteKey } from "./DocenteKey";

export const useDocenteQuery = () => {

    return useQuery({
        queryKey: DocenteKey.docenteLista(),
        placeholderData: keepPreviousData,
        queryFn: async () => {
            const res = await APIBackend.get('/docente/');
            if (res.status !== 200) throw new Error("Error al obtener docentes");
            const data = res.data;
            const arrayData = Array.isArray(data) ? data : [data];
            return arrayData;
        },
        staleTime: 30_000,
        refetchOnWindowFocus: true,
    });

}
