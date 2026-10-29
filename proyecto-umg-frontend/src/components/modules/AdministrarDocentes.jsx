import { useState, useMemo } from 'react';
import { useDocenteQuery } from '../../query/docente/useDocenteQuery';
import { useDocenteMutation } from '../../query/docente/mutation/useDocenteMutation';
import { DraggableWindow } from '../draggable/DraggableWindow';
import './Module.css';

const INITIAL_FORM_STATE = {
    nombreDocente: '',
    apellidoDocente: '',
    especialidadDocente: '',
    telefonoDocente: '',
    correoDocente: ''
};

// Normaliza texto para búsqueda insensible a mayúsculas y acentos
const normalizar = (texto) =>
    (texto || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

export const AdministrarDocentes = () => {

    const { data: docentes = [], isLoading, isError, error } = useDocenteQuery();
    const { create, update, isCreating, isUpdating } = useDocenteMutation();

    // Filtro de búsqueda por nombre completo
    const [busqueda, setBusqueda] = useState('');

    // Estado para la ventana de creación
    const [isWindowOpen, setIsWindowOpen] = useState(false);
    const [formData, setFormData] = useState(INITIAL_FORM_STATE);

    // Estado para la ventana de ver completo / edición
    const [docenteAEditar, setDocenteAEditar] = useState(null);
    const [editFormData, setEditFormData] = useState(INITIAL_FORM_STATE);

    // El backend responde 404 cuando no hay docentes registrados
    const sinRegistros = error?.response?.status === 404;

    // Docentes filtrados en tiempo real por nombre completo
    const docentesFiltrados = useMemo(() => {
        const query = normalizar(busqueda.trim());
        if (!query) return docentes;
        return docentes.filter((d) => {
            const nombreCompleto = `${d.nombreDocente || ''} ${d.apellidoDocente || ''}`.trim();
            return normalizar(nombreCompleto).includes(query);
        });
    }, [docentes, busqueda]);

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
            nombreDocente: formData.nombreDocente.trim(),
            apellidoDocente: formData.apellidoDocente.trim(),
            especialidadDocente: formData.especialidadDocente.trim(),
            telefonoDocente: formData.telefonoDocente.trim(),
            correoDocente: formData.correoDocente.trim()
        };

        create(payload, {
            onSuccess: () => {
                setFormData(INITIAL_FORM_STATE);
                setIsWindowOpen(false);
            }
        });
    };

    /* ---- Lógica de Ver Completo / Edición ---- */
    const handleOpenEdit = (docente) => {
        setDocenteAEditar(docente);
        setEditFormData({
            nombreDocente: docente.nombreDocente || '',
            apellidoDocente: docente.apellidoDocente || '',
            especialidadDocente: docente.especialidadDocente || '',
            telefonoDocente: docente.telefonoDocente || '',
            correoDocente: docente.correoDocente || ''
        });
    };

    const handleCloseEdit = () => {
        if (!isUpdating) {
            setDocenteAEditar(null);
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
        if (!docenteAEditar) return;

        const payload = {
            idDocente: docenteAEditar.idDocente,
            nombreDocente: editFormData.nombreDocente.trim(),
            apellidoDocente: editFormData.apellidoDocente.trim(),
            especialidadDocente: editFormData.especialidadDocente.trim(),
            telefonoDocente: editFormData.telefonoDocente.trim(),
            correoDocente: editFormData.correoDocente.trim()
        };

        update(payload, {
            onSuccess: () => {
                setDocenteAEditar(null);
            }
        });
    };

    const renderBody = () => {
        if (isLoading) {
            return (
                <tr>
                    <td colSpan={5} className="table__message">Cargando docentes...</td>
                </tr>
            );
        }

        if (isError && !sinRegistros) {
            return (
                <tr>
                    <td colSpan={5} className="table__message table__message--error">
                        No se pudieron obtener los docentes.
                    </td>
                </tr>
            );
        }

        if (sinRegistros || docentes.length === 0) {
            return (
                <tr>
                    <td colSpan={5} className="table__message">No hay docentes registrados.</td>
                </tr>
            );
        }

        if (docentesFiltrados.length === 0) {
            return (
                <tr>
                    <td colSpan={5} className="table__message">
                        No se encontraron docentes que coincidan con &quot;{busqueda}&quot;.
                    </td>
                </tr>
            );
        }

        return docentesFiltrados.map((docente) => {
            const { idDocente, nombreDocente, apellidoDocente, especialidadDocente, telefonoDocente } = docente;
            const nombreCompleto = `${nombreDocente || ''} ${apellidoDocente || ''}`.trim();

            return (
                <tr key={idDocente}>
                    <td>{idDocente}</td>
                    <td>{nombreCompleto}</td>
                    <td>{especialidadDocente}</td>
                    <td>{telefonoDocente}</td>
                    <td className="table__cell--center">
                        <button
                            type="button"
                            className="btn-table-action btn-table-action--edit"
                            onClick={() => handleOpenEdit(docente)}
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
                <h2 className="module__title">Administrar Docentes</h2>
                <button
                    type="button"
                    className="btn-primary-green"
                    onClick={handleOpenWindow}
                >
                    Agregar Docente
                </button>
            </header>

            {/* Barra de búsqueda por nombre de docente */}
            <div className="module__toolbar">
                <div className="search-bar">
                    <span className="search-bar__icon" aria-hidden="true">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                    </span>
                    <input
                        id="busqueda-docente"
                        type="text"
                        className="search-bar__input"
                        placeholder="Buscar por nombre del docente..."
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
                <table className="table" id="tabla-docentes">
                    <thead>
                        <tr>
                            <th className="table__col--id">ID</th>
                            <th>Nombre completo</th>
                            <th>Especialidad</th>
                            <th>Teléfono</th>
                            <th className="table__col--actions table__cell--center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {renderBody()}
                    </tbody>
                </table>
            </div>

            {/* Ventana flotante: Agregar Docente */}
            <DraggableWindow
                isOpen={isWindowOpen}
                onClose={handleCloseWindow}
                title="Agregar Docente"
                width={480}
                height={540}
            >
                <form className="form-crud" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="nombreDocente">Nombre</label>
                        <input
                            id="nombreDocente"
                            name="nombreDocente"
                            type="text"
                            className="form-control"
                            placeholder="Ej. Carlos"
                            value={formData.nombreDocente}
                            onChange={handleChange}
                            required
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="apellidoDocente">Apellido</label>
                        <input
                            id="apellidoDocente"
                            name="apellidoDocente"
                            type="text"
                            className="form-control"
                            placeholder="Ej. Mendoza"
                            value={formData.apellidoDocente}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="especialidadDocente">Especialidad</label>
                        <input
                            id="especialidadDocente"
                            name="especialidadDocente"
                            type="text"
                            className="form-control"
                            placeholder="Ej. Bases de Datos"
                            value={formData.especialidadDocente}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="telefonoDocente">Teléfono</label>
                        <input
                            id="telefonoDocente"
                            name="telefonoDocente"
                            type="text"
                            className="form-control"
                            placeholder="Ej. 5555-1001"
                            value={formData.telefonoDocente}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="correoDocente">Correo Electrónico</label>
                        <input
                            id="correoDocente"
                            name="correoDocente"
                            type="email"
                            className="form-control"
                            placeholder="Ej. cmendoza@umg.edu.gt"
                            value={formData.correoDocente}
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
                            {isCreating ? 'Guardando...' : 'Guardar Docente'}
                        </button>
                    </div>
                </form>
            </DraggableWindow>

            {/* Ventana flotante: Ver Completo / Editar Docente */}
            <DraggableWindow
                isOpen={Boolean(docenteAEditar)}
                onClose={handleCloseEdit}
                title={`Información del Docente (ID: ${docenteAEditar?.idDocente ?? ''})`}
                width={480}
                height={540}
            >
                <form className="form-crud" onSubmit={handleEditSubmit}>
                    <div className="form-group">
                        <label htmlFor="edit-nombreDocente">Nombre</label>
                        <input
                            id="edit-nombreDocente"
                            name="nombreDocente"
                            type="text"
                            className="form-control"
                            placeholder="Ej. Carlos"
                            value={editFormData.nombreDocente}
                            onChange={handleEditChange}
                            required
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="edit-apellidoDocente">Apellido</label>
                        <input
                            id="edit-apellidoDocente"
                            name="apellidoDocente"
                            type="text"
                            className="form-control"
                            placeholder="Ej. Mendoza"
                            value={editFormData.apellidoDocente}
                            onChange={handleEditChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="edit-especialidadDocente">Especialidad</label>
                        <input
                            id="edit-especialidadDocente"
                            name="especialidadDocente"
                            type="text"
                            className="form-control"
                            placeholder="Ej. Bases de Datos"
                            value={editFormData.especialidadDocente}
                            onChange={handleEditChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="edit-telefonoDocente">Teléfono</label>
                        <input
                            id="edit-telefonoDocente"
                            name="telefonoDocente"
                            type="text"
                            className="form-control"
                            placeholder="Ej. 5555-1001"
                            value={editFormData.telefonoDocente}
                            onChange={handleEditChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="edit-correoDocente">Correo Electrónico</label>
                        <input
                            id="edit-correoDocente"
                            name="correoDocente"
                            type="email"
                            className="form-control"
                            placeholder="Ej. cmendoza@umg.edu.gt"
                            value={editFormData.correoDocente}
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
