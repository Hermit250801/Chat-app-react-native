import { View, Text, Pressable, StyleSheet, Image } from "react-native";
import { useContext, useState } from "react";

import Feather from "react-native-vector-icons/Feather";

import { CDN_URL } from "../../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { selectConversationById } from "../../store/conversationSlice";
import { AuthContext } from "../../utils/context/AuthContext";
import { fetchFriendsThunk, removeFriendThunk } from "../../store/friends/friendsThunk";

export default function FriendItem({ friend, navigation, handleDeleteFriend, friendId }) {
  const avatar =
    (friend.profile !== null && CDN_URL.BASE.concat(friend.profile.avatar)) ||
    undefined;
  const conversations = useSelector(
    (state: RootState) => state.conversation.conversations
  );
  const { user } = useContext(AuthContext);
  const dispatch = useDispatch<AppDispatch>();

  const [openModal, setOpenModal] = useState(false);
  const handleRemoveFriend = () => {
    handleDeleteFriend(friendId);
    setOpenModal(false);
  }

  return (
    <Pressable onPress={() => setOpenModal(false)}>
      <Pressable
        style={({ pressed }) => [
          styles.container,
          {
            backgroundColor: pressed ? "#c0c3c4" : "transparent",
          },
        ]}
        onLongPress={() => setOpenModal(!openModal)}
        
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
        <Pressable
          style={({ pressed }) => [
            {
              backgroundColor: pressed ? "#c0c3c4" : "#ea3333",
            },
            styles.deleteFriendContainer
          ]}
          onPress={handleRemoveFriend}
        >
          <Text style={styles.textError}>Xóa bạn</Text>
        </Pressable>
      )}
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
    position: "relative"
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  deleteFriendContainer: {
    backgroundColor: "#ea3333",
    position: "absolute",
    right: 100,
    bottom: 0,
    borderRadius: 10,
    zIndex: 999,
    elevation: 999,
    paddingHorizontal: 12,
    paddingVertical: 6
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
});
