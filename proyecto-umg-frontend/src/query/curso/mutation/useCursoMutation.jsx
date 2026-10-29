import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CursoKey } from "../CursoKey"
import { APIBackend } from "../../../api/APIClient";

export const useCursoMutation = () => {

    const qc = useQueryClient();

    const baseKey = CursoKey.cursoLista();

    const patchAllLists = (updater) => {
        const matches = qc.getQueriesData({ queryKey: baseKey });
        matches.forEach(([key, _data]) => {
            qc.setQueryData(key, (curr = []) => updater(curr));
        });
    }

    const createMutation = useMutation({
        mutationKey: ['curso', 'crear'],
        mutationFn: async (curso) => {
            const res = await APIBackend.post('/curso/', curso);
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
        mutationKey: ['curso', 'actualizar'],
        mutationFn: async (curso) => {
            const res = await APIBackend.put('/curso/', curso);
            return res.data;
        },

        onSuccess(data) {
            patchAllLists((curr) =>
                (curr || []).map((curso) =>
                    curso.idCurso === data.idCurso ? { ...curso, ...data } : curso
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
