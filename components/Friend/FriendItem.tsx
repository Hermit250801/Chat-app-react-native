import { View, Text, Pressable, StyleSheet, Image } from "react-native";
import { useContext, useState } from "react";

import Feather from "react-native-vector-icons/Feather";

import { CDN_URL } from "../../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { createConversationThunk, selectConversationById } from "../../store/conversationSlice";
import { AuthContext } from "../../utils/context/AuthContext";
import {
  fetchFriendsThunk,
  removeFriendThunk,
} from "../../store/friends/friendsThunk";

import AwesomeAlert from "react-native-awesome-alerts";

export default function FriendItem({
  friend,
  navigation,
  handleDeleteFriend,
  friendId,
}) {
  const avatar =
    (friend.profile !== null && CDN_URL.BASE.concat(friend.profile.avatar)) ||
    undefined;
  const conversations = useSelector(
    (state: RootState) => state.conversation.conversations
  );
  const { user } = useContext(AuthContext);
  const dispatch = useDispatch<AppDispatch>();

  const [openModal, setOpenModal] = useState(false);
  const [alertModal, setAlertModal] = useState(false);
  const handleRemoveFriend = () => {
    handleDeleteFriend(friendId);
    setOpenModal(false);
  };

  const handleViewFriendProfile = () => {
    navigation.navigate("FriendInfo", {
      user: friend,
    });
  };

  console.log(friend);

  const handleGetOrCreateConversation = () => {
    const data = {
      username: friend.username,
      message: "Hello",
    };
    console.log("Handle Create conversation")
    setOpenModal(false);
    const conversation = conversations.forEach((conv) => {
      if (
        conv.creator.id === user.id && conv.recipient.id === friend.id ||
        conv.creator.id === friend.id && conv.recipient.id === user.id||
        conv.recipient.id === user.id && conv.creator.id === friend.id ||
        conv.recipient.id === friend.id && conv.creator.id === friend.id
      ) {
        return navigation.navigate('ChatOne', {
          conversationId: conv.id,
          currentUser: friend,
        });
      }
    });

    dispatch(createConversationThunk(data));
    setAlertModal(true)
  };

  return (
    <Pressable onPress={() => handleGetOrCreateConversation()}>
      <Pressable
        style={({ pressed }) => [
          styles.container,
          {
            backgroundColor: pressed ? "#c0c3c4" : "transparent",
          },
        ]}
        onLongPress={() => setOpenModal(!openModal)}
        onPress={handleGetOrCreateConversation}
      >
        <View style={styles.row}>
          <Image
            source={
              (avatar && { uri: avatar }) || require("../../assets/user.png")
            }
            style={styles.avatar}
          />
          <Text style={styles.userName}>
            {friend.firstName} {friend.lastName}
          </Text>
        </View>

        <View style={styles.row}>
          <Pressable
            style={({ pressed }) => [
              styles.iconContact,
              {
                backgroundColor: pressed ? "#dee3e5" : "transparent",
              },
            ]}
          >
            <Feather name="phone" size={22} color={"#858d95"} />
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.iconContact,
              {
                backgroundColor: pressed ? "#dee3e5" : "transparent",
              },
            ]}
          >
            <Feather name="video" size={22} color={"#858d95"} />
          </Pressable>
        </View>
      </Pressable>

      {openModal && (
        <View style={styles.modalContainer}>
          <Pressable
            style={({ pressed }) => [
              {
                backgroundColor: pressed ? "#c0c3c4" : "#ea3333",
              },
              styles.deleteFriendContainer,
            ]}
            onPress={handleRemoveFriend}
          >
            <Text style={styles.textError}>Xóa bạn</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              {
                backgroundColor: pressed ? "#c0c3c4" : "transparent",
              },
              styles.profileFriendContainer,
            ]}
            onPress={handleViewFriendProfile}
          >
            <Text style={styles.text}>Xem profile</Text>
          </Pressable>
        </View>
      )}

      <AwesomeAlert
        show={alertModal}
        showProgress={false}
        title="Đã gửi lời chào đến bạn bè"
        message="Hãy qua mục tin nhắn để tiến hành trò chuyện"
        closeOnTouchOutside={true}
        closeOnHardwareBackPress={false}
        showCancelButton={false}
        showConfirmButton={true}
        confirmText="Ok"
        confirmButtonColor="#567af3"
        onConfirmPressed={() => {
          setAlertModal(false);
        }}
      />
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
    position: "relative",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  modalContainer: {
    position: "absolute",
    right: 100,
    bottom: 0,
    borderRadius: 10,
    zIndex: 999,
    elevation: 999,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  deleteFriendContainer: {
    backgroundColor: "#ea3333",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  profileFriendContainer: {
    backgroundColor: "#757171",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  avatar: {
    width: 50,
    height: 50,
    resizeMode: "cover",
    borderRadius: 100,
  },
  userName: {
    marginLeft: 12,
    fontSize: 16,
    color: "#272727",
    fontWeight: "600",
  },
  iconContact: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  textError: {
    textAlign: "center",
    color: "#FF9494",
    fontSize: 14,
    fontWeight: "600",
  },
  text: {
    textAlign: "center",
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
