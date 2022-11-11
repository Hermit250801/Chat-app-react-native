import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import React from "react";

import Icon from "react-native-vector-icons/MaterialIcons";

export default function CheckBox({ friend, selected, onPress, member }) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Icon
        size={24}
        color={"#109ffb"}
        name={selected ? "check-box" : "check-box-outline-blank"}
      />
      <Image source={require("../../assets/user.png")} style={styles.avatar} />
      <View>
        <Text style={styles.userName}>
          {friend.firstName} {friend.lastName}
        </Text>
        { member && <Text style={styles.textMember}>Đã tham gia</Text> }
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  avatar: {
    height: 50,
    width: 50,
    marginLeft: 10,
  },
  userName: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "600",
  },
  textMember: {
    marginLeft: 10,
    color: "#06b1fb"
  }
});
