import { View, Text, StyleSheet, Image, Pressable } from "react-native";
import React from "react";
import { useAuth } from "../../utils/hooks/useAuth";
import Moment from "moment";
import { HandleFriendRequestAction } from "../../utils/types";
import {
  acceptFriendRequestThunk,
  cancelFriendRequestThunk,
  fetchFriendRequestThunk,
  fetchFriendsThunk,
  rejectFriendRequestThunk,
} from "../../store/friends/friendsThunk";
import { useDispatch } from "react-redux";
import Toast from "react-native-toast-message";

import { AppDispatch } from "../../store";
import { fetchFriends } from "../../utils/api";

export default function FriendRequestItem({ request }) {
  const { loading, user } = useAuth();
  const dispatch = useDispatch<AppDispatch>();

  const handleFormatDate = () => {
    const date = Moment(request.createAt).format("DD/MM/YYYY");
    return `${date}`;
  };

  const handleAcceptFriend = () => {
    handleFriendRequest("accept");
  };

  const handleFriendRequest = (type?: HandleFriendRequestAction) => {
    switch (type) {
      case "accept": {
        Toast.show({
          type: "success",
          text1: "Kết bạn thành công!!",
          text2: "Hãy gửi lời chào đến bạn mới!!👋",
        });
        dispatch(acceptFriendRequestThunk(request.id));
        dispatch(fetchFriendsThunk());
      }
      case "reject": {
        Toast.show({
          type: "success",
          text1: "Đã hủy lời mời kết bạn!!",
        });
         dispatch(rejectFriendRequestThunk(request.id));
         dispatch(fetchFriendRequestThunk())
      }
      default: {
        dispatch(cancelFriendRequestThunk(request.id));
        dispatch(fetchFriendRequestThunk());
      }
    }
  };

  return (
    <View key={request.id}>
      <View style={styles.listFriendRequest}>
        <Image
          source={require("../../assets/user.png")}
          style={styles.avatar}
        />
        <View style={styles.friendRequestInfo}>
          <Text style={styles.userName}>
            {(request.receiver.id === user.id &&
              `${request.sender.firstName} ${request.sender.lastName}`)}
          </Text>
          <Text style={styles.createAt}>{handleFormatDate()}</Text>
          <View style={styles.btnContainer}>
            <Pressable
              style={({ pressed }) => [
                styles.btn,
                styles.mr8,
                styles.btnReject,
                { backgroundColor: pressed ? "#f0f8fb" : "#f3f4f8" },
              ]}
              onPress={() => handleFriendRequest("reject")}
            >
              <Text style={styles.textReject}>Từ chối</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.btn,
                styles.btnAccept,
                { backgroundColor: pressed ? "#f3f4f8" : "#f0f8fb" },
              ]}
              onPress={() => handleAcceptFriend()}
            >
              <Text style={styles.textAccept}>Đồng ý</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  dateContainer: {
    borderBottomColor: "#ebebeb",
    borderBottomWidth: 2,
    paddingVertical: 12,
  },
  date: {
    fontSize: 18,
    fontWeight: "600",
  },
  listFriendRequest: {
    flexDirection: "row",
    paddingVertical: 12,
    alignItems: "center",
    borderBottomColor: "#ebebeb",
    borderBottomWidth: 2,
  },
  avatar: {
    width: 50,
    height: 50,
  },
  friendRequestInfo: {
    paddingLeft: 16,
  },
  btnContainer: {
    flexDirection: "row",
  },
  btn: {
    paddingHorizontal: 35,
    paddingVertical: 8,
    borderRadius: 100,
    marginTop: 4,
  },
  btnAccept: {
    backgroundColor: "#f0f8fb",
  },
  btnReject: {
    backgroundColor: "#f3f4f8",
  },
  textAccept: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1194ff",
  },
  textReject: {
    fontSize: 16,
    fontWeight: "600",
  },
  mr8: {
    marginRight: 8,
  },
  userName: {
    fontSize: 18,
    fontWeight: "600",
  },
  createAt: {
    fontSize: 16,
    color: "#848d94",
  },
});
