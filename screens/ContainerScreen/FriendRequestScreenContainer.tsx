import { View, Text, StyleSheet, Pressable } from "react-native";
import { useContext, useEffect } from "react";
import Ionicons from "react-native-vector-icons/Ionicons";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";

import FriendRequestSendScreen from "../FriendScreen/FriendRequestSendScreen";
import FriendRequestReceiveScreen from "../FriendScreen/FriendRequestReceiveScreen";
import { fetchFriendRequestThunk } from "../../store/friends/friendsThunk";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store";
import { SocketContext } from "../../utils/context/SocketContext";
import { addFriendRequest, removeFriendRequest } from "../../store/friends/friendsSlice";
import { AcceptFriendRequestResponse, FriendRequest } from "../../utils/types";

const Tab = createMaterialTopTabNavigator();

export default function FriendRequestScreen({ navigation }) {

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [
            { backgroundColor: pressed ? "#d9dadf" : "transparent" },
            styles.backBtn,
          ]}
          onPress={() => navigation.navigate("Bạn Bè")}
        >
          <Ionicons name="arrow-back" size={30} color={"#fff"} />
        </Pressable>

        <Text style={styles.text}>Lời mời kết bạn</Text>
      </View>
      <Tab.Navigator>
        <Tab.Screen name="Đã nhận" component={FriendRequestReceiveScreen} />
        <Tab.Screen name="Đã gửi" component={FriendRequestSendScreen} />
      </Tab.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: "#129dfc",
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  backBtn: {
    borderRadius: 100,
    paddingHorizontal: 2,
  },
  text: {
    paddingLeft: 10,
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
});
