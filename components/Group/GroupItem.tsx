import { View, Text, Pressable, StyleSheet, Image } from "react-native";
import { useContext, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { SocketContext } from "../../utils/context/SocketContext";
import {
  AddGroupUserMessagePayload,
  Group,
  GroupMessageEventPayload,
  GroupMessageType,
  GroupParticipantLeftPayload,
  RemoveGroupUserMessagePayload,
  UpdateGroupAction,
} from "../../utils/types";
import {
  addGroupMessage,
  editGroupMessage,
  fetchGroupMessagesThunk,
  selectGroupMessage,
} from "../../store/groupMessageSlice";
import {
  addGroup,
  fetchGroupsThunk,
  removeGroup,
  selectGroupById,
  updateGroup,
} from "../../store/groupSlice";
import { AuthContext } from "../../utils/context/AuthContext";

// import Feather from "react-natirve-vector-icons/Feather";

import { CDN_URL } from "../../utils/constants";
import Moment from "moment";
import { updateType } from "../../store/selectedSlice";

export default function GroupItem({ group, navigation }) {
  const groupItem = useSelector((state: RootState) =>
    selectGroupById(state, parseInt(group.id!))
  );

  const avatar =
    (groupItem.avatar !== null && CDN_URL.BASE.concat(groupItem.avatar)) ||
    undefined;

  const handleNavigationGroupMessage = () => {
    dispatch(updateType("group"));
    navigation.navigate("ChatGroup", {
      group: groupItem,
    });
  };


  const groupMessages = useSelector((state: RootState) =>
    selectGroupMessage(state, groupItem.id!)
  );

  const dispatch = useDispatch<AppDispatch>();
  const socket = useContext(SocketContext);
  const { user } = useContext(AuthContext);

  const handleLastMessageAt = () => {
    const currentDate = new Date();
    const lastMessageTime = new Date(groupItem.lastMessageSentAt);
    const daysBetween = Math.abs(
      currentDate.getDate() - lastMessageTime.getDate()
    );
    if (daysBetween === 0) {
      const hours = parseInt(
        Moment(groupItem.lastMessageSentAt)
          .format("HH:mm")
          .toString()
          .split(":")[0]
      );
      const mintues = Moment(groupItem.lastMessageSentAt)
        .format("HH:mm")
        .toString()
        .split(":")[1];
      if (hours >= 12) {
        return `${hours}:${mintues} PM`;
      }
      return `${hours}:${mintues} AM`;
    } else if (daysBetween <= 7) {
      return `${daysBetween} ngày trước`;
    } else {
      const date = Moment(groupItem.lastMessageSentAt).format("DD/MM/YYYY");
      return `${date}`;
    }
  };

  const handleFormatLastContent = () => {
    let lastContent = "";
    groupMessages &&
      groupMessages.messages.forEach((groupMessage) => {
        if (groupMessage.id === groupItem.lastMessageSent.id) {
          lastContent = `${groupMessage.author.firstName} ${groupMessage.author.lastName}: ${groupItem.lastMessageSent.content}`;
        }
      });
    return lastContent;
  };

  useEffect(() => {
    socket.emit("onGroupJoin", { groupId: groupItem.id });
    socket.on("onGroupMessageUpdate", (message: GroupMessageType) => {
      console.log("onGroupMessageUpdate received");
      console.log(message);
      dispatch(editGroupMessage(message));
    });
    socket.on("onGroupMessage", (payload: GroupMessageEventPayload) => {
      console.log("Group Message Received");
      const { group } = payload;
      dispatch(addGroupMessage(payload));
      dispatch(updateGroup({ type: UpdateGroupAction.NEW_MESSAGE, group }));
    });

    socket.on("onGroupCreate", (payload: Group) => {
      console.log("Group Created...");
      dispatch(addGroup(payload));
    });

    /**
     * Adds the group for the user being added
     * to the group.
     */
    socket.on("onGroupUserAdd", (payload: AddGroupUserMessagePayload) => {
      console.log("onGroupUserAdd");
      console.log(payload);
      dispatch(addGroup(payload.group));
      dispatch(fetchGroupsThunk());
    });

    /**
     * Update all other clients in the room
     * so that they can also see the participant
     */
    socket.on(
      "onGroupReceivedNewUser",
      ({ group }: AddGroupUserMessagePayload) => {
        console.log("Received onGroupReceivedNewUser");
        dispatch(updateGroup({ group }));
        dispatch(fetchGroupsThunk());
      }
    );

    socket.on(
      "onGroupRecipientRemoved",
      ({ group }: RemoveGroupUserMessagePayload) => {
        console.log("onGroupRecipientRemoved");
        dispatch(updateGroup({ group }));
        dispatch(fetchGroupsThunk());
      }
    );

    socket.on("onGroupRemoved", (payload: RemoveGroupUserMessagePayload) => {
      dispatch(removeGroup(payload.group));
      if (group.id && parseInt(group.id) === payload.group.id) {
        console.log("Navigating User to /groups");
        dispatch(fetchGroupsThunk());
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
          dispatch(fetchGroupsThunk());
        }
      }
    );

    socket.on("onGroupOwnerUpdate", (group: Group) => {
      console.log("received onGroupOwnerUpdate");
      dispatch(updateGroup({ group }));
      dispatch(fetchGroupsThunk());
    });

    return () => {
      socket.off("onGroupMessage");
      socket.off("onGroupCreate");
      socket.off("onGroupUserAdd");
      socket.off("onGroupReceivedNewUser");
      socket.off("onGroupRecipientRemoved");
      socket.off("onGroupRemoved");
      socket.off("onGroupParticipantLeft");
      socket.off("onGroupOwnerUpdate");
    };
  }, [group.id]);

  useEffect(() => {
    dispatch(fetchGroupMessagesThunk(groupItem.id))
  }, [])

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: pressed ? "#c0c3c4" : "transparent",
        },
      ]}
      onPress={handleNavigationGroupMessage}
    >
      <View style={styles.row}>
        <Image
          source={
            (avatar && { uri: avatar }) || require("../../assets/user.png")
          }
          style={styles.avatar}
        />
        <View style={styles.containerMessageInfo}>
          <View>
            <Text style={styles.userName}>Nhóm: {group.title}</Text>
            {groupItem.lastMessageSent !== null && (
              <Text style={styles.messageContent}>
                {handleFormatLastContent()}
              </Text>
            )}
          </View>

          <View>
            <Text style={styles.messagelastTime}>{handleLastMessageAt()}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  containerMessageInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 100,
  },
  userName: {
    fontSize: 16,
    color: "#272727",
    fontWeight: "600",
  },
  iconContact: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  messagelastTime: {
    color: "#bfc3d0",
    fontWeight: "600",
  },
  messageContent: {
    color: "#bfc3d0",
    fontWeight: "600",
  },
});
