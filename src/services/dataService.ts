import { supabase } from './supabase';

export interface Driver {
  id: string;
  cpf: string;
  name: string;
  email?: string;
  is_recycling?: boolean;
  previous_training_at?: string;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  folder_name: string;
}

export interface Progress {
  id: string;
  driver_id: string;
  module_id: string;
  status: 'in_progress' | 'completed';
  completed_at: string | null;
}

export const dataService = {
  async getDriverByCpf(cpf: string): Promise<Driver | null> {
    const { data, error } = await supabase
      .from('onboarding_drivers')
      .select('*')
      .eq('cpf', cpf)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async createDriver(cpf: string, name: string, passwordHash: string, email?: string): Promise<Driver> {
    const { data, error } = await supabase
      .from('onboarding_drivers')
      .insert([{ cpf, name, password_hash: passwordHash, email }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getDriverByCredentials(cpf: string, passwordHash: string): Promise<Driver | null> {
    const { data, error } = await supabase
      .from('onboarding_drivers')
      .select('*')
      .eq('cpf', cpf)
      .eq('password_hash', passwordHash)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async getModules(): Promise<Module[]> {
    const { data, error } = await supabase
      .from('onboarding_modules')
      .select('*');
    if (error) throw error;
    return data;
  },

  async getProgress(driverId: string): Promise<Progress[]> {
    const { data, error } = await supabase
      .from('onboarding_progress')
      .select('*')
      .eq('driver_id', driverId);
    if (error) throw error;
    return data;
  },

  async markModuleCompleted(driverId: string, moduleId: string): Promise<void> {
    const { error } = await supabase
      .from('onboarding_progress')
      .upsert({
        driver_id: driverId,
        module_id: moduleId,
        status: 'completed',
        completed_at: new Date().toISOString()
      }, { onConflict: 'driver_id,module_id' });
    if (error) throw error;
  },

  async getAllDrivers(): Promise<Driver[]> {
    const { data, error } = await supabase
      .from('onboarding_drivers')
      .select('*')
      .order('name');
    if (error) throw error;
    return data;
  },

  async updateDriverPassword(driverId: string, newPasswordHash: string): Promise<void> {
    const { error } = await supabase
      .from('onboarding_drivers')
      .update({ password_hash: newPasswordHash })
      .eq('id', driverId);
    if (error) throw error;
  },

  async getAllProgress(): Promise<Progress[]> {
    const { data, error } = await supabase
      .from('onboarding_progress')
      .select('*');
    if (error) throw error;
    return data;
  },

  async triggerRecycling(driverId: string, previousDate: string): Promise<void> {
    // 1. Update driver status
    const { error: updateError } = await supabase
      .from('onboarding_drivers')
      .update({ 
        is_recycling: true, 
        previous_training_at: previousDate 
      })
      .eq('id', driverId);
    if (updateError) throw updateError;

    // 2. Delete all progress
    const { error: deleteError } = await supabase
      .from('onboarding_progress')
      .delete()
      .eq('driver_id', driverId);
    if (deleteError) throw deleteError;
  }
};
