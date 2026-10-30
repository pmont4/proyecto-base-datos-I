import { useState, useMemo } from 'react';
import { useCarreraQuery } from '../../query/carrera/useCarreraQuery';
import { useCarreraMutation } from '../../query/carrera/mutation/useCarreraMutation';
import { DraggableWindow } from '../draggable/DraggableWindow';
import './Module.css';

// Mapa de traducción: Enum de Java (Backend) -> Texto legible (Frontend)
const FACULTADES_MAP = {
    FACULTAD_INGENIERIA: 'Facultad de Ingenieria',
    FACULTAD_ARQUITECTURA: 'Facultad de Arquitectura',
    FACULTAD_DERECHO: 'Facultad de Ciencias Sociales',
    FACULTAD_CIENCIAS_MEDICAS: 'Facultad de Ciencias Medicas'
};

// Prefijos de código de carrera según la facultad (ING-01, ARQ-01, DER-01, MED-01)
const PREFIJOS_FACULTAD = {
    FACULTAD_INGENIERIA: 'ING',
    FACULTAD_ARQUITECTURA: 'ARQ',
    FACULTAD_DERECHO: 'DER',
    FACULTAD_CIENCIAS_MEDICAS: 'MED'
};

// Mapa inverso: Texto legible (Frontend) -> Enum de Java (Backend)
const FACULTADES_INVERSO_MAP = Object.fromEntries(
    Object.entries(FACULTADES_MAP).map(([enumKey, label]) => [label, enumKey])
);

const OPCIONES_FACULTAD = Object.entries(FACULTADES_MAP).map(([enumKey, label]) => ({
    enumKey,
    label
}));

// Traduce del Enum de Java al nombre legible para mostrar en la tabla
const traducirFacultad = (facultadEnum) =>
    FACULTADES_MAP[facultadEnum] || facultadEnum || '';

// Convierte el valor seleccionado (nombre legible o enum) al Enum de Java para enviar al backend
const aEnumFacultad = (valor) => {
    if (FACULTADES_MAP[valor]) return valor;
    return FACULTADES_INVERSO_MAP[valor] || valor;
};

// Genera automáticamente el siguiente código de carrera (ej. ING-02 -> ING-03)
const generarSiguienteCodigoCarrera = (listaCarreras = [], facultadEnum = 'FACULTAD_INGENIERIA') => {
    const enumClave = aEnumFacultad(facultadEnum) || 'FACULTAD_INGENIERIA';
    const prefijo = PREFIJOS_FACULTAD[enumClave] || 'ING';

    const maxCorrelativo = listaCarreras.reduce((max, c) => {
        const codigo = String(c?.codigoCarrera || '').trim().toUpperCase();
        if (!codigo.startsWith(`${prefijo}-`)) return max;

        const partes = codigo.split('-');
        const ultimoNumero = parseInt(partes[partes.length - 1], 10);
        return !Number.isNaN(ultimoNumero) && ultimoNumero > max ? ultimoNumero : max;
    }, 0);

    const siguiente = String(maxCorrelativo + 1).padStart(2, '0');
    return `${prefijo}-${siguiente}`;
};

const INITIAL_FORM_STATE = {
    nombreCarrera: '',
    facultad: 'FACULTAD_INGENIERIA'
};

// Normaliza texto para búsqueda insensible a mayúsculas y acentos
const normalizar = (texto) =>
    (texto || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

export const AdministrarCarreras = () => {

    const { data: carreras = [], isLoading, isError, error } = useCarreraQuery();
    const { create, update, isCreating, isUpdating } = useCarreraMutation();

    // Filtro de búsqueda por nombre de carrera
    const [busqueda, setBusqueda] = useState('');

    // Estado para la ventana de creación
    const [isWindowOpen, setIsWindowOpen] = useState(false);
    const [formData, setFormData] = useState(INITIAL_FORM_STATE);

    // Estado para la ventana de edición
    const [carreraAEditar, setCarreraAEditar] = useState(null);
    const [editFormData, setEditFormData] = useState(INITIAL_FORM_STATE);

    // El backend responde 404 cuando no hay carreras registradas
    const sinRegistros = error?.response?.status === 404;

    // Código generado automáticamente según la facultad seleccionada y las carreras existentes
    const siguienteCodigoCarrera = useMemo(
        () => generarSiguienteCodigoCarrera(carreras, formData.facultad),
        [carreras, formData.facultad]
    );

    // Carreras filtradas en tiempo real por nombre
    const carrerasFiltradas = useMemo(() => {
        const query = normalizar(busqueda.trim());
        if (!query) return carreras;
        return carreras.filter((c) => normalizar(c.nombreCarrera).includes(query));
    }, [carreras, busqueda]);

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
        if (!formData.facultad) return;

        const payload = {
            codigoCarrera: siguienteCodigoCarrera,
            nombreCarrera: formData.nombreCarrera.trim(),
            facultad: aEnumFacultad(formData.facultad)
        };

        create(payload, {
            onSuccess: () => {
                setFormData(INITIAL_FORM_STATE);
                setIsWindowOpen(false);
            }
        });
    };

    /* ---- Lógica de Edición ---- */
    const handleOpenEdit = (carrera) => {
        setCarreraAEditar(carrera);
        setEditFormData({
            nombreCarrera: carrera.nombreCarrera || '',
            facultad: aEnumFacultad(carrera.facultad || 'FACULTAD_INGENIERIA')
        });
    };

    const handleCloseEdit = () => {
        if (!isUpdating) {
            setCarreraAEditar(null);
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
        if (!carreraAEditar || !editFormData.facultad) return;

        const payload = {
            idCarrera: carreraAEditar.idCarrera,
            codigoCarrera: carreraAEditar.codigoCarrera,
            nombreCarrera: editFormData.nombreCarrera.trim(),
            facultad: aEnumFacultad(editFormData.facultad)
        };

        update(payload, {
            onSuccess: () => {
                setCarreraAEditar(null);
            }
        });
    };

    const renderBody = () => {
        if (isLoading) {
            return (
                <tr>
                    <td colSpan={5} className="table__message">Cargando carreras...</td>
                </tr>
            );
        }

        if (isError && !sinRegistros) {
            return (
                <tr>
                    <td colSpan={5} className="table__message table__message--error">
                        No se pudieron obtener las carreras.
                    </td>
                </tr>
            );
        }

        if (sinRegistros || carreras.length === 0) {
            return (
                <tr>
                    <td colSpan={5} className="table__message">No hay carreras registradas.</td>
                </tr>
            );
        }

        if (carrerasFiltradas.length === 0) {
            return (
                <tr>
                    <td colSpan={5} className="table__message">
                        No se encontraron carreras que coincidan con &quot;{busqueda}&quot;.
                    </td>
                </tr>
            );
        }

        return carrerasFiltradas.map((carrera) => {
            const { idCarrera, codigoCarrera, nombreCarrera, facultad } = carrera;
            return (
                <tr key={idCarrera}>
                    <td>{idCarrera}</td>
                    <td>{codigoCarrera}</td>
                    <td>{nombreCarrera}</td>
                    <td>{traducirFacultad(facultad)}</td>
                    <td className="table__cell--center">
                        <button
                            type="button"
                            className="btn-table-action btn-table-action--edit"
                            onClick={() => handleOpenEdit(carrera)}
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
                <h2 className="module__title">Administrar Carreras</h2>
                <button
                    type="button"
                    className="btn-primary-green"
                    onClick={handleOpenWindow}
                >
                    Agregar Carrera
                </button>
            </header>

            {/* Barra de búsqueda por nombre de carrera */}
            <div className="module__toolbar">
                <div className="search-bar">
                    <span className="search-bar__icon" aria-hidden="true">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                    </span>
                    <input
                        id="busqueda-carrera"
                        type="text"
                        className="search-bar__input"
                        placeholder="Buscar por nombre de la carrera..."
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
                <table className="table" id="tabla-carreras">
                    <thead>
                        <tr>
                            <th className="table__col--id">ID</th>
                            <th>Código</th>
                            <th>Nombre de la carrera</th>
                            <th>Facultad</th>
                            <th className="table__col--actions table__cell--center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {renderBody()}
                    </tbody>
                </table>
            </div>

            {/* Ventana flotante: Agregar Carrera */}
            <DraggableWindow
                isOpen={isWindowOpen}
                onClose={handleCloseWindow}
                title="Agregar Carrera"
                width={460}
                height={390}
            >
                <form className="form-crud" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="codigoCarrera">Código de la Carrera (Asignado automáticamente)</label>
                        <input
                            id="codigoCarrera"
                            name="codigoCarrera"
                            type="text"
                            className="form-control"
                            value={siguienteCodigoCarrera}
                            readOnly
                            disabled
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="nombreCarrera">Nombre de la Carrera</label>
                        <input
                            id="nombreCarrera"
                            name="nombreCarrera"
                            type="text"
                            className="form-control"
                            placeholder="Ej. Ingeniería en Sistemas"
                            value={formData.nombreCarrera}
                            onChange={handleChange}
                            required
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="facultad">Facultad</label>
                        <select
                            id="facultad"
                            name="facultad"
                            className="form-control"
                            value={formData.facultad}
                            onChange={handleChange}
                            required
                        >
                            {OPCIONES_FACULTAD.map(({ enumKey, label }) => (
                                <option key={enumKey} value={enumKey}>
                                    {label}
                                </option>
                            ))}
                        </select>
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
                            disabled={isCreating || !formData.facultad}
                        >
                            {isCreating ? 'Guardando...' : 'Guardar Carrera'}
                        </button>
                    </div>
                </form>
            </DraggableWindow>

            {/* Ventana flotante: Editar Carrera */}
            <DraggableWindow
                isOpen={Boolean(carreraAEditar)}
                onClose={handleCloseEdit}
                title={`Editar Carrera (${carreraAEditar?.codigoCarrera || ''})`}
                width={460}
                height={390}
            >
                <form className="form-crud" onSubmit={handleEditSubmit}>
                    <div className="form-group">
                        <label htmlFor="edit-codigoCarrera">Código de la Carrera</label>
                        <input
                            id="edit-codigoCarrera"
                            name="codigoCarrera"
                            type="text"
                            className="form-control"
                            value={carreraAEditar?.codigoCarrera || ''}
                            readOnly
                            disabled
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="edit-nombreCarrera">Nombre de la Carrera</label>
                        <input
                            id="edit-nombreCarrera"
                            name="nombreCarrera"
                            type="text"
                            className="form-control"
                            placeholder="Ej. Ingeniería en Sistemas"
                            value={editFormData.nombreCarrera}
                            onChange={handleEditChange}
                            required
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="edit-facultad">Facultad</label>
                        <select
                            id="edit-facultad"
                            name="facultad"
                            className="form-control"
                            value={editFormData.facultad}
                            onChange={handleEditChange}
                            required
                        >
                            <option value="" disabled>
                                Seleccione una facultad
                            </option>
                            {OPCIONES_FACULTAD.map(({ enumKey, label }) => (
                                <option key={enumKey} value={enumKey}>
                                    {label}
                                </option>
                            ))}
                        </select>
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
                            disabled={isUpdating || !editFormData.facultad}
                        >
                            {isUpdating ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </DraggableWindow>
        </section>
    );
};


