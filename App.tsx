import React, { useState, useEffect } from 'react'
import { Session } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'
import { View } from 'react-native'
import Auth from './components/Auth'
import LoadingScreen from './components/LoadingScreen'
import BottomTabNavigator from './navigation/BottomTabNavigator'
import * as Updates from 'expo-updates'

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const checkForUpdates = async () => {
      try {
        if (Updates.isEmbeddedLaunch) {
          console.log('App is running in a standalone environment.')
          const update = await Updates.checkForUpdateAsync()
          if (update.isAvailable) {
            console.log('Update available, fetching...')
            await Updates.fetchUpdateAsync()
            await Updates.reloadAsync() // Recharge l'application pour appliquer la mise à jour
          } else {
            console.log('No updates available.')
          }
        } else {
          console.log('App is running in Expo Go. Updates not supported.')
        }
      } catch (error) {
        console.error(
          'Erreur lors de la vérification des mises à jour :',
          error
        )
      }
    }
    checkForUpdates()
  }, [])

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
