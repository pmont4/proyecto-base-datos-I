import { useState, useMemo } from 'react';
import { useSeccionQuery } from '../../query/seccion/useSeccionQuery';
import { useSeccionMutation } from '../../query/seccion/mutation/useSeccionMutation';
import { useCursoQuery } from '../../query/curso/useCursoQuery';
import { useDocenteQuery } from '../../query/docente/useDocenteQuery';
import { DraggableWindow } from '../draggable/DraggableWindow';
import './Module.css';

const CICLO_ACADEMICO_DEFECTO = '2026-01';

// Días de la semana mapeados a su entero correspondiente en el JSON
const DIAS_SEMANA = [
    { valor: 1, etiqueta: 'Lunes' },
    { valor: 2, etiqueta: 'Martes' },
    { valor: 3, etiqueta: 'Miércoles' },
    { valor: 4, etiqueta: 'Jueves' },
    { valor: 5, etiqueta: 'Viernes' },
    { valor: 6, etiqueta: 'Sábado' },
    { valor: 7, etiqueta: 'Domingo' }
];

const INITIAL_FORM_STATE = {
    idCurso: '',
    idDocente: '',
    cicloAcademico: CICLO_ACADEMICO_DEFECTO,
    seccionCodigo: '',
    cupoMaximo: '',
    diaSemana: '',
    horaInicio: '',
    horaFin: '',
    aula: ''
};

// Normaliza texto para búsqueda insensible a mayúsculas y acentos
const normalizar = (texto) =>
    (texto || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

// Permite únicamente una letra (A-Z) para seccionCodigo (char en Java)
const sanitizarSeccionCodigo = (valor = '') =>
    (valor || '')
        .replace(/[^a-zA-Z]/g, '')
        .slice(0, 1)
        .toUpperCase();

const esSeccionCodigoValido = (codigo) => /^[A-Za-z]$/.test((codigo || '').trim());

// Convierte "HH:mm" del input time al formato "HH:mm:ss" esperado por LocalTime en Java
const formatearHoraLocalTime = (hora = '') => {
    const limpia = String(hora || '').trim();
    if (!limpia) return '';
    return limpia.length === 5 ? `${limpia}:00` : limpia;
};

// Convierte "HH:mm:ss" del backend a "HH:mm" para mostrar en el input type="time"
const aHoraInput = (hora = '') => String(hora || '').trim().slice(0, 5);

export const AdministrarSecciones = () => {

    const { data: secciones = [], isLoading, isError, error } = useSeccionQuery();
    const { data: cursos = [], isLoading: isLoadingCursos } = useCursoQuery();
    const { data: docentes = [], isLoading: isLoadingDocentes } = useDocenteQuery();
    const { create, update, isCreating, isUpdating } = useSeccionMutation();

    // Filtro de búsqueda
    const [busqueda, setBusqueda] = useState('');

    // Estado para la ventana de creación
    const [isWindowOpen, setIsWindowOpen] = useState(false);
    const [formData, setFormData] = useState(INITIAL_FORM_STATE);

    // Estado para la ventana de ver completo / edición
    const [seccionAEditar, setSeccionAEditar] = useState(null);
    const [editFormData, setEditFormData] = useState(INITIAL_FORM_STATE);

    // El backend responde 404 cuando no hay secciones registradas
    const sinRegistros = error?.response?.status === 404;

    // Secciones filtradas en tiempo real por nombre del curso o docente
    const seccionesFiltradas = useMemo(() => {
        const query = normalizar(busqueda.trim());
        if (!query) return secciones;
        return secciones.filter((sec) => {
            const nombreCurso = sec.curso?.nombreCurso || '';
            const nombreDocente = `${sec.docente?.nombreDocente || ''} ${sec.docente?.apellidoDocente || ''}`.trim();
            return (
                normalizar(nombreCurso).includes(query) ||
                normalizar(nombreDocente).includes(query)
            );
        });
    }, [secciones, busqueda]);

    const esFormularioValido = (datos) =>
        Boolean(datos.idCurso) &&
        Boolean(datos.idDocente) &&
        esSeccionCodigoValido(datos.seccionCodigo) &&
        Number(datos.cupoMaximo) > 0 &&
        Boolean(datos.diaSemana) &&
        Boolean(datos.horaInicio) &&
        Boolean(datos.horaFin) &&
        Boolean((datos.aula || '').trim());

    /* ---- Lógica de Creación ---- */
    const handleOpenWindow = () => {
        setFormData(INITIAL_FORM_STATE);
        setIsWindowOpen(true);
    };

    const handleCloseWindow = () => {
        if (!isCreating) {
            setIsWindowOpen(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'seccionCodigo' ? sanitizarSeccionCodigo(value) : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!esFormularioValido(formData)) return;

        const cursoSeleccionado =
            cursos.find((c) => Number(c.idCurso) === Number(formData.idCurso)) ||
            { idCurso: Number(formData.idCurso) };

        const docenteSeleccionado =
            docentes.find((d) => Number(d.idDocente) === Number(formData.idDocente)) ||
            { idDocente: Number(formData.idDocente) };

        const payload = {
            curso: cursoSeleccionado,
            docente: docenteSeleccionado,
            cicloAcademico: CICLO_ACADEMICO_DEFECTO,
            seccionCodigo: sanitizarSeccionCodigo(formData.seccionCodigo),
            cupoMaximo: parseInt(formData.cupoMaximo, 10),
            seccionHorario: {
                diaSemana: parseInt(formData.diaSemana, 10),
                horaInicio: formatearHoraLocalTime(formData.horaInicio),
                horaFin: formatearHoraLocalTime(formData.horaFin),
                aula: formData.aula.trim()
            }
        };

        create(payload, {
            onSuccess: () => {
                setFormData(INITIAL_FORM_STATE);
                setIsWindowOpen(false);
            }
        });
    };

    /* ---- Lógica de Ver Completo / Edición ---- */
    const handleOpenEdit = (seccion) => {
        setSeccionAEditar(seccion);
        setEditFormData({
            idCurso: seccion.curso?.idCurso ?? '',
            idDocente: seccion.docente?.idDocente ?? '',
            cicloAcademico: seccion.cicloAcademico || CICLO_ACADEMICO_DEFECTO,
            seccionCodigo: sanitizarSeccionCodigo(seccion.seccionCodigo || ''),
            cupoMaximo: seccion.cupoMaximo ?? '',
            diaSemana: seccion.seccionHorario?.diaSemana ?? '',
            horaInicio: aHoraInput(seccion.seccionHorario?.horaInicio || ''),
            horaFin: aHoraInput(seccion.seccionHorario?.horaFin || ''),
            aula: seccion.seccionHorario?.aula || ''
        });
    };

    const handleCloseEdit = () => {
        if (!isUpdating) {
            setSeccionAEditar(null);
        }
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditFormData((prev) => ({
            ...prev,
            [name]: name === 'seccionCodigo' ? sanitizarSeccionCodigo(value) : value
        }));
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        if (!seccionAEditar || !esFormularioValido(editFormData)) return;

        const cursoSeleccionado =
            cursos.find((c) => Number(c.idCurso) === Number(editFormData.idCurso)) ||
            seccionAEditar.curso ||
            { idCurso: Number(editFormData.idCurso) };

        const docenteSeleccionado =
            docentes.find((d) => Number(d.idDocente) === Number(editFormData.idDocente)) ||
            seccionAEditar.docente ||
            { idDocente: Number(editFormData.idDocente) };

        const payload = {
            idSeccion: seccionAEditar.idSeccion,
            curso: cursoSeleccionado,
            docente: docenteSeleccionado,
            cicloAcademico: CICLO_ACADEMICO_DEFECTO,
            seccionCodigo: sanitizarSeccionCodigo(editFormData.seccionCodigo),
            cupoMaximo: parseInt(editFormData.cupoMaximo, 10),
            seccionHorario: {
                ...(seccionAEditar.seccionHorario?.idSeccionHorario
                    ? { idSeccionHorario: seccionAEditar.seccionHorario.idSeccionHorario }
                    : {}),
                idSeccion: seccionAEditar.idSeccion,
                diaSemana: parseInt(editFormData.diaSemana, 10),
                horaInicio: formatearHoraLocalTime(editFormData.horaInicio),
                horaFin: formatearHoraLocalTime(editFormData.horaFin),
                aula: editFormData.aula.trim()
            }
        };

        update(payload, {
            onSuccess: () => {
                setSeccionAEditar(null);
            }
        });
    };

    const renderBody = () => {
        if (isLoading) {
            return (
                <tr>
                    <td colSpan={5} className="table__message">Cargando secciones...</td>
                </tr>
            );
        }

        if (isError && !sinRegistros) {
            return (
                <tr>
                    <td colSpan={5} className="table__message table__message--error">
                        No se pudieron obtener las secciones.
                    </td>
                </tr>
            );
        }

        if (sinRegistros || secciones.length === 0) {
            return (
                <tr>
                    <td colSpan={5} className="table__message">No hay secciones registradas.</td>
                </tr>
            );
        }

        if (seccionesFiltradas.length === 0) {
            return (
                <tr>
                    <td colSpan={5} className="table__message">
                        No se encontraron secciones que coincidan con &quot;{busqueda}&quot;.
                    </td>
                </tr>
            );
        }

        return seccionesFiltradas.map((seccion) => {
            const { idSeccion, cicloAcademico, docente, curso } = seccion;
            const nombreDocente = `${docente?.nombreDocente || ''} ${docente?.apellidoDocente || ''}`.trim();

            return (
                <tr key={idSeccion}>
                    <td>{idSeccion}</td>
                    <td>{cicloAcademico}</td>
                    <td>{nombreDocente || 'Sin asignar'}</td>
                    <td>{curso?.nombreCurso || 'Sin asignar'}</td>
                    <td className="table__cell--center">
                        <button
                            type="button"
                            className="btn-table-action btn-table-action--edit"
                            onClick={() => handleOpenEdit(seccion)}
                        >
                            Ver completo
                        </button>
                    </td>
                </tr>
            );
        });
    };

    return (
        <section className="module">
            <header className="module__header">
                <h2 className="module__title">Administrar Secciones</h2>
                <button
                    type="button"
                    className="btn-primary-green"
                    onClick={handleOpenWindow}
                >
                    Agregar Sección
                </button>
            </header>

            {/* Barra de búsqueda por curso o docente */}
            <div className="module__toolbar">
                <div className="search-bar">
                    <span className="search-bar__icon" aria-hidden="true">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                    </span>
                    <input
                        id="busqueda-seccion"
                        type="text"
                        className="search-bar__input"
                        placeholder="Buscar por curso o docente..."
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
                <table className="table" id="tabla-secciones">
                    <thead>
                        <tr>
                            <th className="table__col--id">ID</th>
                            <th>Ciclo académico</th>
                            <th>Docente</th>
                            <th>Curso</th>
                            <th className="table__col--actions table__cell--center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {renderBody()}
                    </tbody>
                </table>
            </div>

            {/* Ventana flotante: Agregar Sección */}
            <DraggableWindow
                isOpen={isWindowOpen}
                onClose={handleCloseWindow}
                title="Agregar Sección"
                width={540}
                height={620}
            >
                <form className="form-crud" onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="cicloAcademico">Ciclo Académico</label>
                            <input
                                id="cicloAcademico"
                                name="cicloAcademico"
                                type="text"
                                className="form-control"
                                value={CICLO_ACADEMICO_DEFECTO}
                                readOnly
                                disabled
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="seccionCodigo">Código de Sección (Letra)</label>
                            <input
                                id="seccionCodigo"
                                name="seccionCodigo"
                                type="text"
                                maxLength={1}
                                pattern="[A-Za-z]"
                                title="Ingrese únicamente una letra (Ej. A, B, C)"
                                className="form-control"
                                placeholder="Ej. A"
                                value={formData.seccionCodigo}
                                onChange={handleChange}
                                required
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="idCurso">Curso</label>
                        <select
                            id="idCurso"
                            name="idCurso"
                            className="form-control"
                            value={formData.idCurso}
                            onChange={handleChange}
                            required
                        >
                            <option value="" disabled>
                                {isLoadingCursos ? 'Cargando cursos...' : 'Seleccione un curso'}
                            </option>
                            {cursos.map((c) => (
                                <option key={c.idCurso} value={c.idCurso}>
                                    {c.codigoCurso ? `${c.codigoCurso} - ${c.nombreCurso}` : c.nombreCurso}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="idDocente">Docente</label>
                        <select
                            id="idDocente"
                            name="idDocente"
                            className="form-control"
                            value={formData.idDocente}
                            onChange={handleChange}
                            required
                        >
                            <option value="" disabled>
                                {isLoadingDocentes ? 'Cargando docentes...' : 'Seleccione un docente'}
                            </option>
                            {docentes.map((d) => (
                                <option key={d.idDocente} value={d.idDocente}>
                                    {`${d.nombreDocente || ''} ${d.apellidoDocente || ''}`.trim()}
                                    {d.especialidadDocente ? ` (${d.especialidadDocente})` : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="cupoMaximo">Cupo Máximo</label>
                        <input
                            id="cupoMaximo"
                            name="cupoMaximo"
                            type="number"
                            min="1"
                            max="200"
                            className="form-control"
                            placeholder="Ej. 35"
                            value={formData.cupoMaximo}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <h4 className="form-section-title">Horario de la Sección</h4>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="diaSemana">Día de la Semana</label>
                            <select
                                id="diaSemana"
                                name="diaSemana"
                                className="form-control"
                                value={formData.diaSemana}
                                onChange={handleChange}
                                required
                            >
                                <option value="" disabled>
                                    Seleccione un día
                                </option>
                                {DIAS_SEMANA.map((dia) => (
                                    <option key={dia.valor} value={dia.valor}>
                                        {dia.etiqueta}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="aula">Aula</label>
                            <input
                                id="aula"
                                name="aula"
                                type="text"
                                className="form-control"
                                placeholder="Ej. T1-101"
                                value={formData.aula}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="horaInicio">Hora de Inicio</label>
                            <input
                                id="horaInicio"
                                name="horaInicio"
                                type="time"
                                className="form-control"
                                value={formData.horaInicio}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="horaFin">Hora de Fin</label>
                            <input
                                id="horaFin"
                                name="horaFin"
                                type="time"
                                className="form-control"
                                value={formData.horaFin}
                                onChange={handleChange}
                                required
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
                            disabled={isCreating || !esFormularioValido(formData)}
                        >
                            {isCreating ? 'Guardando...' : 'Guardar Sección'}
                        </button>
                    </div>
                </form>
            </DraggableWindow>

            {/* Ventana flotante: Ver Completo / Editar Sección */}
            <DraggableWindow
                isOpen={Boolean(seccionAEditar)}
                onClose={handleCloseEdit}
                title={`Detalle de la Sección (ID: ${seccionAEditar?.idSeccion ?? ''})`}
                width={540}
                height={620}
            >
                <form className="form-crud" onSubmit={handleEditSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="edit-cicloAcademico">Ciclo Académico</label>
                            <input
                                id="edit-cicloAcademico"
                                name="cicloAcademico"
                                type="text"
                                className="form-control"
                                value={CICLO_ACADEMICO_DEFECTO}
                                readOnly
                                disabled
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="edit-seccionCodigo">Código de Sección (Letra)</label>
                            <input
                                id="edit-seccionCodigo"
                                name="seccionCodigo"
                                type="text"
                                maxLength={1}
                                pattern="[A-Za-z]"
                                title="Ingrese únicamente una letra (Ej. A, B, C)"
                                className="form-control"
                                placeholder="Ej. A"
                                value={editFormData.seccionCodigo}
                                onChange={handleEditChange}
                                required
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="edit-idCurso">Curso</label>
                        <select
                            id="edit-idCurso"
                            name="idCurso"
                            className="form-control"
                            value={editFormData.idCurso}
                            onChange={handleEditChange}
                            required
                        >
                            <option value="" disabled>
                                {isLoadingCursos ? 'Cargando cursos...' : 'Seleccione un curso'}
                            </option>
                            {cursos.map((c) => (
                                <option key={c.idCurso} value={c.idCurso}>
                                    {c.codigoCurso ? `${c.codigoCurso} - ${c.nombreCurso}` : c.nombreCurso}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="edit-idDocente">Docente</label>
                        <select
                            id="edit-idDocente"
                            name="idDocente"
                            className="form-control"
                            value={editFormData.idDocente}
                            onChange={handleEditChange}
                            required
                        >
                            <option value="" disabled>
                                {isLoadingDocentes ? 'Cargando docentes...' : 'Seleccione un docente'}
                            </option>
                            {docentes.map((d) => (
                                <option key={d.idDocente} value={d.idDocente}>
                                    {`${d.nombreDocente || ''} ${d.apellidoDocente || ''}`.trim()}
                                    {d.especialidadDocente ? ` (${d.especialidadDocente})` : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="edit-cupoMaximo">Cupo Máximo</label>
                        <input
                            id="edit-cupoMaximo"
                            name="cupoMaximo"
                            type="number"
                            min="1"
                            max="200"
                            className="form-control"
                            placeholder="Ej. 35"
                            value={editFormData.cupoMaximo}
                            onChange={handleEditChange}
                            required
                        />
                    </div>

                    <h4 className="form-section-title">Horario de la Sección</h4>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="edit-diaSemana">Día de la Semana</label>
                            <select
                                id="edit-diaSemana"
                                name="diaSemana"
                                className="form-control"
                                value={editFormData.diaSemana}
                                onChange={handleEditChange}
                                required
                            >
                                <option value="" disabled>
                                    Seleccione un día
                                </option>
                                {DIAS_SEMANA.map((dia) => (
                                    <option key={dia.valor} value={dia.valor}>
                                        {dia.etiqueta}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="edit-aula">Aula</label>
                            <input
                                id="edit-aula"
                                name="aula"
                                type="text"
                                className="form-control"
                                placeholder="Ej. T1-101"
                                value={editFormData.aula}
                                onChange={handleEditChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="edit-horaInicio">Hora de Inicio</label>
                            <input
                                id="edit-horaInicio"
                                name="horaInicio"
                                type="time"
                                className="form-control"
                                value={editFormData.horaInicio}
                                onChange={handleEditChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="edit-horaFin">Hora de Fin</label>
                            <input
                                id="edit-horaFin"
                                name="horaFin"
                                type="time"
                                className="form-control"
                                value={editFormData.horaFin}
                                onChange={handleEditChange}
                                required
                            />
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
                            disabled={isUpdating || !esFormularioValido(editFormData)}
                        >
                            {isUpdating ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </DraggableWindow>
        </section>
    );
};

