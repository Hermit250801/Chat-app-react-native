import { View, Text, StyleSheet, Pressable, Image } from "react-native";
import React from "react";
import Ionicons from "react-native-vector-icons/Ionicons";
import { CDN_URL } from "../../utils/constants";

export default function ImageComponent({ route }) {
  const { image, navigation } = route.params;
  return (
    <View style={styles.container}>
      <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={30} color={"#fff"} />
      </Pressable>
      <Image
        key={image.key}
        source={{
          uri: CDN_URL.ORIGINAL.concat(image.key),
        }}
        style={styles.attachment}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative"
  },
  attachment: {
    flex: 1,
  },
  backBtn: {
    position: "absolute",
    top: 10,
    left: 10,
    elevation: 999,
    zIndex: 999
  }
});
