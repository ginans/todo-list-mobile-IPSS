import React, { useState } from 'react';
import {
  View,
  FlatList,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { PaperProvider, FAB, Snackbar, ActivityIndicator } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';

import { appTheme } from './src/theme/app-theme';
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
import { styles } from './src/styles/app.styles';

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
  } = useTasks();

  const [isFormModalVisible, setIsFormModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<ITask | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<ITask | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
  };

  const handleOpenCreate = () => {
    setEditingTask(null);
    setIsFormModalVisible(true);
  };

  const handleOpenEdit = (task: ITask) => {
    setEditingTask(task);
    setIsFormModalVisible(true);
  };

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

  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;
    const success = await deleteTask(taskToDelete.id);
    if (success) {
      showToast('🗑 Tarea eliminada');
    }
    setTaskToDelete(null);
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
            <TaskHeader stats={stats} />

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

            <FAB
              icon="plus"
              label="Nueva Tarea"
              onPress={handleOpenCreate}
              style={styles.fab}
              color="#FFFFFF"
            />

            <TaskFormModal
              visible={isFormModalVisible}
              onDismiss={() => setIsFormModalVisible(false)}
              onSubmit={handleFormSubmit}
              initialTask={editingTask}
              loading={isActionLoading}
            />

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
