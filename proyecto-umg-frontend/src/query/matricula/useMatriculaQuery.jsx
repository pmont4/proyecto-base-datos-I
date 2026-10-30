import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { MatriculaKeys } from "./MatriculaKeys";
import { APIBackend } from "../../api/APIClient";

export const useMatriculaQuery = () => {

    return useQuery({
        queryKey: MatriculaKeys.matriculaList(),
        placeholderData: keepPreviousData,
        queryFn: async () => {
            const res = await APIBackend.get('/matricula/');
            if (res.status !== 200) throw new Error("Error al obtener matricula");
            const data = res.data;
            const arrayData = Array.isArray(data) ? data : [data];
            return arrayData;
        },
        staleTime: 30_000,
        refetchOnWindowFocus: true,
    });

};
