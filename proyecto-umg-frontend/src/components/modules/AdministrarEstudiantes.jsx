import { useState, useMemo } from 'react';
import { useEstudianteQuery } from '../../query/estudiante/useEstudianteQuery';
import { useEstudianteMutation } from '../../query/estudiante/mutation/useEstudianteMutation';
import { useCarreraQuery } from '../../query/carrera/useCarreraQuery';
import { DraggableWindow } from '../draggable/DraggableWindow';
import './Module.css';

const DOMINIO_CORREO = '@alumnos.umg.edu.gt';

const INITIAL_FORM_STATE = {
    nombre: '',
    apellido: '',
    idCarrera: '',
    telefono: '',
    usuarioCorreo: ''
};

// Normaliza texto para búsqueda insensible a mayúsculas y acentos
const normalizar = (texto) =>
    (texto || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

// Formatea el teléfono a 0000-0000 (coloca '-' tras 4 dígitos y limita a 8 dígitos / 9 caracteres)
const formatearTelefono = (valor, valorAnterior = '') => {
    const digitos = (valor || '').replace(/\D/g, '').slice(0, 8);
    if (digitos.length > 4) {
        return `${digitos.slice(0, 4)}-${digitos.slice(4)}`;
    }
    if (digitos.length === 4 && valor.length > valorAnterior.length) {
        return `${digitos}-`;
    }
    return digitos;
};

// Valida que el teléfono tenga exactamente los 8 dígitos con formato 0000-0000
const esTelefonoValido = (telefono) => /^\d{4}-\d{4}$/.test((telefono || '').trim());

// Calcula el siguiente carnet con estructura 0900-26-000X incrementando en 1 el último registrado
const generarSiguienteCarnet = (listaEstudiantes = []) => {
    if (!listaEstudiantes.length) return '0900-26-0001';

    const maxCorrelativo = listaEstudiantes.reduce((max, est) => {
        const partes = String(est?.carnet || '').split('-');
        const ultimoNumero = parseInt(partes[partes.length - 1], 10);
        return !Number.isNaN(ultimoNumero) && ultimoNumero > max ? ultimoNumero : max;
    }, 0);

    const siguiente = String(maxCorrelativo + 1).padStart(4, '0');
    return `0900-26-${siguiente}`;
};

// Limpia el identificador de correo (solo lo que va antes del @, sin espacios ni @)
const sanitizarUsuarioCorreo = (valor = '') =>
    (valor || '').replace(/@.*/g, '').replace(/\s+/g, '');

// Extrae la parte antes del @ de un correo existente
const extraerUsuarioCorreo = (correo = '') => {
    const limpio = String(correo || '').trim();
    const indiceArroba = limpio.indexOf('@');
    return indiceArroba !== -1 ? limpio.slice(0, indiceArroba) : limpio;
};

// Verifica que exista al menos un carácter válido antes del @alumnos.umg.edu.gt
const esCorreoValido = (usuarioCorreo) => (usuarioCorreo || '').trim().length > 0;

export const AdministrarEstudiantes = () => {

    const { data: estudiantes = [], isLoading, isError, error } = useEstudianteQuery();
    const { data: carreras = [], isLoading: isLoadingCarreras } = useCarreraQuery();
    const { create, update, isCreating, isUpdating } = useEstudianteMutation();

    // Filtro de búsqueda por nombre completo
    const [busqueda, setBusqueda] = useState('');

    // Estado para la ventana de creación
    const [isWindowOpen, setIsWindowOpen] = useState(false);
    const [formData, setFormData] = useState(INITIAL_FORM_STATE);

    // Estado para la ventana de ver completo / edición
    const [estudianteAEditar, setEstudianteAEditar] = useState(null);
    const [editFormData, setEditFormData] = useState(INITIAL_FORM_STATE);

    // El backend responde 404 cuando no hay estudiantes registrados
    const sinRegistros = error?.response?.status === 404;

    // Carnet generado automáticamente para un nuevo estudiante
    const siguienteCarnet = useMemo(
        () => generarSiguienteCarnet(estudiantes),
        [estudiantes]
    );

    // Estudiantes filtrados en tiempo real por nombre completo
    const estudiantesFiltrados = useMemo(() => {
        const query = normalizar(busqueda.trim());
        if (!query) return estudiantes;
        return estudiantes.filter((est) => {
            const nombreCompleto = `${est.nombre || ''} ${est.apellido || ''}`.trim();
            return normalizar(nombreCompleto).includes(query);
        });
    }, [estudiantes, busqueda]);

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
        setFormData((prev) => {
            if (name === 'telefono') {
                return { ...prev, telefono: formatearTelefono(value, prev.telefono) };
            }
            if (name === 'usuarioCorreo') {
                return { ...prev, usuarioCorreo: sanitizarUsuarioCorreo(value) };
            }
            return { ...prev, [name]: value };
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (
            !esTelefonoValido(formData.telefono) ||
            !esCorreoValido(formData.usuarioCorreo) ||
            !formData.idCarrera
        ) {
            return;
        }

        const carreraSeleccionada =
            carreras.find((c) => Number(c.idCarrera) === Number(formData.idCarrera)) ||
            { idCarrera: Number(formData.idCarrera) };

        const payload = {
            carnet: siguienteCarnet,
            nombre: formData.nombre.trim(),
            apellido: formData.apellido.trim(),
            carrera: carreraSeleccionada,
            telefono: formData.telefono.trim(),
            correo: `${formData.usuarioCorreo.trim()}${DOMINIO_CORREO}`
        };

        create(payload, {
            onSuccess: () => {
                setFormData(INITIAL_FORM_STATE);
                setIsWindowOpen(false);
            }
        });
    };

    /* ---- Lógica de Ver Completo / Edición ---- */
    const handleOpenEdit = (estudiante) => {
        setEstudianteAEditar(estudiante);
        setEditFormData({
            nombre: estudiante.nombre || '',
            apellido: estudiante.apellido || '',
            idCarrera: estudiante.carrera?.idCarrera ?? '',
            telefono: formatearTelefono(estudiante.telefono || ''),
            usuarioCorreo: extraerUsuarioCorreo(estudiante.correo || '')
        });
    };

    const handleCloseEdit = () => {
        if (!isUpdating) {
            setEstudianteAEditar(null);
        }
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditFormData((prev) => {
            if (name === 'telefono') {
                return { ...prev, telefono: formatearTelefono(value, prev.telefono) };
            }
            if (name === 'usuarioCorreo') {
                return { ...prev, usuarioCorreo: sanitizarUsuarioCorreo(value) };
            }
            return { ...prev, [name]: value };
        });
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        if (
            !estudianteAEditar ||
            !esTelefonoValido(editFormData.telefono) ||
            !esCorreoValido(editFormData.usuarioCorreo) ||
            !editFormData.idCarrera
        ) {
            return;
        }

        const carreraSeleccionada =
            carreras.find((c) => Number(c.idCarrera) === Number(editFormData.idCarrera)) ||
            estudianteAEditar.carrera ||
            { idCarrera: Number(editFormData.idCarrera) };

        const payload = {
            idEstudiante: estudianteAEditar.idEstudiante,
            carnet: estudianteAEditar.carnet,
            nombre: editFormData.nombre.trim(),
            apellido: editFormData.apellido.trim(),
            carrera: carreraSeleccionada,
            telefono: editFormData.telefono.trim(),
            correo: `${editFormData.usuarioCorreo.trim()}${DOMINIO_CORREO}`
        };

        update(payload, {
            onSuccess: () => {
                setEstudianteAEditar(null);
            }
        });
    };

    const renderBody = () => {
        if (isLoading) {
            return (
                <tr>
                    <td colSpan={5} className="table__message">Cargando estudiantes...</td>
                </tr>
            );
        }

        if (isError && !sinRegistros) {
            return (
                <tr>
                    <td colSpan={5} className="table__message table__message--error">
                        No se pudieron obtener los estudiantes.
                    </td>
                </tr>
            );
        }

        if (sinRegistros || estudiantes.length === 0) {
            return (
                <tr>
                    <td colSpan={5} className="table__message">No hay estudiantes registrados.</td>
                </tr>
            );
        }

        if (estudiantesFiltrados.length === 0) {
            return (
                <tr>
                    <td colSpan={5} className="table__message">
                        No se encontraron estudiantes que coincidan con &quot;{busqueda}&quot;.
                    </td>
                </tr>
            );
        }

        return estudiantesFiltrados.map((estudiante) => {
            const { idEstudiante, nombre, apellido, carrera, correo } = estudiante;
            const nombreCompleto = `${nombre || ''} ${apellido || ''}`.trim();

            return (
                <tr key={idEstudiante}>
                    <td>{idEstudiante}</td>
                    <td>{nombreCompleto}</td>
                    <td>{carrera?.nombreCarrera || 'Sin asignar'}</td>
                    <td>{correo}</td>
                    <td className="table__cell--center">
                        <button
                            type="button"
                            className="btn-table-action btn-table-action--edit"
                            onClick={() => handleOpenEdit(estudiante)}
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
                <h2 className="module__title">Administrar Estudiantes</h2>
                <button
                    type="button"
                    className="btn-primary-green"
                    onClick={handleOpenWindow}
                >
                    Agregar Estudiante
                </button>
            </header>

            {/* Barra de búsqueda por nombre de estudiante */}
            <div className="module__toolbar">
                <div className="search-bar">
                    <span className="search-bar__icon" aria-hidden="true">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                    </span>
                    <input
                        id="busqueda-estudiante"
                        type="text"
                        className="search-bar__input"
                        placeholder="Buscar por nombre del estudiante..."
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
                <table className="table" id="tabla-estudiantes">
                    <thead>
                        <tr>
                            <th className="table__col--id">ID</th>
                            <th>Nombre completo</th>
                            <th>Carrera</th>
                            <th>Correo electrónico</th>
                            <th className="table__col--actions table__cell--center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {renderBody()}
                    </tbody>
                </table>
            </div>

            {/* Ventana flotante: Agregar Estudiante */}
            <DraggableWindow
                isOpen={isWindowOpen}
                onClose={handleCloseWindow}
                title="Agregar Estudiante"
                width={500}
                height={620}
            >
                <form className="form-crud" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="carnet">Carnet (Asignado automáticamente)</label>
                        <input
                            id="carnet"
                            name="carnet"
                            type="text"
                            className="form-control"
                            value={siguienteCarnet}
                            readOnly
                            disabled
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="nombre">Nombre</label>
                        <input
                            id="nombre"
                            name="nombre"
                            type="text"
                            className="form-control"
                            placeholder="Ej. Pedro"
                            value={formData.nombre}
                            onChange={handleChange}
                            required
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="apellido">Apellido</label>
                        <input
                            id="apellido"
                            name="apellido"
                            type="text"
                            className="form-control"
                            placeholder="Ej. Alvarado"
                            value={formData.apellido}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="idCarrera">Carrera</label>
                        <select
                            id="idCarrera"
                            name="idCarrera"
                            className="form-control"
                            value={formData.idCarrera}
                            onChange={handleChange}
                            required
                        >
                            <option value="" disabled>
                                {isLoadingCarreras ? 'Cargando carreras...' : 'Seleccione una carrera'}
                            </option>
                            {carreras.map((carrera) => (
                                <option key={carrera.idCarrera} value={carrera.idCarrera}>
                                    {carrera.codigoCarrera
                                        ? `${carrera.codigoCarrera} - ${carrera.nombreCarrera}`
                                        : carrera.nombreCarrera}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="telefono">Teléfono</label>
                        <input
                            id="telefono"
                            name="telefono"
                            type="text"
                            inputMode="numeric"
                            maxLength={9}
                            minLength={9}
                            pattern="\d{4}-\d{4}"
                            title="El teléfono debe contener 8 dígitos (formato 0000-0000)"
                            className="form-control"
                            placeholder="Ej. 4444-2001"
                            value={formData.telefono}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="usuarioCorreo">Correo Electrónico</label>
                        <div className="input-email-group">
                            <input
                                id="usuarioCorreo"
                                name="usuarioCorreo"
                                type="text"
                                className="input-email-group__input"
                                placeholder="Ej. palvarado"
                                value={formData.usuarioCorreo}
                                onChange={handleChange}
                                required
                            />
                            <span className="input-email-group__domain">{DOMINIO_CORREO}</span>
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
                            disabled={
                                isCreating ||
                                !esTelefonoValido(formData.telefono) ||
                                !esCorreoValido(formData.usuarioCorreo) ||
                                !formData.idCarrera
                            }
                        >
                            {isCreating ? 'Guardando...' : 'Guardar Estudiante'}
                        </button>
                    </div>
                </form>
            </DraggableWindow>

            {/* Ventana flotante: Ver Completo / Editar Estudiante */}
            <DraggableWindow
                isOpen={Boolean(estudianteAEditar)}
                onClose={handleCloseEdit}
                title={`Información del Estudiante (ID: ${estudianteAEditar?.idEstudiante ?? ''})`}
                width={500}
                height={620}
            >
                <form className="form-crud" onSubmit={handleEditSubmit}>
                    <div className="form-group">
                        <label htmlFor="edit-carnet">Carnet</label>
                        <input
                            id="edit-carnet"
                            name="carnet"
                            type="text"
                            className="form-control"
                            value={estudianteAEditar?.carnet || ''}
                            readOnly
                            disabled
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="edit-nombre">Nombre</label>
                        <input
                            id="edit-nombre"
                            name="nombre"
                            type="text"
                            className="form-control"
                            placeholder="Ej. Pedro"
                            value={editFormData.nombre}
                            onChange={handleEditChange}
                            required
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="edit-apellido">Apellido</label>
                        <input
                            id="edit-apellido"
                            name="apellido"
                            type="text"
                            className="form-control"
                            placeholder="Ej. Alvarado"
                            value={editFormData.apellido}
                            onChange={handleEditChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="edit-idCarrera">Carrera</label>
                        <select
                            id="edit-idCarrera"
                            name="idCarrera"
                            className="form-control"
                            value={editFormData.idCarrera}
                            onChange={handleEditChange}
                            required
                        >
                            <option value="" disabled>
                                {isLoadingCarreras ? 'Cargando carreras...' : 'Seleccione una carrera'}
                            </option>
                            {carreras.map((carrera) => (
                                <option key={carrera.idCarrera} value={carrera.idCarrera}>
                                    {carrera.codigoCarrera
                                        ? `${carrera.codigoCarrera} - ${carrera.nombreCarrera}`
                                        : carrera.nombreCarrera}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="edit-telefono">Teléfono</label>
                        <input
                            id="edit-telefono"
                            name="telefono"
                            type="text"
                            inputMode="numeric"
                            maxLength={9}
                            minLength={9}
                            pattern="\d{4}-\d{4}"
                            title="El teléfono debe contener 8 dígitos (formato 0000-0000)"
                            className="form-control"
                            placeholder="Ej. 4444-2001"
                            value={editFormData.telefono}
                            onChange={handleEditChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="edit-usuarioCorreo">Correo Electrónico</label>
                        <div className="input-email-group">
                            <input
                                id="edit-usuarioCorreo"
                                name="usuarioCorreo"
                                type="text"
                                className="input-email-group__input"
                                placeholder="Ej. palvarado"
                                value={editFormData.usuarioCorreo}
                                onChange={handleEditChange}
                                required
                            />
                            <span className="input-email-group__domain">{DOMINIO_CORREO}</span>
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
                            disabled={
                                isUpdating ||
                                !esTelefonoValido(editFormData.telefono) ||
                                !esCorreoValido(editFormData.usuarioCorreo) ||
                                !editFormData.idCarrera
                            }
                        >
                            {isUpdating ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </DraggableWindow>
        </section>
    );
};
