import { View, Text, StyleSheet, Pressable } from "react-native";
import { useContext, useEffect, useRef } from "react";
import InputChat from "../InputChat/InputChat";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { updateType } from "../../store/selectedSlice";

import Ionicons from "react-native-vector-icons/Ionicons";
import Entypo from "react-native-vector-icons/Entypo";
import Messages from "../Messages/Messages";
import { AuthContext } from "../../utils/context/AuthContext";
import { SocketContext } from "../../utils/context/SocketContext";
import {
  addGroup,
  removeGroup,
  selectGroupById,
  updateGroup,
} from "../../store/groupSlice";
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
  selectGroupMessage
} from "../../store/groupMessageSlice";
import { createMessage } from "../../utils/api";
import { clearAllMessages } from "../../store/system-messages/systemMessagesSlice";

export default function GroupMessages({ route, navigation }) {
  const { group } = route.params;
  const dispatch = useDispatch<AppDispatch>();
  const scrollDown = useRef(null);

  const { user } = useContext(AuthContext);
  const socket = useContext(SocketContext);
  const groupItem = useSelector((state: RootState) =>
    selectGroupById(state, parseInt(group.id!))
  );

  const groupMessages = useSelector((state: RootState) =>
    selectGroupMessage(state, parseInt(group.id!))
  );
  useEffect(() => {
    dispatch(updateType("group"));
    if(!groupItem.id) {
      navigation.navigate("Nhóm");
    }
    dispatch(fetchGroupMessagesThunk(groupItem.id))
  }, []);

  const groupId = groupItem.id;
  const selectedType = useSelector(
    (state: RootState) => state.selectedConversationType.type
  );


  const sendTypingStatus = () => {};

  const sendMessage = async (values) => {
    const trimmedContent = values.message.trim();
    if (!groupId) return;
    if (!trimmedContent) return;
    const formData = new FormData();
    formData.append("id", groupId.toString());
    trimmedContent && formData.append("content", trimmedContent);
    try {
      await createMessage(groupId.toString(), selectedType, formData);
      dispatch(clearAllMessages());
      scrollDown.current && scrollDown.current.scrollToEnd({ animated: true });
    } catch (error) {
      console.log(error)
    }
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
      }
    );

    socket.on(
      "onGroupRecipientRemoved",
      ({ group }: RemoveGroupUserMessagePayload) => {
        console.log("onGroupRecipientRemoved");
        dispatch(updateGroup({ group }));
      }
    );

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

    socket.on("onGroupOwnerUpdate", (group: Group) => {
      console.log("received onGroupOwnerUpdate");
      dispatch(updateGroup({ group }));
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [
            {
              backgroundColor: pressed ? "#93989a" : "transparent",
            },
            styles.button,
          ]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={30} />
        </Pressable>

        <View>
          <Text style={styles.userName}>Nhóm: {group.title}</Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            {
              backgroundColor: pressed ? "#93989a" : "transparent",
            },
            styles.button,
          ]}
          onPress={() => navigation.navigate("GroupInfo", { group: group })}
        >
          <Entypo name="dots-three-horizontal" size={30} />
        </Pressable>
      </View>
      <View style={styles.body}>
        <Messages
          conversationId={groupItem.id}
          currentUser={user}
          scrollDown={scrollDown}
          key={groupItem.id}
          groupMessages={groupMessages}
        />
      </View>

      <View style={styles.footer}>
        <InputChat
          conversationId={groupItem.id}
          scrollDown={scrollDown}
          sendMessage={sendMessage}
          sendTypingStatus={sendTypingStatus}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  body: {
    flex: 16,
    position: "relative"
  },
  footer: {
    position: "absolute",
    bottom: 10,
    left: 4,
    right: 4,
  },
  button: {
    borderRadius: 100,
    borderColor: "#a4a8b7",
    borderWidth: 1,
    height: 40,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  userName: {
    color: "#232531",
    fontWeight: "600",
    textAlign: "center",
    fontSize: 18,
  },
});
