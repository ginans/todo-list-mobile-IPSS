import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { PaperProvider, FAB, Snackbar, ActivityIndicator } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';

import { appTheme, semanticColors } from './src/theme/app-theme';
import { useTasks } from './src/hooks/useTasks';
import { ITask } from './src/core/task/interfaces/task.interface';
import { CreateTaskInput } from './src/core/task/types/create-task.type';
import { UpdateTaskInput } from './src/core/task/types/update-task.type';

import { TaskHeader } from './src/components/tasks/TaskHeader';
import { TaskFilterTabs } from './src/components/tasks/TaskFilterTabs';
import { TaskItem } from './src/components/tasks/TaskItem';
import { TaskFormModal } from './src/components/tasks/TaskFormModal';
import { TaskEmptyState } from './src/components/tasks/TaskEmptyState';
import { AppConfirmDialog } from './src/components/ui/AppConfirmDialog';

export default function App() {
  const {
    tasks,
    allTasksCount,
    isLoading,
    isActionLoading,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    stats,
    loadTasks,
    createTask,
    updateTask,
    deleteTask,
    toggleStatus,
    resetToMockData,
  } = useTasks();

  // Estado del modal de formulario (crear / editar)
  const [isFormModalVisible, setIsFormModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<ITask | null>(null);

  // Estado del diálogo de confirmación de borrado
  const [taskToDelete, setTaskToDelete] = useState<ITask | null>(null);

  // Estado del diálogo de reseteo de demo
  const [isResetConfirmVisible, setIsResetConfirmVisible] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Snackbar para notificaciones al usuario
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
  };

  // Abrir modal para crear
  const handleOpenCreate = () => {
    setEditingTask(null);
    setIsFormModalVisible(true);
  };

  // Abrir modal para editar
  const handleOpenEdit = (task: ITask) => {
    setEditingTask(task);
    setIsFormModalVisible(true);
  };

  // Guardar creación o edición
  const handleFormSubmit = async (
    payload: CreateTaskInput | UpdateTaskInput
  ): Promise<boolean> => {
    if (editingTask) {
      const success = await updateTask(editingTask.id, payload);
      if (success) {
        showToast('✓ Tarea actualizada exitosamente');
      }
      return success;
    } else {
      const success = await createTask(payload as CreateTaskInput);
      if (success) {
        showToast('✓ Tarea agregada a la lista');
      }
      return success;
    }
  };

  // Confirmar y ejecutar eliminación
  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;
    const success = await deleteTask(taskToDelete.id);
    if (success) {
      showToast('🗑 Tarea eliminada');
    }
    setTaskToDelete(null);
  };

  // Confirmar y restablecer datos demo
  const handleConfirmReset = async () => {
    setIsResetting(true);
    const success = await resetToMockData();
    setIsResetting(false);
    setIsResetConfirmVisible(false);
    if (success) {
      showToast('⚡ Datos demo restablecidos con éxito');
    }
  };

  return (
    <SafeAreaProvider>
      <PaperProvider theme={appTheme}>
        <StatusBar style="dark" />
        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView
            style={styles.keyboardContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            {/* Encabezado con Métricas, Banner Demo y Barra de Progreso */}
            <TaskHeader
              stats={stats}
              onResetDemo={() => setIsResetConfirmVisible(true)}
              isResetting={isResetting}
            />

            {/* Pestañas de Filtro y Búsqueda */}
            <TaskFilterTabs
              filter={filter}
              onFilterChange={setFilter}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              counts={{
                all: allTasksCount,
                pending: stats.pending,
                completed: stats.completed,
              }}
            />

            {/* Listado Principal de Tareas */}
            {isLoading && tasks.length === 0 ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={appTheme.colors.primary} />
              </View>
            ) : (
              <FlatList
                data={tasks}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TaskItem
                    task={item}
                    onToggleStatus={toggleStatus}
                    onEdit={handleOpenEdit}
                    onDelete={setTaskToDelete}
                  />
                )}
                contentContainerStyle={styles.listContent}
                refreshControl={
                  <RefreshControl
                    refreshing={isLoading}
                    onRefresh={loadTasks}
                    colors={[appTheme.colors.primary]}
                    tintColor={appTheme.colors.primary}
                  />
                }
                ListEmptyComponent={
                  <TaskEmptyState
                    hasFilters={filter !== 'ALL' || Boolean(searchQuery)}
                    onClearFilters={() => {
                      setFilter('ALL');
                      setSearchQuery('');
                    }}
                    onAddTask={handleOpenCreate}
                  />
                }
              />
            )}

            {/* Botón Flotante para Crear Tarea (Material Design FAB) */}
            <FAB
              icon="plus"
              label="Nueva Tarea"
              onPress={handleOpenCreate}
              style={styles.fab}
              color="#FFFFFF"
            />

            {/* Modal de Creación / Edición */}
            <TaskFormModal
              visible={isFormModalVisible}
              onDismiss={() => setIsFormModalVisible(false)}
              onSubmit={handleFormSubmit}
              initialTask={editingTask}
              loading={isActionLoading}
            />

            {/* Diálogo de Confirmación para Eliminar Tarea */}
            <AppConfirmDialog
              visible={Boolean(taskToDelete)}
              title="¿Eliminar esta tarea?"
              message={
                taskToDelete
                  ? `Se eliminará permanentemente la tarea "${taskToDelete.title}". Esta acción no se puede deshacer.`
                  : ''
              }
              confirmLabel="Eliminar"
              cancelLabel="Cancelar"
              isDestructive
              onConfirm={handleConfirmDelete}
              onCancel={() => setTaskToDelete(null)}
              loading={isActionLoading}
            />

            {/* Diálogo de Confirmación para Restablecer Datos Demo */}
            <AppConfirmDialog
              visible={isResetConfirmVisible}
              title="¿Restablecer Datos Demo?"
              message="Se recargarán las 4 tareas iniciales de prueba y se descartarán los cambios locales actuales."
              confirmLabel="Restablecer"
              cancelLabel="Cancelar"
              onConfirm={handleConfirmReset}
              onCancel={() => setIsResetConfirmVisible(false)}
              loading={isResetting}
            />

            {/* Feedback Flotante (Toast / Snackbar) */}
            <Snackbar
              visible={Boolean(toastMessage)}
              onDismiss={() => setToastMessage(null)}
              duration={2600}
              style={styles.snackbar}
            >
              {toastMessage}
            </Snackbar>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: appTheme.colors.background,
  },
  keyboardContainer: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 90, // Espacio para que el FAB no tape la última tarea
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 12,
    backgroundColor: appTheme.colors.primary,
    borderRadius: 28,
  },
  snackbar: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    marginBottom: 20,
  },
});
