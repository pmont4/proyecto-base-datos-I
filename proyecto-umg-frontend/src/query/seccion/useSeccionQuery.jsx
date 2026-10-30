import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { SeccionKey } from "./SeccionKey";
import { APIBackend } from "../../api/APIClient";

export const useSeccionQuery = () => {

    return useQuery({
        queryKey: SeccionKey.seccionList(),
        placeholderData: keepPreviousData,
        queryFn: async () => {
            const res = await APIBackend.get('/seccion/');
            if (res.status !== 200) throw new Error("Error al obtener secciones");
            const data = res.data;
            const arrayData = Array.isArray(data) ? data : [data];
            return arrayData;
        },
        staleTime: 30_000,
        refetchOnWindowFocus: true,
    });

}
