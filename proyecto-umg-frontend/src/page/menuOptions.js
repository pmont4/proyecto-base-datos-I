import { AdministrarCarreras } from '../components/modules/AdministrarCarreras';
import { AdministrarCursos } from '../components/modules/AdministrarCursos';
import { AdministrarDocentes } from '../components/modules/AdministrarDocentes';
import { AdministrarEstudiantes } from '../components/modules/AdministrarEstudiantes';
import { AdministrarMatriculas } from '../components/modules/AdministrarMatriculas';
import { AdministrarSecciones } from '../components/modules/AdministrarSecciones';

/**
 * Opciones del menú lateral.
 * Cada opción tiene un id único, el texto que se muestra en la barra
 * y el componente que se despliega en el contenedor al seleccionarla.
 */
export const MENU_OPTIONS = [
    { id: 'cursos', label: 'Administrar Cursos', component: AdministrarCursos },
    { id: 'docentes', label: 'Administrar Docentes', component: AdministrarDocentes },
    { id: 'estudiantes', label: 'Administrar Estudiantes', component: AdministrarEstudiantes },
    { id: 'matriculas', label: 'Administrar Matrículas', component: AdministrarMatriculas },
    { id: 'secciones', label: 'Administrar Secciones', component: AdministrarSecciones },
    { id: 'carreras', label: 'Administrar Carreras', component: AdministrarCarreras },
];
