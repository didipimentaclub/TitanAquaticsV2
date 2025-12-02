
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { WaterTest } from '../types';

export function useWaterTests(userId?: string, options?: { aquariumId?: string | null }) {
  const [tests, setTests] = useState<WaterTest[]>([]);
  const [loading, setLoading] = useState(false);
  const [latestTest, setLatestTest] = useState<WaterTest | null>(null);

  const fetchTests = async () => {
    if (!userId) return;
    setLoading(true);
    
    let query = supabase
      .from('water_tests')
      .select('*')
      .eq('user_id', userId)
      .order('measured_at', { ascending: false });

    if (options?.aquariumId) {
      query = query.eq('aquarium_id', options.aquariumId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching water tests:', error);
    } else {
      setTests(data || []);
      if (data && data.length > 0) {
        setLatestTest(data[0]);
      } else {
        setLatestTest(null);
      }
    }
    setLoading(false);
  };

  const addTest = async (testData: Partial<WaterTest>) => {
    if (!userId) {
        console.error('Add Test Failed: No User ID');
        return { error: 'User not authenticated' };
    }

    console.log("Saving water test:", testData);

    const { data, error } = await supabase
      .from('water_tests')
      .insert([{ ...testData, user_id: userId }])
      .select()
      .single();

    if (error) {
        console.error("Supabase Error adding test:", error);
    } else if (data) {
      setTests(prev => [data, ...prev]);
      setLatestTest(data);
    }
    return { data, error };
  };

  const deleteTest = async (id: string) => {
    const { error } = await supabase.from('water_tests').delete().eq('id', id);
    if (!error) {
      setTests(prev => prev.filter(t => t.id !== id));
      if (latestTest?.id === id) {
        setLatestTest(tests.length > 1 ? tests[1] : null);
      }
    }
    return { error };
  };

  useEffect(() => {
    fetchTests();
  }, [userId, options?.aquariumId]);

  return { tests, loading, latestTest, addTest, deleteTest, fetchTests };
}
