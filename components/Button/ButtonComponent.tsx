import { View, Text, StyleSheet, Pressable } from "react-native";
import React from "react";

export type Props = {
  onPress: Function;
  title: String;
};

const Button: React.FC<Props> = ({ onPress, title = "Save", ...props }) => {
  return (
    <Pressable
      style={({ pressed }) => [
        {
          backgroundColor: pressed ? "#93989a" : "transparent",
        },
        styles.button,
      ]}
      onPress={() => onPress()}
    >
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 100,
    backgroundColor: "#3d9af7",
    width: "100%",
    marginVertical: 12,
  },
  text: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "bold",
    letterSpacing: 0.25,
    color: "white",
  },
});

export default Button;
