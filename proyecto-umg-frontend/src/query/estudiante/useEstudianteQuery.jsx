import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { EstudianteKey } from './EstudianteKey';
import { APIBackend } from '../../api/APIClient';

export const useEstudianteQuery = () => {

    return useQuery({
        queryKey: EstudianteKey.estudianteList(),
        placeholderData: keepPreviousData,
        queryFn: async () => {
            const res = await APIBackend.get('/estudiante/');
            if (res.status !== 200) throw new Error("Error al obtener estudiantes");
            const data = res.data;
            const arrayData = Array.isArray(data) ? data : [data];
            return arrayData;
        },
        staleTime: 30_000,
        refetchOnWindowFocus: true,
    });

}
