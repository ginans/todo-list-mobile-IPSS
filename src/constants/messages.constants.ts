export const APP_MESSAGES = {
  AUTH: {
    PROFILE_NAME_MIN: 'El nombre del perfil debe tener al menos 2 caracteres.',
    PIN_INVALID_FORMAT: 'El PIN debe contener exactamente 4 dígitos numéricos.',
    PROFILE_DUPLICATE: 'Ya existe un perfil con ese nombre.',
    PIN_INCORRECT: 'PIN incorrecto. Intenta nuevamente.',
    BIOMETRIC_PROMPT: 'Desbloquea tu cuaderno de tareas',
    BIOMETRIC_CANCEL: 'Usar PIN',
    BIOMETRIC_NOT_ENROLLED: 'No hay huellas ni rostro registrados en el dispositivo.',
    BIOMETRIC_NO_HARDWARE: 'Este dispositivo no cuenta con sensor biométrico.',
    BIOMETRIC_FAILED: 'Autenticación biométrica cancelada o no reconocida.',
    BIOMETRIC_ERROR: 'Error al invocar el sensor biométrico.',
    BIOMETRIC_UNAVAILABLE_WEB: 'No disponible en Web',
    BIOMETRIC_UNAVAILABLE: 'No disponible',
  },
  DEVICE: {
    CAMERA_DENIED: 'Permiso de cámara denegado.',
    CAMERA_DENIED_DETAIL:
      'Para tomar fotos y adjuntarlas a tus tareas, habilita el permiso de Cámara en la configuración del dispositivo.',
    CAMERA_ERROR: 'No se pudo acceder a la cámara.',
    GALLERY_DENIED: 'Permiso de galería denegado.',
    GALLERY_DENIED_DETAIL:
      'Para elegir imágenes de tu galería, habilita el permiso de Fotos en la configuración del dispositivo.',
    GALLERY_ERROR: 'No se pudo abrir la galería.',
    LOCATION_DENIED: 'Permiso de ubicación GPS denegado.',
    LOCATION_DENIED_DETAIL:
      'Para registrar la ubicación donde creas cada tarea, habilita el permiso de Ubicación en la configuración del dispositivo.',
    LOCATION_INVALID_COORDS: 'Las coordenadas recibidas por el GPS no son válidas.',
    LOCATION_ERROR: 'No se pudo obtener la ubicación GPS actual.',
  },
  TASKS: {
    LOAD_ERROR: 'Error inesperado al cargar tareas.',
    CREATE_ERROR: 'No se pudo crear la tarea.',
    UPDATE_ERROR: 'No se pudo actualizar la tarea.',
    DELETE_ERROR: 'No se pudo eliminar la tarea.',
    NOT_FOUND: (id: string) => `Tarea con ID ${id} no encontrada.`,
  },
} as const;
