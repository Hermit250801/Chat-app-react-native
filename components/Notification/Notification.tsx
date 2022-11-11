import { View, Text, StyleSheet } from 'react-native'
import React from 'react'

export default function Notification({number}) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{number}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fe5050",
    paddingHorizontal: 6,
    borderRadius: 100,
    fontSize: 12,

  },
  text: {
    color: "#fff"
  }
});