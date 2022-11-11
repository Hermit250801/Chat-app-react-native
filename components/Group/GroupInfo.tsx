import {
  View,
  Text,
  Pressable,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import Ionicons from "react-native-vector-icons/Ionicons";
import AntDesign from "react-native-vector-icons/AntDesign";
import { SocketContext } from "../../utils/context/SocketContext";
import {
  AddGroupUserMessagePayload,
  Group,
  GroupMessageEventPayload,
  GroupParticipantLeftPayload,
  RemoveGroupUserMessagePayload,
} from "../../utils/types";
import { addGroupMessage } from "../../store/groupMessageSlice";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import {
  addGroup,
  fetchGroupsThunk,
  leaveGroupThunk,
  removeGroup,
  selectGroupById,
  toggleContextMenu,
  updateGroup,
} from "../../store/groupSlice";
import ModalAddMember from "../ModalAddMember/ModalAddMember";
import { AuthContext } from "../../utils/context/AuthContext";
import { CDN_URL } from "../../utils/constants";

export default function GroupInfo({ navigation, route }) {
  const { group } = route.params;
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useContext(AuthContext);
  const [visible, setVisible] = useState(false);
  const socket = useContext(SocketContext);
  const [users, setUsers] = useState([]);
  const [usersGroup, setUsersGroup] = useState([]);

  const groupItem = useSelector((state: RootState) =>
    selectGroupById(state, parseInt(group.id!))
  );

  const avatar =
    (groupItem.avatar !== null && CDN_URL.BASE.concat(groupItem.avatar)) ||
    undefined;

  const handleLeftGroup = () => {
    if (user.id !== group.owner.id) {
      dispatch(leaveGroupThunk(group.id)).finally(() =>
        dispatch(toggleContextMenu(false))
      );
      dispatch(fetchGroupsThunk());
      navigation.navigate("Nhóm");
    }
  };

  const handleAddUserGroup = () => {};

  useEffect(() => {
    socket.emit("onGroupJoin", { groupId: groupItem.id });
    socket.on("onGroupUserAdd", (payload: AddGroupUserMessagePayload) => {
      console.log("onGroupUserAdd");
      console.log(payload);
      dispatch(addGroup(payload.group));
    });
    socket.on("onGroupUserAdd", (payload: AddGroupUserMessagePayload) => {
      console.log("onGroupUserAdd");
      console.log(payload);
      dispatch(addGroup(payload.group));
      dispatch(fetchGroupsThunk());
    });
    socket.on(
      "onGroupRecipientRemoved",
      ({ group }: RemoveGroupUserMessagePayload) => {
        console.log("onGroupRecipientRemoved");
        dispatch(updateGroup({ group }));
        dispatch(fetchGroupsThunk());
      }
    );
    socket.on(
      "onGroupParticipantLeft",
      ({ group, userId }: GroupParticipantLeftPayload) => {
        console.log("onGroupParticipantLeft received");
        dispatch(updateGroup({ group }));
        if (userId === user?.id) {
          console.log("payload.userId matches user.id...");
          dispatch(removeGroup(group));
          dispatch(fetchGroupsThunk());
        }
      }
    );
    return () => {
      socket.off("onGroupUserAdd");
      socket.off("onGroupUserAdd");
      socket.off("onGroupRecipientRemoved");
      socket.off("onGroupParticipantLeft");
    };
  }, [groupItem.id]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={30} color={"#fff"} />
        </Pressable>
        <Text style={styles.title}>Tùy chọn</Text>
      </View>
      <View style={styles.wrapper}>
        <View style={styles.body}>
          <View>
            <Text style={styles.groupName}>Nhóm {groupItem.title}</Text>
          </View>

          <View>
            <Image
              source={
                (avatar && { uri: avatar }) || require("../../assets/user.png")
              }
              style={styles.avatar}
            />
          </View>

          <View style={styles.actionContainer}>
            <Pressable
              style={({ pressed }) => [
                styles.action,
                {
                  backgroundColor: pressed ? "#d9dfeb" : "transparent",
                },
              ]}
              onPress={() => setVisible(true)}
            >
              <View style={styles.btnAction}>
                <AntDesign name="adduser" size={30} />
              </View>

              <Text style={styles.textCenter}>Thêm thành viên</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.action,
                {
                  backgroundColor: pressed ? "#d9dfeb" : "transparent",
                },
              ]}
            >
              <View style={styles.btnAction}>
                <AntDesign name="edit" size={30} />
              </View>
              <Text style={styles.textCenter}>Đổi avatar nhóm</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.btnActionsContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.btnActions,
              {
                backgroundColor: pressed ? "#d9dfeb" : "transparent",
              },
            ]}
            onPress={() =>
              navigation.navigate("MemberInfo", { group: groupItem })
            }
          >
            <AntDesign name="user" size={30} color={"#848d94"} />
            <View style={styles.btnDetails}>
              <Text style={styles.btnDetailsText}>Xem thành viên</Text>
              <Text style={styles.textNumber}>({groupItem.users.length})</Text>
            </View>
          </Pressable>
        </View>

        <View style={styles.btnActionsContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.btnActions,
              {
                backgroundColor: pressed ? "#d9dfeb" : "transparent",
              },
            ]}
          >
            <AntDesign name="delete" size={30} color={"#848d94"} />
            <View style={styles.btnDetails}>
              <Text style={[styles.btnDetailsText, styles.colorWarning]}>
                Xóa lịch sử trò chuyện
              </Text>
            </View>
          </Pressable>
        </View>

        <View style={styles.btnActionsContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.btnActions,
              {
                backgroundColor: pressed ? "#d9dfeb" : "transparent",
              },
            ]}
            onPress={() => handleLeftGroup()}
          >
            <AntDesign name="delete" size={30} color={"#848d94"} />
            <View style={styles.btnDetails}>
              <Text style={[styles.btnDetailsText, styles.colorWarning]}>
                {(groupItem.owner.id === user.id && "Giải tán nhóm") ||
                  "Rời nhóm"}
              </Text>
            </View>
          </Pressable>
        </View>
      </View>

      <ModalAddMember
        setVisible={setVisible}
        visible={visible}
        navigation={navigation}
        group={groupItem}
        users={users}
        setUsers={setUsers}
        usersGroup={usersGroup}
        setUsersGroup={setUsersGroup}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  wrapper: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  header: {
    backgroundColor: "#0aa9fb",
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  body: {
    alignItems: "center",
  },
  avatar: {
    height: 80,
    width: 80,
    borderRadius: 100,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginLeft: 6,
  },
  groupName: {
    fontSize: 18,
    fontWeight: "600",
    paddingVertical: 4,
  },
  actionContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  action: {
    alignItems: "center",
    maxWidth: 100,
    marginLeft: 10,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  btnAction: {
    backgroundColor: "#d9dfeb",
    paddingHorizontal: 6,
    paddingVertical: 6,
    borderRadius: 100,
  },
  textCenter: {
    textAlign: "center",
  },
  btnActionsContainer: {
    flexDirection: "row",
    marginHorizontal: -12,
    marginVertical: -8,
    marginTop: 10,
  },
  btnActions: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingHorizontal: 8,
  },
  btnDetails: {
    flex: 1,
    flexDirection: "row",
    marginLeft: 15,
    borderBottomColor: "#dadddf",
    borderBottomWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  btnDetailsText: {
    fontSize: 16,
    color: "#272727",
  },
  textNumber: {
    fontSize: 16,
    color: "#848d94",
    marginLeft: 10,
  },
  colorWarning: {
    color: "#fe5051",
  },
});
