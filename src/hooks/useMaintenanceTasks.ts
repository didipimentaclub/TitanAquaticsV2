import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { MaintenanceTask } from '../types';

export function useMaintenanceTasks(userId?: string) {
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTasks = async () => {
    if (!userId) return;
    setLoading(true);
    
    const { data, error } = await supabase
      .from('maintenance_tasks')
      .select('*')
      .eq('user_id', userId)
      .order('scheduled_date', { ascending: true });

    if (error) {
      console.error('Error fetching tasks:', error);
    } else {
      setTasks(data || []);
    }
    setLoading(false);
  };

  const addTask = async (task: Partial<MaintenanceTask>) => {
    if (!userId) return { error: 'User not authenticated' };
    const { data, error } = await supabase
      .from('maintenance_tasks')
      .insert([{ ...task, user_id: userId, is_completed: false }])
      .select()
      .single();

    if (data) setTasks(prev => [...prev, data].sort((a,b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime()));
    return { data, error };
  };

  const completeTask = async (id: string, isCompleted: boolean) => {
    const { error } = await supabase
      .from('maintenance_tasks')
      .update({ 
        is_completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null
      })
      .eq('id', id);

    if (!error) {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, is_completed: isCompleted, completed_at: isCompleted ? new Date().toISOString() : undefined } : t));
    }
  };

  const deleteTask = async (id: string) => {
    const { error } = await supabase.from('maintenance_tasks').delete().eq('id', id);
    if (!error) {
      setTasks(prev => prev.filter(t => t.id !== id));
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [userId]);

  const overdueTasks = tasks.filter(t => !t.is_completed && new Date(t.scheduled_date) < new Date(new Date().setHours(0,0,0,0)));
  const todayTasks = tasks.filter(t => !t.is_completed && new Date(t.scheduled_date).toDateString() === new Date().toDateString());

  return { tasks, loading, addTask, completeTask, deleteTask, overdueTasks, todayTasks, fetchTasks };
}