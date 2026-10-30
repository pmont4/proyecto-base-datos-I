import { useState, useMemo } from 'react';
import Swal from 'sweetalert2';
import { useMatriculaQuery } from '../../query/matricula/useMatriculaQuery';
import { useMatriculaMutation } from '../../query/matricula/mutation/useMatriculaMutation';
import { useEstudianteQuery } from '../../query/estudiante/useEstudianteQuery';
import { useSeccionQuery } from '../../query/seccion/useSeccionQuery';
import { usePagoMutation } from '../../query/pago/usePagoMutation';
import { DraggableWindow } from '../draggable/DraggableWindow';
import './Module.css';

const ESTADOS_MATRICULA = ['ACTIVA', 'CONGELADA'];
const ESTADO_INICIAL_CREACION = 'CONGELADA';
const METODOS_PAGO = ['TRANSFERENCIA', 'TARJETA', 'EFECTIVO'];

// Obtiene la fecha y hora local actual en formato "YYYY-MM-DDTHH:mm" para mostrar en inputs datetime-local bloqueados
const obtenerFechaHoraActualInput = () => {
    const ahora = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${ahora.getFullYear()}-${pad(ahora.getMonth() + 1)}-${pad(ahora.getDate())}T${pad(ahora.getHours())}:${pad(ahora.getMinutes())}`;
};

// Obtiene la fecha y hora local actual en formato exacto LocalDateTime de Java ("YYYY-MM-DDTHH:mm:ss")
const obtenerLocalDateTimeActual = () => {
    const ahora = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${ahora.getFullYear()}-${pad(ahora.getMonth() + 1)}-${pad(ahora.getDate())}T${pad(ahora.getHours())}:${pad(ahora.getMinutes())}:${pad(ahora.getSeconds())}`;
};

// Convierte "YYYY-MM-DDTHH:mm:ss" del backend a "YYYY-MM-DDTHH:mm" para el input datetime-local
const aDateTimeInput = (valor = '') => String(valor || '').trim().slice(0, 16);

// Formatea una fecha ISO ("2026-01-15T08:30:00") para lectura en la tabla
const formatearFechaTabla = (valor = '') => {
    if (!valor) return '—';
    return String(valor).replace('T', ' ').slice(0, 16);
};

// Normaliza texto para búsqueda insensible a mayúsculas y acentos
const normalizar = (texto) =>
    (texto || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

export const AdministrarMatriculas = () => {

    const { data: matriculas = [], isLoading, isError, error } = useMatriculaQuery();
    const { data: estudiantes = [], isLoading: isLoadingEstudiantes } = useEstudianteQuery();
    const { data: secciones = [], isLoading: isLoadingSecciones } = useSeccionQuery();
    const { create, update, isCreating, isUpdating } = useMatriculaMutation();
    const { create: createPago, isCreating: isCreatingPago } = usePagoMutation();

    // Filtro de búsqueda por nombre de estudiante
    const [busqueda, setBusqueda] = useState('');

    // Estado para la ventana de creación de matrícula
    const [isWindowOpen, setIsWindowOpen] = useState(false);
    const [formData, setFormData] = useState({
        idEstudiante: '',
        idSeccion: '',
        fechaInscripcion: obtenerFechaHoraActualInput(),
        estado: ESTADO_INICIAL_CREACION
    });

    // Estado para la ventana de ver completo / edición de matrícula
    const [matriculaAEditar, setMatriculaAEditar] = useState(null);
    const [editFormData, setEditFormData] = useState({
        idEstudiante: '',
        idSeccion: '',
        fechaInscripcion: '',
        estado: 'ACTIVA'
    });

    // Estado para la ventana de ver pago / crear pago
    const [matriculaParaPago, setMatriculaParaPago] = useState(null);
    const [pagoFormData, setPagoFormData] = useState({
        monto: '',
        metodoPago: 'TRANSFERENCIA',
        fechaPago: obtenerFechaHoraActualInput(),
        referenciaTransaccion: ''
    });

    // El backend responde 404 cuando no hay matrículas registradas
    const sinRegistros = error?.response?.status === 404;

    // Determina si la matrícula seleccionada en la ventana de pago ya cuenta con pago registrado
    const tienePagoRegistrado = Boolean(matriculaParaPago?.pago);

    // Matrículas filtradas en tiempo real por estudiante o curso
    const matriculasFiltradas = useMemo(() => {
        const query = normalizar(busqueda.trim());
        if (!query) return matriculas;
        return matriculas.filter((m) => {
            const nombreEstudiante = `${m.estudiante?.nombre || ''} ${m.estudiante?.apellido || ''}`.trim();
            const carnet = m.estudiante?.carnet || '';
            return (
                normalizar(nombreEstudiante).includes(query) ||
                normalizar(carnet).includes(query)
            );
        });
    }, [matriculas, busqueda]);

    const esFormularioMatriculaValido = (datos) =>
        Boolean(datos.idEstudiante) &&
        Boolean(datos.idSeccion) &&
        Boolean(datos.estado);

    const esFormularioPagoValido = (datos) =>
        Number(datos.monto) > 0 &&
        Boolean(datos.metodoPago) &&
        Boolean((datos.referenciaTransaccion || '').trim());

    /* ---- Lógica de Creación de Matrícula ---- */
    const handleOpenWindow = () => {
        setFormData({
            idEstudiante: '',
            idSeccion: '',
            fechaInscripcion: obtenerFechaHoraActualInput(),
            estado: ESTADO_INICIAL_CREACION
        });
        setIsWindowOpen(true);
    };

    const handleCloseWindow = () => {
        if (!isCreating) {
            setIsWindowOpen(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'fechaInscripcion' || name === 'estado') return;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!esFormularioMatriculaValido(formData)) return;

        const estudianteSeleccionado =
            estudiantes.find((est) => Number(est.idEstudiante) === Number(formData.idEstudiante)) ||
            { idEstudiante: Number(formData.idEstudiante) };

        const seccionSeleccionada =
            secciones.find((sec) => Number(sec.idSeccion) === Number(formData.idSeccion)) ||
            { idSeccion: Number(formData.idSeccion) };

        const payload = {
            estudiante: estudianteSeleccionado,
            seccion: seccionSeleccionada,
            fechaInscripcion: obtenerLocalDateTimeActual(),
            estado: ESTADO_INICIAL_CREACION,
            pago: null
        };

        create(payload, {
            onSuccess: () => {
                setIsWindowOpen(false);
                Swal.fire({
                    icon: 'info',
                    title: 'Matrícula registrada',
                    text: 'Debe registrar el pago correspondiente para activar la matrícula.',
                    confirmButtonColor: '#2e7d32',
                    confirmButtonText: 'Entendido'
                });
            }
        });
    };

    /* ---- Lógica de Ver Completo / Edición de Matrícula ---- */
    const seccionActualDetalle = useMemo(() => {
        if (!matriculaAEditar) return null;
        return (
            secciones.find((sec) => Number(sec.idSeccion) === Number(editFormData.idSeccion)) ||
            matriculaAEditar.seccion ||
            null
        );
    }, [secciones, editFormData.idSeccion, matriculaAEditar]);

    const handleOpenEdit = (matricula) => {
        setMatriculaAEditar(matricula);
        setEditFormData({
            idEstudiante: matricula.estudiante?.idEstudiante ?? '',
            idSeccion: matricula.seccion?.idSeccion ?? '',
            fechaInscripcion: aDateTimeInput(matricula.fechaInscripcion || ''),
            estado: matricula.estado || 'ACTIVA'
        });
    };

    const handleCloseEdit = () => {
        if (!isUpdating) {
            setMatriculaAEditar(null);
        }
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        if (name !== 'idSeccion') return;
        setEditFormData((prev) => ({
            ...prev,
            idSeccion: value
        }));
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        if (!matriculaAEditar || !editFormData.idSeccion) return;

        const seccionSeleccionada =
            secciones.find((sec) => Number(sec.idSeccion) === Number(editFormData.idSeccion)) ||
            matriculaAEditar.seccion ||
            { idSeccion: Number(editFormData.idSeccion) };

        const payload = {
            idMatricula: matriculaAEditar.idMatricula,
            estudiante: matriculaAEditar.estudiante,
            seccion: seccionSeleccionada,
            fechaInscripcion: matriculaAEditar.fechaInscripcion,
            estado: matriculaAEditar.estado,
            pago: matriculaAEditar.pago ?? null
        };

        update(payload, {
            onSuccess: () => {
                setMatriculaAEditar(null);
            }
        });
    };

    /* ---- Lógica de Ver Pago / Crear Pago ---- */
    const handleOpenPago = (matricula) => {
        setMatriculaParaPago(matricula);
        if (matricula.pago) {
            setPagoFormData({
                monto: matricula.pago.monto ?? '',
                metodoPago: matricula.pago.metodoPago || 'TRANSFERENCIA',
                fechaPago: aDateTimeInput(matricula.pago.fechaPago || ''),
                referenciaTransaccion: matricula.pago.referenciaTransaccion || ''
            });
        } else {
            setPagoFormData({
                monto: '',
                metodoPago: 'TRANSFERENCIA',
                fechaPago: obtenerFechaHoraActualInput(),
                referenciaTransaccion: ''
            });
        }
    };

    const handleClosePago = () => {
        if (!isCreatingPago) {
            setMatriculaParaPago(null);
        }
    };

    const handlePagoChange = (e) => {
        if (tienePagoRegistrado) return;
        const { name, value } = e.target;
        if (name === 'fechaPago') return;
        setPagoFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePagoSubmit = (e) => {
        e.preventDefault();
        // Si ya tiene pago, solo es visualización; no se permite actualizar nada del pago
        if (!matriculaParaPago || tienePagoRegistrado || !esFormularioPagoValido(pagoFormData)) {
            return;
        }

        const payload = {
            idMatricula: matriculaParaPago.idMatricula,
            monto: Number(pagoFormData.monto).toFixed(2),
            metodoPago: pagoFormData.metodoPago,
            fechaPago: obtenerLocalDateTimeActual(),
            referenciaTransaccion: pagoFormData.referenciaTransaccion.trim()
        };

        createPago(payload, {
            onSuccess: () => {
                setMatriculaParaPago(null);
            }
        });
    };

    const renderBody = () => {
        if (isLoading) {
            return (
                <tr>
                    <td colSpan={5} className="table__message">Cargando matrículas...</td>
                </tr>
            );
        }

        if (isError && !sinRegistros) {
            return (
                <tr>
                    <td colSpan={5} className="table__message table__message--error">
                        No se pudieron obtener las matrículas.
                    </td>
                </tr>
            );
        }

        if (sinRegistros || matriculas.length === 0) {
            return (
                <tr>
                    <td colSpan={5} className="table__message">No hay matrículas registradas.</td>
                </tr>
            );
        }

        if (matriculasFiltradas.length === 0) {
            return (
                <tr>
                    <td colSpan={5} className="table__message">
                        No se encontraron matrículas que coincidan con &quot;{busqueda}&quot;.
                    </td>
                </tr>
            );
        }

        return matriculasFiltradas.map((matricula) => {
            const { idMatricula, estudiante, fechaInscripcion, estado, pago } = matricula;
            const nombreEstudiante = `${estudiante?.nombre || ''} ${estudiante?.apellido || ''}`.trim();
            const tienePago = Boolean(pago);

            return (
                <tr key={idMatricula}>
                    <td>{idMatricula}</td>
                    <td>{nombreEstudiante || 'Sin estudiante'}</td>
                    <td>{formatearFechaTabla(fechaInscripcion)}</td>
                    <td className="table__cell--center">{estado}</td>
                    <td className="table__cell--center">
                        <div className="table__actions-group">
                            <button
                                type="button"
                                className="btn-table-action btn-table-action--edit"
                                onClick={() => handleOpenEdit(matricula)}
                            >
                                Ver completo
                            </button>
                            <button
                                type="button"
                                className="btn-table-action btn-table-action--pay"
                                onClick={() => handleOpenPago(matricula)}
                            >
                                {tienePago ? 'Ver pago' : 'Crear pago'}
                            </button>
                        </div>
                    </td>
                </tr>
            );
        });
    };

    return (
        <section className="module">
            <header className="module__header">
                <h2 className="module__title">Administrar Matrículas</h2>
                <button
                    type="button"
                    className="btn-primary-green"
                    onClick={handleOpenWindow}
                >
                    Agregar Matrícula
                </button>
            </header>

            {/* Barra de búsqueda por nombre o carnet del estudiante */}
            <div className="module__toolbar">
                <div className="search-bar">
                    <span className="search-bar__icon" aria-hidden="true">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                    </span>
                    <input
                        id="busqueda-matricula"
                        type="text"
                        className="search-bar__input"
                        placeholder="Buscar por estudiante o carnet..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                    {busqueda && (
                        <button
                            type="button"
                            className="search-bar__clear"
                            onClick={() => setBusqueda('')}
                            aria-label="Limpiar búsqueda"
                        >
                            &times;
                        </button>
                    )}
                </div>
            </div>

            <div className="table-wrapper">
                <table className="table" id="tabla-matriculas">
                    <thead>
                        <tr>
                            <th className="table__col--id">ID</th>
                            <th>Estudiante</th>
                            <th>Fecha de inscripción</th>
                            <th className="table__cell--center">Estado</th>
                            <th className="table__col--actions table__cell--center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {renderBody()}
                    </tbody>
                </table>
            </div>

            {/* Ventana flotante: Agregar Matrícula */}
            <DraggableWindow
                isOpen={isWindowOpen}
                onClose={handleCloseWindow}
                title="Agregar Matrícula"
                width={520}
                height={470}
            >
                <form className="form-crud" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="idEstudiante">Estudiante</label>
                        <select
                            id="idEstudiante"
                            name="idEstudiante"
                            className="form-control"
                            value={formData.idEstudiante}
                            onChange={handleChange}
                            required
                            autoFocus
                        >
                            <option value="" disabled>
                                {isLoadingEstudiantes ? 'Cargando estudiantes...' : 'Seleccione un estudiante'}
                            </option>
                            {estudiantes.map((est) => (
                                <option key={est.idEstudiante} value={est.idEstudiante}>
                                    {`${est.carnet ? `${est.carnet} - ` : ''}${est.nombre || ''} ${est.apellido || ''}`.trim()}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="idSeccion">Sección</label>
                        <select
                            id="idSeccion"
                            name="idSeccion"
                            className="form-control"
                            value={formData.idSeccion}
                            onChange={handleChange}
                            required
                        >
                            <option value="" disabled>
                                {isLoadingSecciones ? 'Cargando secciones...' : 'Seleccione una sección'}
                            </option>
                            {secciones.map((sec) => (
                                <option key={sec.idSeccion} value={sec.idSeccion}>
                                    {`${sec.curso?.nombreCurso || 'Curso'} - Sección ${sec.seccionCodigo || ''} (${sec.cicloAcademico || ''})`}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="fechaInscripcion">Fecha de Inscripción (Automática)</label>
                            <input
                                id="fechaInscripcion"
                                name="fechaInscripcion"
                                type="datetime-local"
                                className="form-control"
                                value={formData.fechaInscripcion}
                                readOnly
                                disabled
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="estado">Estado (Por defecto)</label>
                            <input
                                id="estado"
                                name="estado"
                                type="text"
                                className="form-control"
                                value={ESTADO_INICIAL_CREACION}
                                readOnly
                                disabled
                            />
                        </div>
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={handleCloseWindow}
                            disabled={isCreating}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="btn-primary-green"
                            disabled={isCreating || !esFormularioMatriculaValido(formData)}
                        >
                            {isCreating ? 'Guardando...' : 'Guardar Matrícula'}
                        </button>
                    </div>
                </form>
            </DraggableWindow>

            {/* Ventana flotante: Ver Completo / Editar Matrícula (solo Sección editable) */}
            <DraggableWindow
                isOpen={Boolean(matriculaAEditar)}
                onClose={handleCloseEdit}
                title={`Detalle de Matrícula (ID: ${matriculaAEditar?.idMatricula ?? ''})`}
                width={540}
                height={590}
            >
                <form className="form-crud" onSubmit={handleEditSubmit}>
                    <div className="form-group">
                        <label htmlFor="edit-idEstudiante">Estudiante</label>
                        <select
                            id="edit-idEstudiante"
                            name="idEstudiante"
                            className="form-control"
                            value={editFormData.idEstudiante}
                            disabled
                        >
                            <option value="">
                                {`${matriculaAEditar?.estudiante?.nombre || ''} ${matriculaAEditar?.estudiante?.apellido || ''}`.trim() || 'Estudiante'}
                            </option>
                            {estudiantes.map((est) => (
                                <option key={est.idEstudiante} value={est.idEstudiante}>
                                    {`${est.carnet ? `${est.carnet} - ` : ''}${est.nombre || ''} ${est.apellido || ''}`.trim()}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Carnet del Estudiante</label>
                            <input
                                type="text"
                                className="form-control"
                                value={matriculaAEditar?.estudiante?.carnet || ''}
                                readOnly
                                disabled
                            />
                        </div>

                        <div className="form-group">
                            <label>Carrera</label>
                            <input
                                type="text"
                                className="form-control"
                                value={matriculaAEditar?.estudiante?.carrera?.nombreCarrera || ''}
                                readOnly
                                disabled
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="edit-idSeccion">Sección</label>
                        <select
                            id="edit-idSeccion"
                            name="idSeccion"
                            className="form-control"
                            value={editFormData.idSeccion}
                            onChange={handleEditChange}
                            required
                            autoFocus
                        >
                            <option value="" disabled>
                                {isLoadingSecciones ? 'Cargando secciones...' : 'Seleccione una sección'}
                            </option>
                            {secciones.map((sec) => (
                                <option key={sec.idSeccion} value={sec.idSeccion}>
                                    {`${sec.curso?.nombreCurso || 'Curso'} - Sección ${sec.seccionCodigo || ''} (${sec.cicloAcademico || ''})`}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Docente Asignado</label>
                            <input
                                type="text"
                                className="form-control"
                                value={
                                    `${seccionActualDetalle?.docente?.nombreDocente || ''} ${seccionActualDetalle?.docente?.apellidoDocente || ''}`.trim()
                                }
                                readOnly
                                disabled
                            />
                        </div>

                        <div className="form-group">
                            <label>Aula / Horario</label>
                            <input
                                type="text"
                                className="form-control"
                                value={
                                    seccionActualDetalle?.seccionHorario
                                        ? `${seccionActualDetalle.seccionHorario.aula || ''} (${(seccionActualDetalle.seccionHorario.horaInicio || '').slice(0, 5)} - ${(seccionActualDetalle.seccionHorario.horaFin || '').slice(0, 5)})`
                                        : ''
                                }
                                readOnly
                                disabled
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="edit-fechaInscripcion">Fecha de Inscripción</label>
                            <input
                                id="edit-fechaInscripcion"
                                name="fechaInscripcion"
                                type="datetime-local"
                                className="form-control"
                                value={editFormData.fechaInscripcion}
                                readOnly
                                disabled
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="edit-estado">Estado</label>
                            <select
                                id="edit-estado"
                                name="estado"
                                className="form-control"
                                value={editFormData.estado}
                                disabled
                            >
                                {ESTADOS_MATRICULA.map((est) => (
                                    <option key={est} value={est}>
                                        {est}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={handleCloseEdit}
                            disabled={isUpdating}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="btn-primary-green"
                            disabled={isUpdating || !editFormData.idSeccion}
                        >
                            {isUpdating ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </DraggableWindow>

            {/* Ventana flotante: Ver Pago (solo lectura) / Crear Pago */}
            <DraggableWindow
                isOpen={Boolean(matriculaParaPago)}
                onClose={handleClosePago}
                title={
                    tienePagoRegistrado
                        ? `Detalle del Pago (Matrícula #${matriculaParaPago?.idMatricula ?? ''})`
                        : `Crear Pago (Matrícula #${matriculaParaPago?.idMatricula ?? ''})`
                }
                width={480}
                height={520}
            >
                <form className="form-crud" onSubmit={handlePagoSubmit}>
                    <div className="form-row">
                        {tienePagoRegistrado && (
                            <div className="form-group">
                                <label htmlFor="pago-idPago">ID de Pago</label>
                                <input
                                    id="pago-idPago"
                                    type="text"
                                    className="form-control"
                                    value={matriculaParaPago?.pago?.idPago ?? ''}
                                    readOnly
                                    disabled
                                />
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="pago-idMatricula">ID de Matrícula</label>
                            <input
                                id="pago-idMatricula"
                                type="text"
                                className="form-control"
                                value={matriculaParaPago?.idMatricula ?? ''}
                                readOnly
                                disabled
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="pago-monto">Monto (Q)</label>
                            <input
                                id="pago-monto"
                                name="monto"
                                type="number"
                                step="0.01"
                                min="0.01"
                                className="form-control"
                                placeholder="Ej. 550.00"
                                value={pagoFormData.monto}
                                onChange={handlePagoChange}
                                readOnly={tienePagoRegistrado}
                                disabled={tienePagoRegistrado}
                                required
                                autoFocus={!tienePagoRegistrado}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="pago-metodoPago">Método de Pago</label>
                            <select
                                id="pago-metodoPago"
                                name="metodoPago"
                                className="form-control"
                                value={pagoFormData.metodoPago}
                                onChange={handlePagoChange}
                                disabled={tienePagoRegistrado}
                                required
                            >
                                {METODOS_PAGO.map((metodo) => (
                                    <option key={metodo} value={metodo}>
                                        {metodo}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="pago-fechaPago">
                            {tienePagoRegistrado ? 'Fecha de Pago' : 'Fecha de Pago (Automática)'}
                        </label>
                        <input
                            id="pago-fechaPago"
                            name="fechaPago"
                            type="datetime-local"
                            className="form-control"
                            value={pagoFormData.fechaPago}
                            readOnly
                            disabled
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="pago-referenciaTransaccion">Referencia de Transacción</label>
                        <input
                            id="pago-referenciaTransaccion"
                            name="referenciaTransaccion"
                            type="text"
                            className="form-control"
                            placeholder="Ej. REF-909012"
                            value={pagoFormData.referenciaTransaccion}
                            onChange={handlePagoChange}
                            readOnly={tienePagoRegistrado}
                            disabled={tienePagoRegistrado}
                            required
                        />
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={handleClosePago}
                            disabled={isCreatingPago}
                        >
                            {tienePagoRegistrado ? 'Cerrar' : 'Cancelar'}
                        </button>
                        {!tienePagoRegistrado && (
                            <button
                                type="submit"
                                className="btn-primary-green"
                                disabled={isCreatingPago || !esFormularioPagoValido(pagoFormData)}
                            >
                                {isCreatingPago ? 'Guardando...' : 'Guardar Pago'}
                            </button>
                        )}
                    </div>
                </form>
            </DraggableWindow>
        </section>
    );
};

