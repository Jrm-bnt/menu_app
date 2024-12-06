import React from 'react'
import { View, Text, StyleSheet, Modal, Button } from 'react-native'

type ConfirmationModalProps = {
  visible: boolean
  message: string
  onConfirm: () => void
  onCancel: () => void
}

const ConfirmationModal = ({
  visible,
  message,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalView}>
          <Text style={styles.modalText}>{message}</Text>
          <View style={styles.modalButtonContainer}>
            <Button title="Annuler" onPress={onCancel} />
            <Button title="Confirmer" onPress={onConfirm} color="red" />
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Couleur semi-transparente pour le fond
  },
  modalView: {
    margin: 18,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 18,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
  },
})

export default ConfirmationModal
