import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { StyleSheet, View, Alert } from 'react-native'
import { Button, Input } from '@rneui/themed'
import { Session } from '@supabase/supabase-js'
import React from 'react'

interface User {
  id?: string
  username: string
  email: string
}

export default function SettingScreen({ session }: { session: Session }) {
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [isUserChecked, setIsUserChecked] = useState(false)
  const [userExists, setUserExists] = useState(false)

  useEffect(() => {
    if (session) {
      setEmail(session.user.email ?? '')
      checkIfUserExists()
    }
  }, [session])

  async function checkIfUserExists() {
    try {
      console.log('Checking if user exists')
      setLoading(true)
      if (!session?.user) throw new Error('No user on the session!')

      // Vérifiez si l'utilisateur existe déjà
      const {
        data = null,
        error,
        status,
      } = await supabase
        .from('users')
        .select('username')
        .eq('email', session?.user.email!)
        .single()

      console.log('Query status:', status)
      console.log('User data:', data)
      console.log('User error:', error)

      if (data) {
        setUsername((data as User).username)
        setUserExists(true)
      }

      setIsUserChecked(true)
    } catch (error) {
      if (
        error instanceof Error &&
        error.message !==
          'JSON object requested, multiple (or no) rows returned'
      ) {
        Alert.alert(error.message)
        console.error('Error during checkIfUserExists:', error)
      }
    } finally {
      setLoading(false)
    }
  }

  async function createUser() {
    try {
      console.log('Creating new user')
      setLoading(true)
      if (!session?.user) throw new Error('No user on the session!')

      // Le username doit être saisi par l'utilisateur
      if (!username) {
        Alert.alert('Username is required')
        return
      }

      // Créer un nouvel utilisateur
      const newUserData = {
        email: session.user.email!,
        username,
      }
      console.log('Creating new user with data:', newUserData)

      const {
        data: newUser,
        error: insertError,
        status: insertStatus,
      } = await supabase
        .from('users')
        .upsert([newUserData], { onConflict: 'email' })
        .single()

      console.log('Upsert status:', insertStatus)
      console.log('Insert error:', insertError)
      console.log('New user data:', newUser)

      if (insertError) throw insertError

      if (newUser) {
        setUsername((newUser as User).username)
        Alert.alert('New user created successfully!')
      } else {
        console.log(
          'New user data is null, treating as successful insertion without returning data.',
        )
        setEmail('')
        Alert.alert('New user created successfully without returning data!')
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message)
        console.error('Error during createUser:', error)
      }
    } finally {
      setLoading(false)
    }
  }

  async function saveUserProfile() {
    try {
      console.log('Saving user profile')
      setLoading(true)
      if (!session?.user) throw new Error('No user on the session!')

      const updates = {
        email: session.user.email!,
        username,
      }

      console.log('Updating/Inserting user with data:', updates)

      const { error, status } = await supabase
        .from('users')
        .upsert([updates], { onConflict: 'email' })

      console.log('Upsert status:', status)
      console.log('Upsert error:', error)

      if (error) {
        throw error
      }

      console.log('Profile updated successfully')
      Alert.alert('Profile saved successfully!')
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error saving profile:', error.message)
        console.error('Error during saveUserProfile:', error)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Input label="Email" value={session?.user?.email ?? ''} disabled />
      </View>
      <View style={styles.verticallySpaced}>
        <Input
          label="Username"
          value={username || ''}
          onChangeText={(text) => setUsername(text)}
        />
      </View>
      {!isUserChecked && (
        <Button
          title="Create New User"
          disabled={loading}
          onPress={createUser}
        />
      )}
      {isUserChecked && userExists && (
        <>
          <Button
            title="Save Profile"
            disabled={loading}
            onPress={saveUserProfile}
          />
          <View style={styles.verticallySpaced}>
            <Button title="Sign Out" onPress={() => supabase.auth.signOut()} />
          </View>
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 12,
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
  },
  mt20: {
    marginTop: 20,
  },
})
