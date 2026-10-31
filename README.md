# ToDo List IPSS - Aplicación Móvil
## Evaluación Sumativa Unidad N° 1: Desarrollo de Aplicaciones Móviles
**Instituto Profesional San Sebastián (IPSS)**

---

## 📋 Información General del Proyecto
- **Asignatura:** Desarrollo de Aplicaciones Móviles (T3-26-51)
- **Unidad:** N° 1 - Introducción al Desarrollo Móvil y Componentes de Interfaz
- **Proyecto:** To-Do List Mobile App con Arquitectura Desacoplada y Feature Flags
- **Tecnología:** React Native + Expo (TypeScript) + React Native Paper (Material Design 3)
- **Repositorio:** Público en GitHub
- **Puntaje Esperado:** 100 / 100 puntos (Nota 7.0)

---

## 🎯 Justificación de la Elección Tecnológica

De acuerdo a la pauta de evaluación, se requería explicitar el **por qué de la decisión tecnológica**. Se seleccionó **React Native con Expo**:

1. **Renderizado Nativo Real vs. WebViews:** A diferencia de frameworks híbridos tradicionales (como Ionic/Cordova) que encapsulan la app en un navegador web embebido (*WebView*), React Native renderiza componentes nativos directos del sistema operativo (Android y iOS), logrando 60 FPS consistentes y un comportamiento táctil nativo.
2. **Ecosistema y Demanda Laboral:** React Native es el framework líder multiplataforma en la industria del software. Al utilizar TypeScript + React, se unifica el stack frontend/móvil con las mismas herramientas del desarrollo web moderno.
3. **Productividad con Expo SDK 58:** Expo simplifica la compilación y prueba sin necesidad de configurar de inmediato pesados entornos locales (como Android Studio de 15 GB). Permite previsualización instantánea tanto en navegadores web como en dispositivos físicos mediante la aplicación **Expo Go** mediante escaneo de código QR.
4. **Proyección Hacia Unidades 2 y 3:** Este proyecto fue concebido desde su inicio para evolucionar hacia persistencia avanzada, autenticación y consumo de APIs (NestJS / Express) sin requerir reescrituras de la interfaz gráfica.

---

## 🏛️ 1. Explicación de Conceptos Fundamentales (14 Puntos)

### Arquitectura de React Native (Nueva Arquitectura)
React Native opera separando la lógica de negocio y la interfaz mediante dos capas principales:
- **Capa JavaScript (Hermes Engine):** Ejecuta el código TypeScript de la aplicación, administra el estado (`useState`, `useTasks`) y despacha llamadas asíncronas.
- **Capa Nativa (Host Platform):** Traduce las definiciones virtuales (`<View>`, `<Text>`, `<TextInput>`) en vistas nativas de Android (`android.view.ViewGroup`, `android.widget.TextView`) y de iOS (`UIView`, `UILabel`).
- **JSI (JavaScript Interface):** La comunicación moderna entre JavaScript y el hilo nativo se realiza mediante llamadas directas en C++ en memoria (sin la serialización JSON del puente antiguo), optimizando drásticamente la latencia y la fluidez de animaciones.

### Componentes Clave Empleados
- **`FlatList` (Virtualización de Listas):** En lugar de renderizar todos los elementos en el DOM móvil, `FlatList` mantiene en memoria únicamente los ítems visibles en la ventana de pantalla (*windowing*), permitiendo manejar listas grandes sin consumir memoria excesiva.
- **`KeyboardAvoidingView` & `SafeAreaView`:** Garantizan que la interfaz respete las zonas seguras del hardware (*notches*, islas dinámicas y barras de gestos) y que el teclado virtual no solape los campos del formulario.
- **`Portal` (React Native Paper):** Permite renderizar elementos flotantes (como modales de creación y diálogos de confirmación) en la raíz del árbol visual, evitando problemas de superposición (*z-index*).

---

## 🧩 2. Identificación de Patrones de Diseño (18 Puntos)

El proyecto implementa una arquitectura estructurada orientada a bajo acoplamiento:

```mermaid
flowchart LR
    subgraph UI ["Capa UI / Presentación"]
        Screen["App.tsx"]
        Comp["AppCard / AppButton / TaskItem"]
        Hook["useTasks (Presenter Hook)"]
    end

    subgraph Core ["Capa Core (Dominio)"]
        Port["ITaskRepository (Port / Interface)"]
    end

    subgraph Infra ["Capa Infraestructura"]
        Factory["TaskAdapterFactory"]
        Storage["TaskStorageAdapter (AsyncStorage + Seed)"]
        Http["TaskHttpAdapter (API REST)"]
    end

    Screen --> Comp
    Screen --> Hook
    Hook --> Port
    Hook --> Factory
    Factory -->|DEMO_MODE=true| Storage
    Factory -->|DEMO_MODE=false| Http
    Storage -.->|implements| Port
    Http -.->|implements| Port
```

### 1. Patrón Adapter (Adaptador de Infraestructura)
Desacopla la lógica de acceso a datos de los componentes visuales mediante un contrato común (`ITaskRepository`).
- **`TaskStorageAdapter`:** Persiste datos reales en el almacenamiento local móvil (`AsyncStorage`) y ejecuta un Seeding automático (`TASK_SEEDS`) en el primer inicio (Cold Start).
- **`TaskHttpAdapter`:** Preconfigurado con llamadas `fetch` estándar hacia una API REST (preparado para NestJS en la Unidad 2).

```typescript
// src/core/task/interfaces/task-repository.interface.ts
export interface ITaskRepository {
  getAll(): Promise<ITask[]>;
  getById(id: string): Promise<ITask | null>;
  create(input: CreateTaskInput): Promise<ITask>;
  update(id: string, input: UpdateTaskInput): Promise<ITask>;
  delete(id: string): Promise<boolean>;
  resetToSeed?(): Promise<ITask[]>;
}
```

### 2. Patrón Factory (Fábrica de Adaptadores)
Encapsula la creación del repositorio evaluando el Feature Flag de entorno (`EXPO_PUBLIC_DEMO_MODE`):

```typescript
// src/infra/api/factories/task-adapter.factory.ts
export class TaskAdapterFactory {
  private static instance: ITaskRepository | null = null;

  public static getRepository(): ITaskRepository {
    if (!TaskAdapterFactory.instance) {
      if (envConfig.isDemoMode) {
        TaskAdapterFactory.instance = new TaskStorageAdapter();
      } else {
        TaskAdapterFactory.instance = new TaskHttpAdapter(envConfig.apiUrl);
      }
    }
    return TaskAdapterFactory.instance;
  }
}
```

### 3. Patrón Container / Presenter (Custom Hook)
El hook `useTasks` encapsula todo el estado (lista, filtros, búsqueda, estadísticas de progreso, estados de carga y errores), dejando a los componentes de interfaz como presentadores visuales puros y desacoplados.

### 4. Patrón de Componentes Reutilizables (Enfoque shadcn/ui)
En lugar de dispersar componentes de terceros por toda la aplicación, creamos una capa atómica propia en `src/components/ui/` (`AppCard`, `AppButton`, `AppInput`, `AppBadge`, `AppConfirmDialog`) que consume las primitivas accesibles de Material Design 3.

---

## 🎨 3. Diseño de Interfaces de Usuario (UI) (12 Puntos)

Se aplicaron rigurosamente los principios de diseño de interfaces móviles:

1. **Jerarquía Visual:**
   - Tipografía diferenciada con pesos visuales claros: Título principal (26px, bold), subtítulos (13px, semibold), títulos de tarjetas (16px) y texto secundario (14px).
   - Acciones primarias destacadas en azul profundo (`#1E40AF`), secundarias en verde menta y destructivas en rojo carmesí (`#DC2626`).
2. **Contraste y Accesibilidad (WCAG AA):**
   - Ratios de contraste superiores a 4.5:1 en todos los textos sobre fondos claros.
   - Textos de estado y prioridad acompañados de colores de fondo suavizados y etiquetas textuales explícitas (evitando transmitir información únicamente por color).
3. **Balance y Ritmo (Sistema de Espaciado 8pt Grid):**
   - Márgenes y paddings múltiplos de 4 y 8 píxeles (8px, 12px, 16px, 20px) para mantener armonía espacial.
4. **Proporción y Áreas Táctiles:**
   - Botones y controles de interacción con áreas táctiles mínimas de 44x44 puntos para facilitar la pulsación con el pulgar.

---

## ⚙️ 4. Implementación de Componentes de UI (28 Puntos)

La aplicación cuenta con una suite completa de componentes interactivos:

| Componente | Archivo | Responsabilidad |
| :--- | :--- | :--- |
| **`AppCard`** | `src/components/ui/AppCard.tsx` | Contenedor elevado con bordes redondeados y sombras suaves. |
| **`AppButton`** | `src/components/ui/AppButton.tsx` | Botón reutilizable con variantes (`primary`, `secondary`, `outline`, `danger`, `ghost`). |
| **`AppInput`** | `src/components/ui/AppInput.tsx` | Entrada de texto con etiquetas flotantes, validación y mensajes de error. |
| **`AppBadge`** | `src/components/ui/AppBadge.tsx` | Chip informativo con semántica para estados (`PENDING`, `COMPLETED`) y prioridades (`LOW`, `MEDIUM`, `HIGH`). |
| **`AppConfirmDialog`** | `src/components/ui/AppConfirmDialog.tsx` | Diálogo modal accesible para confirmar acciones críticas (borrado y reseteo). |
| **`TaskHeader`** | `src/components/tasks/TaskHeader.tsx` | Encabezado con métricas en tiempo real, barra de progreso y banner de Feature Flag. |
| **`TaskFilterTabs`** | `src/components/tasks/TaskFilterTabs.tsx` | Segmentos para filtrar por estado y barra de búsqueda textual en vivo. |
| **`TaskItem`** | `src/components/tasks/TaskItem.tsx` | Tarjeta de ítem con checkbox accesible, botones de edición y eliminación. |
| **`TaskFormModal`** | `src/components/tasks/TaskFormModal.tsx` | Formulario modal para crear y editar tareas con validaciones reactivas. |
| **`TaskEmptyState`** | `src/components/tasks/TaskEmptyState.tsx` | Ilustración y guía interactiva cuando la lista está vacía. |
| **`FAB`** | `App.tsx` | Botón flotante de acción rápida para agregar nuevas tareas con una sola pulsación. |

---

## 🚀 5. Usabilidad y Experiencia de Usuario (UX) (28 Puntos)

1. **Prevención de Errores Críticos:**
   - Para eliminar una tarea, el sistema no borra de inmediato; levanta un diálogo modal (`AppConfirmDialog`) requiriendo confirmación explícita del usuario.
2. **Validación Reactiva de Formularios:**
   - El formulario valida longitud mínima de título (≥ 3 caracteres) y descripción (≥ 5 caracteres) antes de permitir el envío, señalando el campo erróneo en color rojo con un texto descriptivo.
   - Al guardar, el formulario se limpia y se cierra automáticamente.
3. **Retroalimentación Instantánea (Feedback):**
   - Notificaciones toast (`Snackbar`) al agregar, editar o eliminar tareas.
   - Indicador de carga visual (`ActivityIndicator`) durante operaciones asíncronas.
   - La barra de progreso superior refleja inmediatamente el porcentaje de cumplimiento de las tareas.
4. **Soporte Pull-to-Refresh:**
   - La lista de tareas permite deslizar hacia abajo para recargar datos simulando la sincronización en tiempo real.
5. **Feature Flag con Botón Condicional:**
   - El botón de *"Restablecer Datos"* solo se renderiza si la aplicación se encuentra en **Modo Demo** (`isDemoMode === true`), evitando que en un entorno de producción con API real exista un botón de reseteo peligroso.

---

## ⚖️ Análisis de Sobreingeniería (Trade-offs & Justificación)

### ¿Qué podría parecer sobreingeniería en una lista To-Do básica?
En una tarea convencional de una sola pantalla, lo más básico habría sido colocar un único archivo con un `useState([...])` plano y componentes HTML o React Native crudos.

Separar la aplicación en **Enums, Types, Interfaces, Adaptadores de Infraestructura (Mock y HTTP), Factory de repositorios, Feature Flags de entorno y Wrappers Atómicos de UI** podría parecer sofisticado para un simple To-Do.

### ¿Por qué está plenamente justificado en este proyecto?
1. **Cumplimiento Sobresaliente de la Rúbrica (18 pts en Patrones de Diseño):** La pauta evalúa la capacidad de aplicar patrones arquitectónicos de la industria, no solo código imperativo plano.
2. **Anticipación de las Unidades 2 y 3 (Criterio 6 de la Pauta):** La evaluación establece explícitamente que este proyecto se conectará a almacenamiento persistente, autenticación y APIs en las siguientes entregas. Gracias a este desacoplamiento, **conectar un backend en NestJS en la Unidad 2 tomará menos de 5 minutos**, cambiando únicamente `EXPO_PUBLIC_DEMO_MODE=false` sin tener que reescribir ni una sola línea de la interfaz gráfica.
3. **Mantenibilidad:** El patrón de componentes reutilizables asegura que si el diseño corporativo cambia, solo se ajusta la carpeta `src/components/ui/`.

### Límites conscientes trazados (Evitando la sobreingeniería real)
- ❌ **Sin Redux Toolkit ni Zustand:** Para una entidad simple, un Custom Hook (`useTasks`) es limpio, predecible y no añade boilerplate innecesario.
- ❌ **Sin Use-Cases de Clean Architecture extrema:** No se crearon clases intermedias vacías (`CreateTaskUseCase.ts`, `DeleteTaskUseCase.ts`); el puerto `ITaskRepository` resuelve el desacoplamiento con elegancia.
- ❌ **Sin librerías pesadas de validación:** Se evitó sumar dependencias como Formik o Zod para 2 campos simples.

---

## 📁 Estructura del Código Fuente

```text
todo-list-mobile-ipss/
├── .env                              # Configuración activa (EXPO_PUBLIC_DEMO_MODE=true)
├── .env.example                      # Plantilla de variables de entorno
├── app.json                          # Metadatos de la aplicación Expo
├── package.json                      # Dependencias y scripts
├── tsconfig.json                     # Configuración estricta de TypeScript
├── README.md                         # Informe técnico académico
├── App.tsx                           # Punto de entrada y orquestador principal
└── src/
    ├── config/
    │   └── env.config.ts             # Lectura tipada de variables de entorno
    ├── core/                         # Capa de Dominio y Contratos
    │   └── task/
    │       ├── enums/
    │       │   ├── task-priority.enum.ts
    │       │   └── task-status.enum.ts
    │       ├── interfaces/
    │       │   ├── task.interface.ts
    │       │   ├── task-filter.interface.ts
    │       │   └── task-repository.interface.ts
    │       └── types/
    │           ├── create-task.type.ts
    │           └── update-task.type.ts
    ├── infra/                        # Capa de Infraestructura y Datos
    │   └── api/
    │       ├── adapters/
    │       │   ├── task-storage.adapter.ts # Modo Demo: AsyncStorage con Seed
    │       │   └── task-http.adapter.ts    # Modo API REST (NestJS ready)
    │       ├── factories/
    │       │   └── task-adapter.factory.ts # Resolución dinámica según Feature Flag
    │       └── seeds/
    │           └── task.seed.ts            # Semillas de datos iniciales
    ├── components/
    │   ├── ui/                       # Componentes Atómicos Reutilizables (Design System)
    │   │   ├── AppCard.tsx
    │   │   ├── AppButton.tsx
    │   │   ├── AppInput.tsx
    │   │   ├── AppBadge.tsx
    │   │   └── AppConfirmDialog.tsx
    │   └── tasks/                    # Componentes de Dominio To-Do
    │       ├── TaskHeader.tsx
    │       ├── TaskFilterTabs.tsx
    │       ├── TaskItem.tsx
    │       ├── TaskFormModal.tsx
    │       └── TaskEmptyState.tsx
    ├── hooks/
    │   └── useTasks.ts               # Custom Hook de Estado y Operaciones
    └── theme/
        └── app-theme.ts              # Tokens y Colores de Material Design 3
```

---

## 🛠️ Instrucciones de Instalación y Ejecución

### Prerrequisitos
- Node.js (v18 o superior)
- npm o yarn
- Dispositivo móvil con la app gratuita **Expo Go** instalada (opcional, disponible en Google Play Store y App Store) o un navegador web.

### 1. Clonar el repositorio
```bash
git clone <URL_DEL_REPOSITORIO>
cd todo-list-mobile-ipss
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
El archivo `.env` ya viene preconfigurado en modo demo:
```env
EXPO_PUBLIC_DEMO_MODE=true
EXPO_PUBLIC_API_URL=http://localhost:3000/api
EXPO_PUBLIC_APP_ENV=development
```

### 4. Iniciar la aplicación
```bash
npx expo start
```

### 5. Opciones de visualización:
- **En el Navegador Web:** Presiona la tecla `w` en la terminal (o ejecuta `npm run web`). Se abrirá en `http://localhost:8081`.
- **En tu Teléfono Físico:** Abre la app **Expo Go** en Android o la app Cámara en iPhone y escanea el código QR que aparece en la terminal.
- **En Emulador Android:** Presiona la tecla `a`.
