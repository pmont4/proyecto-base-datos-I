import { useMutation, useQueryClient } from "@tanstack/react-query";
import { APIBackend } from "../../api/APIClient";
import { MatriculaKeys } from "../matricula/MatriculaKeys";

export const usePagoMutation = () => {

    const qc = useQueryClient();

    const matriculaBaseKey = MatriculaKeys.matriculaList();

    const patchMatriculaLists = (updater) => {
        const matches = qc.getQueriesData({ queryKey: matriculaBaseKey });
        matches.forEach(([key, _data]) => {
            qc.setQueryData(key, (curr = []) => updater(curr));
        });
    };

    const createMutation = useMutation({
        mutationKey: ['pago', 'crear'],
        mutationFn: async (pago) => {
            const res = await APIBackend.post('/pago/', pago);
            return res.data;
        },

        onSuccess(data, variables) {
            const idMatricula =
                data?.idMatricula ??
                data?.matricula?.idMatricula ??
                variables?.idMatricula ??
                variables?.matricula?.idMatricula;

            if (idMatricula !== undefined && idMatricula !== null) {
                patchMatriculaLists((curr) =>
                    (curr || []).map((matricula) => {
                        if (matricula.idMatricula !== idMatricula) return matricula;

                        // Si el backend retorna la matrícula actualizada o la incluye anidada
                        const datosMatricula = data?.matricula ? data.matricula : {};

                        return {
                            ...matricula,
                            ...datosMatricula,
                            pago: data,
                            ...(Array.isArray(matricula.pagos)
                                ? { pagos: [...matricula.pagos, data] }
                                : {})
                        };
                    })
                );
            }
        },

        async onSettled() {
            await qc.invalidateQueries({ queryKey: matriculaBaseKey, refetchType: 'active' });
        },
    });

    const updateMutation = useMutation({
        mutationKey: ['pago', 'actualizar'],
        mutationFn: async (pago) => {
            const res = await APIBackend.put('/pago/', pago);
            return res.data;
        },

        onSuccess(data, variables) {
            const idMatricula =
                data?.idMatricula ??
                data?.matricula?.idMatricula ??
                variables?.idMatricula ??
                variables?.matricula?.idMatricula;

            if (idMatricula !== undefined && idMatricula !== null) {
                patchMatriculaLists((curr) =>
                    (curr || []).map((matricula) => {
                        if (matricula.idMatricula !== idMatricula) return matricula;

                        const datosMatricula = data?.matricula ? data.matricula : {};

                        return {
                            ...matricula,
                            ...datosMatricula,
                            pago: data,
                            ...(Array.isArray(matricula.pagos)
                                ? {
                                      pagos: matricula.pagos.map((p) =>
                                          p.idPago === data?.idPago ? { ...p, ...data } : p
                                      )
                                  }
                                : {})
                        };
                    })
                );
            }
        },

        async onSettled() {
            await qc.invalidateQueries({ queryKey: matriculaBaseKey, refetchType: 'active' });
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

};

