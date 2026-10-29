import { useState, useMemo } from 'react';
import { useCursoQuery } from '../../query/curso/useCursoQuery';
import { useCursoMutation } from '../../query/curso/mutation/useCursoMutation';
import { DraggableWindow } from '../draggable/DraggableWindow';
import './Module.css';

const INITIAL_FORM_STATE = {
    codigoCurso: '',
    nombreCurso: '',
    creditos: ''
};

// Normaliza texto para búsqueda insensible a mayúsculas y acentos
const normalizar = (texto) =>
    (texto || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

export const AdministrarCursos = () => {

    const { data: cursos = [], isLoading, isError, error } = useCursoQuery();
    const { create, update, isCreating, isUpdating } = useCursoMutation();

    // Filtro de búsqueda por nombre
    const [busqueda, setBusqueda] = useState('');

    // Estado para la ventana de creación
    const [isWindowOpen, setIsWindowOpen] = useState(false);
    const [formData, setFormData] = useState(INITIAL_FORM_STATE);

    // Estado para la ventana de edición
    const [cursoAEditar, setCursoAEditar] = useState(null);
    const [editFormData, setEditFormData] = useState({
        nombreCurso: '',
        creditos: ''
    });

    // El backend responde 404 cuando no hay cursos registrados
    const sinRegistros = error?.response?.status === 404;

    // Cursos filtrados en tiempo real por nombre
    const cursosFiltrados = useMemo(() => {
        const query = normalizar(busqueda.trim());
        if (!query) return cursos;
        return cursos.filter((c) => normalizar(c.nombreCurso).includes(query));
    }, [cursos, busqueda]);

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
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const payload = {
            codigoCurso: formData.codigoCurso.trim(),
            nombreCurso: formData.nombreCurso.trim(),
            creditos: parseInt(formData.creditos, 10)
        };

        create(payload, {
            onSuccess: () => {
                setFormData(INITIAL_FORM_STATE);
                setIsWindowOpen(false);
            }
        });
    };

    /* ---- Lógica de Edición ---- */
    const handleOpenEdit = (curso) => {
        setCursoAEditar(curso);
        setEditFormData({
            nombreCurso: curso.nombreCurso || '',
            creditos: curso.creditos ?? ''
        });
    };

    const handleCloseEdit = () => {
        if (!isUpdating) {
            setCursoAEditar(null);
        }
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        if (!cursoAEditar) return;

        const payload = {
            idCurso: cursoAEditar.idCurso,
            codigoCurso: cursoAEditar.codigoCurso,
            nombreCurso: editFormData.nombreCurso.trim(),
            creditos: parseInt(editFormData.creditos, 10)
        };

        update(payload, {
            onSuccess: () => {
                setCursoAEditar(null);
            }
        });
    };

    const renderBody = () => {
        if (isLoading) {
            return (
                <tr>
                    <td colSpan={5} className="table__message">Cargando cursos...</td>
                </tr>
            );
        }

        if (isError && !sinRegistros) {
            return (
                <tr>
                    <td colSpan={5} className="table__message table__message--error">
                        No se pudieron obtener los cursos.
                    </td>
                </tr>
            );
        }

        if (sinRegistros || cursos.length === 0) {
            return (
                <tr>
                    <td colSpan={5} className="table__message">No hay cursos registrados.</td>
                </tr>
            );
        }

        if (cursosFiltrados.length === 0) {
            return (
                <tr>
                    <td colSpan={5} className="table__message">
                        No se encontraron cursos que coincidan con &quot;{busqueda}&quot;.
                    </td>
                </tr>
            );
        }

        return cursosFiltrados.map((curso) => {
            const { idCurso, codigoCurso, nombreCurso, creditos } = curso;
            return (
                <tr key={idCurso}>
                    <td>{idCurso}</td>
                    <td>{codigoCurso}</td>
                    <td>{nombreCurso}</td>
                    <td className="table__cell--center">{creditos}</td>
                    <td className="table__cell--center">
                        <button
                            type="button"
                            className="btn-table-action btn-table-action--edit"
                            onClick={() => handleOpenEdit(curso)}
                        >
                            Editar
                        </button>
                    </td>
                </tr>
            );
        });
    };

    return (
        <section className="module">
            <header className="module__header">
                <h2 className="module__title">Administrar Cursos</h2>
                <button
                    type="button"
                    className="btn-primary-green"
                    onClick={handleOpenWindow}
                >
                    Agregar Curso
                </button>
            </header>

            {/* Barra de búsqueda por nombre de curso */}
            <div className="module__toolbar">
                <div className="search-bar">
                    <span className="search-bar__icon" aria-hidden="true">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                    </span>
                    <input
                        id="busqueda-curso"
                        type="text"
                        className="search-bar__input"
                        placeholder="Buscar por nombre del curso..."
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
                <table className="table" id="tabla-cursos">
                    <thead>
                        <tr>
                            <th className="table__col--id">ID</th>
                            <th>Código</th>
                            <th>Nombre del curso</th>
                            <th className="table__cell--center">Créditos</th>
                            <th className="table__col--actions table__cell--center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {renderBody()}
                    </tbody>
                </table>
            </div>

            {/* Ventana flotante: Agregar Curso */}
            <DraggableWindow
                isOpen={isWindowOpen}
                onClose={handleCloseWindow}
                title="Agregar Curso"
                width={460}
                height={390}
            >
                <form className="form-crud" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="codigoCurso">Código del Curso</label>
                        <input
                            id="codigoCurso"
                            name="codigoCurso"
                            type="text"
                            className="form-control"
                            placeholder="Ej. SIS-101"
                            value={formData.codigoCurso}
                            onChange={handleChange}
                            required
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="nombreCurso">Nombre del Curso</label>
                        <input
                            id="nombreCurso"
                            name="nombreCurso"
                            type="text"
                            className="form-control"
                            placeholder="Ej. Bases de Datos I"
                            value={formData.nombreCurso}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="creditos">Créditos</label>
                        <input
                            id="creditos"
                            name="creditos"
                            type="number"
                            min="1"
                            max="20"
                            className="form-control"
                            placeholder="Ej. 5"
                            value={formData.creditos}
                            onChange={handleChange}
                            required
                        />
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
                            disabled={isCreating}
                        >
                            {isCreating ? 'Guardando...' : 'Guardar Curso'}
                        </button>
                    </div>
                </form>
            </DraggableWindow>

            {/* Ventana flotante: Editar Curso */}
            <DraggableWindow
                isOpen={Boolean(cursoAEditar)}
                onClose={handleCloseEdit}
                title={`Editar Curso (${cursoAEditar?.codigoCurso || ''})`}
                width={460}
                height={340}
            >
                <form className="form-crud" onSubmit={handleEditSubmit}>
                    <div className="form-group">
                        <label htmlFor="edit-nombreCurso">Nombre del Curso</label>
                        <input
                            id="edit-nombreCurso"
                            name="nombreCurso"
                            type="text"
                            className="form-control"
                            placeholder="Ej. Bases de Datos I"
                            value={editFormData.nombreCurso}
                            onChange={handleEditChange}
                            required
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="edit-creditos">Créditos</label>
                        <input
                            id="edit-creditos"
                            name="creditos"
                            type="number"
                            min="1"
                            max="20"
                            className="form-control"
                            placeholder="Ej. 5"
                            value={editFormData.creditos}
                            onChange={handleEditChange}
                            required
                        />
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
                            disabled={isUpdating}
                        >
                            {isUpdating ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </DraggableWindow>
        </section>
    );
};
