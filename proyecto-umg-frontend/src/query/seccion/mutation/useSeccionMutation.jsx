import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SeccionKey } from "../SeccionKey";
import { APIBackend } from "../../../api/APIClient";

export const useSeccionMutation = () => {

    const qc = useQueryClient();

    const baseKey = SeccionKey.seccionList();

    const patchAllLists = (updater) => {
        const matches = qc.getQueriesData({ queryKey: baseKey });
        matches.forEach(([key, _data]) => {
            qc.setQueryData(key, (curr = []) => updater(curr));
        });
    }

    const createMutation = useMutation({
        mutationKey: ['seccion', 'crear'],
        mutationFn: async (seccion) => {
            const res = await APIBackend.post('/seccion/', seccion);
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
        mutationKey: ['seccion', 'actualizar'],
        mutationFn: async (seccion) => {
            const res = await APIBackend.put('/seccion/', seccion);
            return res.data;
        },

        onSuccess(data) {
            patchAllLists((curr) =>
                (curr || []).map((seccion) =>
                    seccion.idSeccion === data.idSeccion ? { ...seccion, ...data } : seccion
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
