import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  ScrollView,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import AntDesign from "react-native-vector-icons/AntDesign";

import FriendItem from "../../components/Friend/FriendItem";
import Notification from "../../components/Notification/Notification";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { AuthContext } from "../../utils/context/AuthContext";
import { fetchGroups, getAuthUser } from "../../utils/api";
import { fetchFriendRequestThunk, fetchFriendsThunk } from "../../store/friends/friendsThunk";
import { SocketContext } from "../../utils/context/SocketContext";
import { addGroup, fetchGroupsThunk, removeGroup, updateGroup } from "../../store/groupSlice";
import GroupItem from "../../components/Group/GroupItem";
import ModalAddGroup from "../../components/ModalAddGroup/ModalAddGroup";
import { AddGroupUserMessagePayload, Group, GroupMessageEventPayload, RemoveGroupUserMessagePayload } from "../../utils/types";
import { addGroupMessage } from "../../store/groupMessageSlice";
import { updateType } from "../../store/selectedSlice";

export default function GroupScreen({ navigation }) {
 
  const groups = useSelector((state: RootState) => state.groups.groups)

  const socket = useContext(SocketContext);
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useContext(AuthContext);
  const [visible, setVisible] = useState(false);

  
  useEffect(() => {
    dispatch(updateType('group'));
    dispatch(fetchGroupsThunk());
  }, []);

  useEffect(() => {
    dispatch(updateType('group'));
    dispatch(fetchGroupsThunk());
  }, [socket]);


  useEffect(() => {
    socket.on('onGroupCreate', (payload: Group) => {
      console.log('Group Created...');
      dispatch(addGroup(payload));
    });
    socket.on('onGroupOwnerUpdate', (group: Group) => {
      console.log('received onGroupOwnerUpdate');
      dispatch(updateGroup({ group }));
    });

    socket.on("onGroupUserAdd", (payload: AddGroupUserMessagePayload) => {
      console.log("onGroupUserAdd");
      console.log(payload);
      dispatch(addGroup(payload.group));
    });

    socket.on(
      "onGroupReceivedNewUser",
      ({ group }: AddGroupUserMessagePayload) => {
        console.log("Received onGroupReceivedNewUser");
        dispatch(updateGroup({ group }));
      }
    );
    return () => {
      socket.off("onGroupCreate")
      socket.off("onGroupOwnerUpdate")
      socket.off("onGroupReceivedNewUser")
      socket.off("onGroupUserAdd")
    }
  }, [socket])

  return (
    <View style={styles.container}>
      <Pressable
        style={({ pressed }) => [
          {
            backgroundColor: pressed ? "#d0d5d7" : "#fff",
          },
          styles.friendRequestContainer,
        ]}
        onPress={() => setVisible(true)}
      >
        {({ pressed }) => (
          <View style={styles.friendRequestContainer}>
            <View style={styles.row}>
              <AntDesign name="addusergroup" style={styles.icon} />
              <Text style={[styles.text]}>Tạo group</Text>
            </View>
          </View>
        )}
      </Pressable>

      <SafeAreaView style={styles.listFriendContainer}>

        <View style={styles.padding}>
          <Text style={styles.text}>Danh Sách Nhóm</Text>
        </View>
        <ScrollView
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
        >
          {groups.map((group) => (
            <GroupItem key={group.id} group={group} navigation={navigation} />
          ))}
        </ScrollView>
      </SafeAreaView>

      <ModalAddGroup visible={visible} setVisible={setVisible} navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  friendRequestContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 12,
    width: "100%",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  padding: {
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  text: {
    fontSize: 18,
  },
  icon: {
    fontSize: 18,
    fontWeight: "600",
    backgroundColor: "#187afb",
    color: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    marginRight: 10,
  },
  listFriendContainer: {
    marginTop: 5,
    backgroundColor: "#fff",
    flex: 1,
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 12,
    alignItems: "center",
    paddingVertical: 12,
    borderBottomColor: "#d5d7db",
    borderBottomWidth: 1,
  },
  btnFilterAll: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    marginRight: 12,
  },
  activeBtnFilter: {
    backgroundColor: "#e9ebed",
  },
  inActiveBtnFilter: {
    borderColor: "#d5d7db",
    borderWidth: 1,
  },
  textInActive: {
    color: "#767a7f",
    fontWeight: "600",
  },
});
