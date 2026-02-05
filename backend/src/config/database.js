
import { createClient } from '@supabase/supabase-js';
import env from './env.js';
import logger from '../utils/logger.js';

let supabase = null;

export const initDatabase = () => {
  try {
    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
    }
    
    supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
    logger.info('✓ Database connection established');
    return supabase;
  } catch (error) {
    logger.error('✗ Database connection failed: ' + error.message);
    console.error('Error details:', error);
    // Don't throw - just warn
    return null;
  }
};

export const getDatabase = () => {
  if (!supabase) {
    initDatabase();
  }
  return supabase;
};

export const db = {
  select: async (table, columns = '*', filters = {}) => {
    try {
      let query = getDatabase().from(table).select(columns);
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (error) {
      logger.error(`Error selecting from ${table}:`, error);
      throw error;
    }
  },

  insert: async (table, data) => {
    try {
      const { data: result, error } = await getDatabase()
        .from(table)
        .insert([data])
        .select();
      if (error) throw error;
      return result?.[0];
    } catch (error) {
      logger.error(`Error inserting into ${table}:`, error);
      throw error;
    }
  },

  update: async (table, id, data) => {
    try {
      const { data: result, error } = await getDatabase()
        .from(table)
        .update(data)
        .eq('id', id)
        .select();
      if (error) throw error;
      return result?.[0];
    } catch (error) {
      logger.error(`Error updating ${table}:`, error);
      throw error;
    }
  },

  delete: async (table, id) => {
    try {
      const { error } = await getDatabase()
        .from(table)
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    } catch (error) {
      logger.error(`Error deleting from ${table}:`, error);
      throw error;
    }
  },
};

export default { initDatabase, getDatabase, db };
