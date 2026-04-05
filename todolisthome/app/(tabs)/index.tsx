import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ListRenderItemInfo,
  Platform,
  StyleSheet,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

type TodoResponseItem = {
  id: number;
  todo: string;
  completed: boolean;
  userId: number;
};

type TodoItem = TodoResponseItem & {
  time: string;
};

type TodosResponse = {
  todos: TodoResponseItem[];
};

const TODO_API_URL = 'https://dummyjson.com/todos';

const formatHeaderDate = () => {
  const date = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return formatter.format(date);
};

const makeTimeLabel = (index: number) => {
  const hour = 12 + (index % 6);
  const suffix = hour < 12 || hour === 24 ? 'am' : 'pm';
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour} ${suffix}`;
};

export default function HomeScreen() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTodos = async () => {
    setError(null);
    try {
      const response = await fetch(TODO_API_URL);
      const json = (await response.json()) as TodosResponse;

      setTodos(
        json.todos.map((todo, index) => ({
          ...todo,
          time: makeTimeLabel(index),
        })),
      );
    } catch (e) {
      setError('Не вдалося завантажити завдання. Перевірте підключення.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void fetchTodos();
  }, []);

  const tasks = useMemo(() => todos.slice(0, 8), [todos]);

  const renderTask = ({ item }: ListRenderItemInfo<TodoItem>) => (
    <View style={styles.taskCard}>
      <View style={styles.taskRow}>
        <View style={[styles.statusDot, item.completed && styles.statusDotCompleted]} />
        <View style={styles.taskTextContainer}>
          <ThemedText type="defaultSemiBold" numberOfLines={1}>
            {item.todo}
          </ThemedText>
        </View>
        <ThemedText style={styles.taskTime}>{item.time}</ThemedText>
      </View>
    </View>
  );

  return (
    <ThemedView style={styles.screen} lightColor="#F4F7FB" darkColor="#111418">
      <View style={styles.header}>
        <ThemedText type="title">ODOT List</ThemedText>
        <ThemedText style={styles.dateText}>{formatHeaderDate()}</ThemedText>
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" color="#0a7ea4" />
      ) : error ? (
        <ThemedText style={styles.errorText}>{error}</ThemedText>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderTask}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            void fetchTodos();
          }}
          ListEmptyComponent={
            <ThemedText style={styles.emptyText}>Список завдань поки що порожній.</ThemedText>
          }
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 36 : 56,
  },
  header: {
    marginBottom: 24,
    gap: 8,
  },
  dateText: {
    fontSize: 16,
    color: '#6B7280',
  },
  loader: {
    marginTop: 24,
  },
  listContent: {
    paddingBottom: 32,
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  statusDot: {
    width: 18,
    height: 18,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  statusDotCompleted: {
    backgroundColor: '#0a7ea4',
    borderColor: '#0a7ea4',
  },
  taskTextContainer: {
    flex: 1,
  },
  taskTime: {
    color: '#6B7280',
    fontSize: 15,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 16,
    marginTop: 24,
  },
  emptyText: {
    marginTop: 24,
    fontSize: 16,
    color: '#6B7280',
  },
});
