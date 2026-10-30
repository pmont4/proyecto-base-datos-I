import { useMutation, useQueryClient } from "@tanstack/react-query";
import { APIBackend } from "../../../api/APIClient";
import { MatriculaKeys } from "../MatriculaKeys";

export const useMatriculaMutation = () => {

    const qc = useQueryClient();

    const baseKey = MatriculaKeys.matriculaList();

    const patchAllLists = (updater) => {
        const matches = qc.getQueriesData({ queryKey: baseKey });
        matches.forEach(([key, _data]) => {
            qc.setQueryData(key, (curr = []) => updater(curr));
        });
    }

    const createMutation = useMutation({
        mutationKey: ['matricula', 'crear'],
        mutationFn: async (matricula) => {
            const res = await APIBackend.post('/matricula/', matricula);
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
        mutationKey: ['matricula', 'actualizar'],
        mutationFn: async (matricula) => {
            const res = await APIBackend.put('/matricula/', matricula);
            return res.data;
        },

        onSuccess(data) {
            patchAllLists((curr) =>
                (curr || []).map((matricula) =>
                    matricula.idMatricula === data.idMatricula ? { ...matricula, ...data } : matricula
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
