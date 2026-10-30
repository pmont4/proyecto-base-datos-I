import { useMutation, useQueryClient } from "@tanstack/react-query";
import { APIBackend } from "../../../api/APIClient";
import { CarreraKey } from "../CarreraKey";

export const useCarreraMutation = () => {

    const qc = useQueryClient();

    const baseKey = CarreraKey.carreraList();

    const patchAllLists = (updater) => {
        const matches = qc.getQueriesData({ queryKey: baseKey });
        matches.forEach(([key, _data]) => {
            qc.setQueryData(key, (curr = []) => updater(curr));
        });
    }

    const createMutation = useMutation({
        mutationKey: ['carrera', 'crear'],
        mutationFn: async (carrera) => {
            const res = await APIBackend.post('/carrera/', carrera);
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
        mutationKey: ['carrera', 'actualizar'],
        mutationFn: async (carrera) => {
            const res = await APIBackend.put('/carrera/', carrera);
            return res.data;
        },

        onSuccess(data) {
            patchAllLists((curr) =>
                (curr || []).map((carrera) =>
                    carrera.idCarrera === data.idCarrera ? { ...carrera, ...data } : carrera
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
