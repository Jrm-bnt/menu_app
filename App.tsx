import React, { useState, useEffect } from 'react'
import { Session } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'
import { View } from 'react-native'
import Auth from './components/Auth'
import LoadingScreen from './components/LoadingScreen'
import BottomTabNavigator from './navigation/BottomTabNavigator'

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    // Récupérer la session actuelle
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Écouter les changements de session
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      setLoading(false)
    })

    return () => {
      if (subscription) subscription.unsubscribe()
      setLoading(false)
    }
  }, [])

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <View style={{ flex: 1 }}>
      {session && session.user ? (
        <BottomTabNavigator session={session} />
      ) : (
        <Auth />
      )}
    </View>
  )
}
