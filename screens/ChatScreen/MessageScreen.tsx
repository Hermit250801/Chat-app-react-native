import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  SafeAreaView,
  ScrollView,
  Modal,
  ActivityIndicator,
} from "react-native";
import Entypo from "react-native-vector-icons/Entypo";
import EvilIcons from "react-native-vector-icons/EvilIcons";
import Dialog, { DialogContent } from "react-native-popup-dialog";
import { useState, useEffect, useContext } from "react";

import Conversation from "../../components/Conversations/Conversation";
import { ConversationType, MessageEventPayload, User } from "../../utils/types";
import { SocketContext } from "../../utils/context/SocketContext";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { fetchConversationsThunk } from "../../store/conversationSlice";
import { AuthContext } from "../../utils/context/AuthContext";
import { useAuth } from "../../utils/hooks/useAuth";
import { logoutUser } from "../../utils/api";


export default function MessageScreen({ navigation }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [lastMessage, setLastMessage] = useState({ id: null });
  const [unReadMsgNumber, setUnReadMsgNumber] = useState(0);
  const socket = useContext(SocketContext);

  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth();

  const { conversations } = useSelector(
    (state: RootState) => state.conversation
  );

  const handleFormatConversation = () => {
    return conversations.map((item) => {
      const creator = item.creator;
      const recipient = item.recipient;
      const currentUserId = user.id;
      if (currentUserId !== recipient.id) {
        return (
          <Conversation
            key={recipient.id}
            navigation={navigation}
            user={recipient}
            conversation={item}
            unReadMsgNumber={unReadMsgNumber}
            setUnReadMsgNumber={setUnReadMsgNumber}
            lastMessage={lastMessage}
          />
        );
      } else {
        return (
          <Conversation
            key={creator.id}
            navigation={navigation}
            user={creator}
            conversation={item}
            unReadMsgNumber={unReadMsgNumber}
            setUnReadMsgNumber={setUnReadMsgNumber}
            lastMessage={lastMessage}
          />
        );
      }
    })
  }

  const handleLogout = async () => {
    try {
      await logoutUser();
      setModalVisible(false);
      socket.disconnect();
      navigation.navigate("Home");
    } catch (error) {
      console.log(error);
      console.log("Fail in Logout");
    }
  };

  useEffect(() => {
    dispatch(fetchConversationsThunk());
  }, []);

  useEffect(() => {
    socket.on("onMessage", (payload: MessageEventPayload) => {
      console.log("Message Received");
      const { conversation, message } = payload;
      dispatch(fetchConversationsThunk());
      setLastMessage(message);
      setUnReadMsgNumber((prev) => prev + 1);
    });
    return () => {
      socket.off("onMessage")
      setUnReadMsgNumber(0)
    }
  }, [socket]);

  return (
    <SafeAreaView style={styles.wrapper}>
      <ScrollView
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Tin nhắn</Text>
            <Pressable onPress={() => setModalVisible(true)}>
              <Entypo name="dots-three-horizontal" style={styles.barIcon} />
            </Pressable>
          </View>

          <View style={styles.search}>
            <Pressable>
              <EvilIcons name="search" style={styles.searchIcon} />
            </Pressable>
            <TextInput
              style={styles.textInput}
              placeholder="Tìm kiếm cuộc trò chuyện"
              placeholderTextColor={"#a4a8b7"}
            />
            <Dialog
              animationType="slide"
              visible={modalVisible}
              onTouchOutside={() => {
                setModalVisible(false);
              }}
            >
              <DialogContent>
                <View style={styles.modal}>
                  <Pressable onPress={() => handleLogout()}>
                    <Text>Đăng xuất</Text>
                  </Pressable>
                </View>
              </DialogContent>
            </Dialog>
          </View>
          <View style={styles.conversation}>
            {handleFormatConversation()}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    justifyContent: "space-between",
  },
  title: {
    fontSize: 26,
    fontWeight: "600",
  },
  modal: {
    backgroundColor: "#e8f6fc",
  },
  barIcon: {
    fontSize: 24,
    height: 34,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: "#a4a8b7",
    textAlign: "center",
    lineHeight: 34,
    paddingHorizontal: 2,
  },
  search: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
    borderRadius: 100,
    backgroundColor: "#cacede",
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 14,
  },
  searchIcon: {
    fontSize: 24,
    fontWeight: "600",
  },
  textInput: {
    fontSize: 14,
    fontWeight: "600",
    width: "90%",
  },
  conversation: {
    marginTop: 30,
  },
});
