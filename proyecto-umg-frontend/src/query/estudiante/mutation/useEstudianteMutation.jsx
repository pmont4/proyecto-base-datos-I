import { useMutation, useQueryClient } from "@tanstack/react-query";
import { APIBackend } from "../../../api/APIClient";
import { EstudianteKey } from "../EstudianteKey";

export const useEstudianteMutation = () => {

    const qc = useQueryClient();

    const baseKey = EstudianteKey.estudianteList();

    const patchAllLists = (updater) => {
        const matches = qc.getQueriesData({ queryKey: baseKey });
        matches.forEach(([key, _data]) => {
            qc.setQueryData(key, (curr = []) => updater(curr));
        });
    }

    const createMutation = useMutation({
        mutationKey: ['estudiante', 'crear'],
        mutationFn: async (estudiante) => {
            const res = await APIBackend.post('/estudiante/', estudiante);
            return res.data;
        },

        onSuccess(data) {
            patchAllLists((curr) => [data, ...(curr || [])]);
        },

        async onSettled() {
            await qc.invalidateQueries({ queryKey: baseKey, refetchType: 'active' });
        },
    });

    const updateMutation = useMutation({
        mutationKey: ['estudiante', 'actualizar'],
        mutationFn: async (estudiante) => {
            const res = await APIBackend.put('/estudiante/', estudiante);
            return res.data;
        },

        onSuccess(data) {
            patchAllLists((curr) =>
                (curr || []).map((estudiante) =>
                    estudiante.idEstudiante === data.idEstudiante ? { ...estudiante, ...data } : estudiante
                )
            );
        },

        async onSettled() {
            await qc.invalidateQueries({ queryKey: baseKey, refetchType: 'active' });
        },
    });

    const create = (payload, opts) => createMutation.mutate(payload, opts);
    const update = (payload, opts) => updateMutation.mutate(payload, opts);

    return {
        create,
        update,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending
    };

}
