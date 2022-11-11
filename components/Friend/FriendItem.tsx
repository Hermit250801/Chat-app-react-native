import { View, Text, Pressable, StyleSheet, Image } from "react-native";
import { useContext } from "react";

import Feather from "react-native-vector-icons/Feather";

import { CDN_URL } from "../../utils/constants";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { selectConversationById } from "../../store/conversationSlice";
import { AuthContext } from "../../utils/context/AuthContext";

export default function FriendItem({ friend, navigation }) {
  const avatar =
    (friend.profile !== null && CDN_URL.BASE.concat(friend.profile.avatar)) ||
    undefined;
  const conversations = useSelector(
    (state: RootState) => state.conversation.conversations
  );
  const { user } = useContext(AuthContext);


  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: pressed ? "#c0c3c4" : "transparent",
        },
      ]}
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
});
