import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  SafeAreaView,
  ScrollView,
  TouchableWithoutFeedback,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";

import Ionicons from "react-native-vector-icons/Ionicons";
import Entypo from "react-native-vector-icons/Entypo";
import AntDesign from "react-native-vector-icons/AntDesign";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import { AuthContext } from "../../utils/context/AuthContext";
import { SocketContext } from "../../utils/context/SocketContext";
import {
  AddGroupUserMessagePayload,
  RemoveGroupUserMessagePayload,
  Group,
  GroupParticipantLeftPayload,
  UpdateGroupAction,
} from "../../utils/types";
import {
  addGroup,
  fetchGroupsThunk,
  removeGroup,
  removeGroupRecipientThunk,
  selectGroupById,
  setSelectedGroup,
  updateGroup,
  updateGroupOwnerThunk,
} from "../../store/groupSlice";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import ModalAddMember from "../../components/ModalAddMember/ModalAddMember";

export default function MemberScreen({ navigation, route }) {
  const { group } = route.params;
  const { user } = useContext(AuthContext);
  const [openModal, setOpenModal] = useState(false);
  const [modalAction, setModalAction] = useState(0);
  const [modalAddMember, setModalAddMember] = useState(false);
  const [users, setUsers] = useState([]);
  const [usersGroup, setUsersGroup] = useState([]);
  const dispatch = useDispatch<AppDispatch>();
  const socket = useContext(SocketContext);
  const groupItem = useSelector((state: RootState) =>
    selectGroupById(state, group.id)
  );
  const [newGroup, setNewGroup] = useState(groupItem);

  const handleTouchOutSide = () => {
    setOpenModal(false);
    setModalAction(0);
    setModalAddMember(false);
    setUsersGroup([])
    setUsers([])
  };

  const handleKickUser = (item) => {
    dispatch(
      removeGroupRecipientThunk({
        id: groupItem.id,
        userId: item.id,
      })
    );
    setModalAction(0);
  };

  const handleChangeOwner = (item) => {
    dispatch(
      updateGroupOwnerThunk({
        id: groupItem.id,
        newOwnerId: item.id,
      })
    );
    setModalAction(0);
  };

  useEffect(() => {
    socket.on("onGroupOwnerUpdate", (group: Group) => {
      console.log("received onGroupOwnerUpdate");
      console.log("Group In Socket: ", group);
      dispatch(updateGroup({ group }));
      setNewGroup(group);
    });

    socket.on(
      "onGroupReceivedNewUser",
      ({ group }: AddGroupUserMessagePayload) => {
        console.log("Received onGroupReceivedNewUser");
        dispatch(updateGroup({ group }));
        setNewGroup(group);
      }
    );

    socket.on("onGroupUserAdd", (payload: AddGroupUserMessagePayload) => {
      console.log("onGroupUserAdd");
      console.log(payload);
      dispatch(addGroup(payload.group));
    });

    socket.on("onGroupRemoved", (payload: RemoveGroupUserMessagePayload) => {
      dispatch(removeGroup(payload.group));
      if (group.id && parseInt(group.id) === payload.group.id) {
        console.log("Navigating User to /groups");
      }
    });

    socket.on(
      "onGroupParticipantLeft",
      ({ group, userId }: GroupParticipantLeftPayload) => {
        console.log("onGroupParticipantLeft received");
        dispatch(updateGroup({ group }));
        if (userId === user?.id) {
          console.log("payload.userId matches user.id...");
          dispatch(removeGroup(group));
        }
      }
    );
    return () => {
      socket.off("onGroupOwnerUpdate");
      socket.off("onGroupReceivedNewUser");
      socket.off("onGroupRecipientRemoved");
      socket.off("onGroupParticipantLeft");
      socket.off("onGroupReceivedNewUser");
    };
  }, [groupItem.id]);

  return (
    <View style={styles.container}>
      <View style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={handleTouchOutSide}>
          <View style={{ flex: 1 }}>
            <View style={styles.header}>
              <Pressable onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={30} color={"#fff"} />
              </Pressable>
              <Text style={styles.title}>Thành viên</Text>
            </View>

            <SafeAreaView style={styles.body}>
              <View style={styles.bodyHeader}>
                <Text style={styles.memberTitle}>
                  Thành viên ({groupItem.users.length})
                </Text>

                <Pressable
                  style={({ pressed }) => [
                    styles.btnAction,
                    {
                      backgroundColor: pressed ? "#d9dfeb" : "transparent",
                    },
                  ]}
                  onPress={() => setOpenModal(!openModal)}
                >
                  <Entypo
                    name="dots-three-vertical"
                    size={20}
                    color={"#767676"}
                  />
                </Pressable>

                {openModal && (
                  <View style={styles.actions}>
                    <Pressable
                      style={({ pressed }) => [
                        styles.btnAction,
                        {
                          backgroundColor: pressed ? "#d9dfeb" : "transparent",
                        },
                      ]}
                      onPress={() => setModalAddMember(true)}
                    >
                      <Text>Thêm thành viên</Text>
                    </Pressable>
                  </View>
                )}
              </View>
              <ScrollView
                contentContainerStyle={{
                  flexGrow: 1,
                }}
              >
                {groupItem.users.map((item) => (
                  <View style={styles.bodyMemberContainer} key={item.id}>
                    <Pressable
                      style={({ pressed }) => [
                        styles.btnAction,
                        {
                          backgroundColor: pressed ? "#d9dfeb" : "transparent",
                        },
                        styles.member,
                      ]}
                      onLongPress={() => setModalAction(item.id)}
                    >
                      <View style={styles.memberItem}>
                        <Image
                          style={styles.avatar}
                          source={require("../../assets/user.png")}
                        />
                        <Text style={styles.btnDetailsText}>
                          {(item.id === user.id && "Bạn") ||
                            `${item.firstName} ${item.lastName}`}
                        </Text>
                        {groupItem.owner.id === item.id && (
                          <FontAwesome5
                            name="crown"
                            size={15}
                            color={"#efde68"}
                          />
                        )}
                      </View>
                    </Pressable>
                    {modalAction === item.id && item.id !== user.id && (
                      <View style={styles.actionsMember}>
                        <Pressable
                          style={({ pressed }) => [
                            styles.btnAction,
                            {
                              backgroundColor: pressed
                                ? "#d9dfeb"
                                : "transparent",
                            },
                          ]}
                        >
                          <Text>Xem profile</Text>
                        </Pressable>

                        {groupItem.owner.id === user.id && (
                          <>
                            <Pressable
                              style={({ pressed }) => [
                                styles.btnAction,
                                {
                                  backgroundColor: pressed
                                    ? "#d9dfeb"
                                    : "transparent",
                                },
                              ]}
                              onPress={() => handleChangeOwner(item)}
                            >
                              <Text style={{ color: "#d0b924" }}>
                                Đổi trưởng nhóm
                              </Text>
                            </Pressable>
                            {groupItem.owner.id === user.id && (
                              <Pressable
                                style={({ pressed }) => [
                                  styles.btnAction,
                                  {
                                    backgroundColor: pressed
                                      ? "#d9dfeb"
                                      : "transparent",
                                  },
                                ]}
                                onPress={() => handleKickUser(item)}
                              >
                                <Text style={styles.colorWarning}>
                                  Đuổi thành viên
                                </Text>
                              </Pressable>
                            )}
                          </>
                        )}
                      </View>
                    )}
                  </View>
                ))}
              </ScrollView>
            </SafeAreaView>
          </View>
        </TouchableWithoutFeedback>
      </View>
      <ModalAddMember
          group={groupItem}
          navigation={navigation}
          visible={modalAddMember}
          setVisible={setModalAddMember}
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
  header: {
    backgroundColor: "#0aa9fb",
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  body: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    flex: 1,
  },
  bodyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  bodyMemberContainer: {},
  member: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  memberItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    height: 50,
    width: 50,
  },
  memberTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1d79bc",
  },
  actions: {
    position: "absolute",
    right: 0,
    top: 30,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    elevation: 999,
    zIndex: 999,
  },
  actionsMember: {
    position: "absolute",
    left: 150,
    top: 10,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    elevation: 999,
    zIndex: 999,
  },

  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginLeft: 6,
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
    borderRadius: 100,
    paddingHorizontal: 6,
    paddingVertical: 6,
    position: "relative",
  },

  btnDetailsText: {
    fontSize: 16,
    color: "#272727",
    marginLeft: 10,
    marginRight: 10,
  },

  colorWarning: {
    color: "#fe5051",
  },
});
