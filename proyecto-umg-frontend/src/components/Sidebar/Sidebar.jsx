import logo from '../../img/logo.png';
import './Sidebar.css';

/**
 * Barra lateral de navegación.
 *
 * @param {Object}   props
 * @param {Array<{ id: string, label: string, icon?: React.ReactNode }>} props.options
 *        Opciones del menú (definidas en src/page/menuOptions.js).
 * @param {string}   props.activeOption  id de la opción seleccionada.
 * @param {Function} props.onSelect      Callback que recibe el id de la opción elegida.
 */
export const Sidebar = ({ options = [], activeOption, onSelect }) => {
    return (
        <aside className="sidebar">
            <div className="sidebar__brand">
                <img
                    src={logo}
                    alt="Logo Universidad Mariano Gálvez"
                    className="sidebar__logo"
                />
            </div>

            <nav className="sidebar__nav" aria-label="Menú principal">
                {options.length === 0 ? (
                    <p className="sidebar__empty">Sin opciones disponibles</p>
                ) : (
                    <ul className="sidebar__list">
                        {options.map(({ id, label, icon }) => (
                            <li key={id}>
                                <button
                                    id={`sidebar-option-${id}`}
                                    type="button"
                                    className={`sidebar__item ${activeOption === id ? 'sidebar__item--active' : ''}`}
                                    onClick={() => onSelect?.(id)}
                                >
                                    {icon && <span className="sidebar__icon">{icon}</span>}
                                    <span>{label}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </nav>
        </aside>
    );
};
