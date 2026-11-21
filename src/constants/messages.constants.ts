export const APP_MESSAGES = {
  AUTH: {
    PROFILE_NAME_MIN: 'El nombre del perfil debe tener al menos 2 caracteres.',
    PIN_INVALID_FORMAT: 'El PIN debe contener exactamente 4 dígitos numéricos.',
    PROFILE_DUPLICATE: 'Ya existe un perfil con ese nombre.',
    PIN_INCORRECT: 'PIN incorrecto. Intenta nuevamente.',
    PIN_LOCKED: (seconds: number) =>
      `Demasiados intentos fallidos. Espera ${seconds} s antes de volver a intentar.`,
    BIOMETRIC_PROMPT: 'Desbloquea tu cuaderno con biometría',
    BIOMETRIC_CANCEL: 'Usar PIN',
    BIOMETRIC_NOT_ENROLLED: 'No hay datos biométricos registrados en el dispositivo.',
    BIOMETRIC_NO_HARDWARE: 'Este dispositivo no cuenta con sensor biométrico compatible.',
    BIOMETRIC_FAILED: 'Autenticación biométrica cancelada o no reconocida.',
    BIOMETRIC_ERROR: 'Error al invocar el sensor biométrico.',
    BIOMETRIC_UNAVAILABLE_WEB: 'No disponible en Web',
    BIOMETRIC_UNAVAILABLE: 'No disponible',
    BIOMETRIC_OWNER_TAKEN: (ownerName: string) =>
      `La biometría del dispositivo ya está vinculada al perfil principal (${ownerName}). Este perfil usará PIN de 4 dígitos.`,
  },
  DEVICE: {
    CAMERA_DENIED: 'Permiso de cámara denegado.',
    CAMERA_DENIED_DETAIL:
      'Para tomar fotos y adjuntarlas a tus tareas, habilita el permiso de Cámara en la configuración del dispositivo.',
    CAMERA_DENIED_RETRY:
      'Necesitamos acceso a la cámara para tomar la foto. Puedes reintentar la solicitud ahora o continuar sin foto.',
    CAMERA_ERROR: 'No se pudo acceder a la cámara.',
    GALLERY_DENIED: 'Permiso de galería denegado.',
    GALLERY_DENIED_DETAIL:
      'Para elegir imágenes de tu galería, habilita el permiso de Fotos en la configuración del dispositivo.',
    GALLERY_DENIED_RETRY:
      'Necesitamos acceso a tus fotos para adjuntar imágenes existentes. Puedes reintentar o continuar sin imagen.',
    GALLERY_ERROR: 'No se pudo abrir la galería.',
    IMAGE_TOO_LARGE: (maxMb: number) =>
      `La imagen supera el límite máximo permitido de ${maxMb} MB. Selecciona una imagen más liviana.`,
    LOCATION_DENIED: 'Permiso de ubicación GPS denegado.',
    LOCATION_DENIED_DETAIL:
      'Para registrar la ubicación donde creas cada tarea, habilita el permiso de Ubicación en la configuración del dispositivo.',
    LOCATION_DENIED_RETRY:
      'Necesitamos acceso a tu ubicación para registrar el lugar de la tarea. Puedes reintentar la solicitud ahora.',
    LOCATION_SERVICES_DISABLED:
      'La ubicación (GPS) del dispositivo está desactivada. Actívala en el panel rápido e intenta nuevamente.',
    LOCATION_INVALID_COORDS: 'Las coordenadas recibidas por el GPS no son válidas.',
    LOCATION_TIMEOUT:
      'El GPS tardó demasiado en responder. Intenta nuevamente en un lugar con mejor señal.',
    LOCATION_ERROR: 'No se pudo obtener la ubicación GPS actual.',
  },
  TASKS: {
    TITLE_REQUIRED: 'El título de la tarea es obligatorio.',
    TITLE_MIN: 'El título debe tener al menos 3 caracteres.',
    LOAD_ERROR: 'Error inesperado al cargar tareas.',
    CREATE_ERROR: 'No se pudo crear la tarea.',
    UPDATE_ERROR: 'No se pudo actualizar la tarea.',
    DELETE_ERROR: 'No se pudo eliminar la tarea.',
    STORAGE_SAVE_ERROR: 'No se pudo guardar en el almacenamiento local del dispositivo.',
    NOT_FOUND: (id: string) => `Tarea con ID ${id} no encontrada.`,
  },
} as const;
