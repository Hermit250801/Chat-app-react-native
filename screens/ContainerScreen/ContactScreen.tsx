import { View, Text, StyleSheet, Pressable, TextInput } from "react-native";
import React, { useEffect, useState, useContext } from "react";
import FriendScreen from "./FriendScreen";
import GroupScreen from "../GroupScreen/GroupScreen";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";

import EvilIcons from "react-native-vector-icons/EvilIcons";
import AntDesign from "react-native-vector-icons/AntDesign";
import ModalAddFriend from "../../components/ModalAddFriend/ModalAddFriend";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store";
import { fetchFriendsThunk } from "../../store/friends/friendsThunk";
import { SocketContext } from "../../utils/context/SocketContext";

const Tab = createMaterialTopTabNavigator();

export default function ContactScreen({ navigation }) {
  const [visible, setVisible] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const socket = useContext(SocketContext)
  useEffect(() => {
    dispatch(fetchFriendsThunk());
  }, [socket])

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <View style={styles.search}>
          <Pressable>
            <EvilIcons name="search" style={styles.searchIcon} />
          </Pressable>
          <TextInput
            style={styles.textInput}
            placeholder="Tìm kiếm cuộc trò chuyện"
            placeholderTextColor={"#8cc8fe"}
          />
        </View>
        <Pressable
          style={({ pressed }) => [
            {
              backgroundColor: pressed ? "#93989a" : "transparent",
            },
            styles.button,
          ]
        }
        onPress={() => setVisible(true)}
        >
          <AntDesign name="adduser" style={styles.addUserIcon} />
        </Pressable>
        <ModalAddFriend visible={visible} setVisible={setVisible} navigation={navigation} />
      </View>
      <Tab.Navigator>
        <Tab.Screen name="Bạn Bè" component={FriendScreen}   />
        <Tab.Screen name="Nhóm" component={GroupScreen}    />
      </Tab.Navigator>
      
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  tabContainer: {
    backgroundColor: "#fff",
  },
  container: {
    backgroundColor: "#0ca7fc",
    paddingTop: 18,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  search: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 6,
    color: "#fff",
    width: "88%",
  },
  searchIcon: {
    fontSize: 24,
    fontWeight: "600",
    color: "#fff",
  },
  addUserIcon: {
    fontSize: 24,
    ontWeight: "600",
    color: "#fff",
  },
  textInput: {
    fontSize: 14,
    fontWeight: "600",
    width: "90%",
    color: "#fff",
  },
  button: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 100,
  },
});
