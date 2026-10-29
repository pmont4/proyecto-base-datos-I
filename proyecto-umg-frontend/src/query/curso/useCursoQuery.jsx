import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { CursoKey } from "./CursoKey";
import { APIBackend } from "../../api/APIClient";

export const useCursoQuery = () => {

    return useQuery({
        queryKey: CursoKey.cursoLista(),
        placeholderData: keepPreviousData,
        queryFn: async () => {
            const res = await APIBackend.get('/curso/');
            if (res.status !== 200) throw new Error("Error al obtener cursos");
            const data = res.data;
            const arrayData = Array.isArray(data) ? data : [data];
            return arrayData;
        },
        staleTime: 30_000,
        refetchOnWindowFocus: true,
    });

}
