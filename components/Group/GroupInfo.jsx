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

import { updateGroupDetails } from "../../utils/api.ts"

import ModalAddMember from "../ModalAddMember/ModalAddMember";
import { AuthContext } from "../../utils/context/AuthContext";
import { CDN_URL } from "../../utils/constants";
import * as ImagePicker from "expo-image-picker";

export default function GroupInfo({ navigation, route }) {
  const { group } = route.params;
  const dispatch = useDispatch();
  const { user } = useContext(AuthContext);
  const [visible, setVisible] = useState(false);
  const socket = useContext(SocketContext);
  const [users, setUsers] = useState([]);
  const [usersGroup, setUsersGroup] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);

  const groupItem = useSelector((state) =>
    selectGroupById(state, parseInt(group.id))
  );

  console.log("Group id: ", groupItem.id)

  const avatar =
    (groupItem.avatar !== null && CDN_URL.BASE.concat(groupItem.avatar)) ||
    undefined;

  const handleLeftGroup = () => {
    if (user.id !== group.owner.id) {
      dispatch(leaveGroupThunk(group.id)).finally(() =>
        dispatch(toggleContextMenu(false))
      );
      dispatch(fetchGroupsThunk());
      navigation.navigate("Nh??m");
    } else {
      
    }
  };

  const handleAddUserGroup = () => {};

  const pickAvatar = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
    });

    console.log(result);

    if (result.cancelled === false) {
      let localUri = result.uri;
      let filename = localUri.split("/").pop();

      let match = /\.(\w+)$/.exec(filename);
      let type = match ? `image/${match[1]}` : `image`;
      const formData = new FormData();
      formData.append("avatar", { uri: localUri, name: filename, type });
      setImagePreview(result.uri);

      return await fetch(`${process.env.REACT_APP_API_URL}/groups/${groupItem.id}/details`, {
        method: 'PATCH',
        body: formData,
        headers: {
          'content-type': 'multipart/form-data',
        },
      });
    }
  };

  useEffect(() => {
    socket.emit("onGroupJoin", { groupId: groupItem.id });
    socket.on("onGroupUserAdd", (payload) => {
      console.log("onGroupUserAdd");
      console.log(payload);
      dispatch(addGroup(payload.group));
    });
    socket.on("onGroupUserAdd", (payload) => {
      console.log("onGroupUserAdd");
      console.log(payload);
      dispatch(addGroup(payload.group));
      dispatch(fetchGroupsThunk());
    });
    socket.on(
      "onGroupRecipientRemoved",
      ({ group }) => {
        console.log("onGroupRecipientRemoved");
        dispatch(updateGroup({ group }));
        dispatch(fetchGroupsThunk());
      }
    );
    socket.on(
      "onGroupParticipantLeft",
      ({ group, userId }) => {
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
        <Text style={styles.title}>T??y ch???n</Text>
      </View>
      <View style={styles.wrapper}>
        <View style={styles.body}>
          <View>
            <Text style={styles.groupName}>Nh??m {groupItem.title}</Text>
          </View>

          <View>
            <Image
              source={
                (imagePreview && {uri: imagePreview} || avatar && { uri: avatar }) || require("../../assets/user.png")
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

              <Text style={styles.textCenter}>Th??m th??nh vi??n</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.action,
                {
                  backgroundColor: pressed ? "#d9dfeb" : "transparent",
                },
              ]}
              onPress={() => pickAvatar()}
            >
              <View style={styles.btnAction}>
                <AntDesign name="edit" size={30} />
              </View>
              <Text style={styles.textCenter}>?????i avatar nh??m</Text>
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
              <Text style={styles.btnDetailsText}>Xem th??nh vi??n</Text>
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
                X??a l???ch s??? tr?? chuy???n
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
                {(groupItem.owner.id === user.id && "Gi???i t??n nh??m") ||
                  "R???i nh??m"}
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
