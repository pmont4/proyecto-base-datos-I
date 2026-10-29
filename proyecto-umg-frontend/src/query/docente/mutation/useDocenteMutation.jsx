import { useMutation, useQueryClient } from "@tanstack/react-query";
import { APIBackend } from "../../../api/APIClient";
import { DocenteKey } from "../DocenteKey";

export const useDocenteMutation = () => {

    const qc = useQueryClient();

    const baseKey = DocenteKey.docenteLista();

    const patchAllLists = (updater) => {
        const matches = qc.getQueriesData({ queryKey: baseKey });
        matches.forEach(([key, _data]) => {
            qc.setQueryData(key, (curr = []) => updater(curr));
        });
    }

    const createMutation = useMutation({
        mutationKey: ['docente', 'crear'],
        mutationFn: async (docente) => {
            const res = await APIBackend.post('/docente/', docente);
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
        mutationKey: ['docente', 'actualizar'],
        mutationFn: async (docente) => {
            const res = await APIBackend.put('/docente/', docente);
            return res.data;
        },

        onSuccess(data) {
            patchAllLists((curr) =>
                (curr || []).map((docente) =>
                    docente.idDocente === data.idDocente ? { ...docente, ...data } : docente
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
