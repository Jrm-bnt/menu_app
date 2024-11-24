import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://hkrzuixhaoplkunaevgk.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhrcnp1aXhoYW9wbGt1bmFldmdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIyNjQ2ODEsImV4cCI6MjA0Nzg0MDY4MX0.Nak-n1XblB-N0-1Ix_UiwMUWZLzE3cm8mSrs6Vi4fIU"

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
})