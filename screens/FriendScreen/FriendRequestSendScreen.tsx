import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ActivityIndicator,
} from "react-native";
import React from "react";
import { useAuth } from "../../utils/hooks/useAuth";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import {
  cancelFriendRequestThunk,
  fetchFriendRequestThunk,
} from "../../store/friends/friendsThunk";

import Toast from "react-native-toast-message";

export default function FriendRequestSendScreen() {
  const { friendRequests } = useSelector((state: RootState) => state.friends);
  const { loading, user } = useAuth();
  const dispatch = useDispatch<AppDispatch>();


  const handleCancelFriendQuest = (item) => {
    dispatch(cancelFriendRequestThunk(item.id));
    Toast.show({
      type: "success",
      text1: "Thu hồi lời mời kết bạn thành công!!",
    });
    dispatch(fetchFriendRequestThunk());
  };

  return (
    <>
      {(loading && (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#0ea2fc" />
        </View>
      )) ||
        (friendRequests.length > 0 &&
          friendRequests.map((item) => (
            <View key={item.id}>
              {item.sender.id === user.id && (
                <View style={styles.container}>
                  <View style={styles.row}>
                    <Image
                      source={require("../../assets/user.png")}
                      style={styles.avatar}
                    />
                    <View style={styles.info}>
                      <Text
                        style={styles.text}
                      >{`${item.receiver.firstName} ${item.receiver.lastName}`}</Text>
                      <Text style={styles.textSub}>Muốn kết bạn</Text>
                    </View>
                  </View>

                  <Pressable
                    style={({ pressed }) => [
                      styles.btn,
                      { backgroundColor: pressed ? "#f0f8fb" : "#f3f4f8" },
                    ]}
                    onPress={() => handleCancelFriendQuest(item)}
                  >
                    <Text>THU HỒI</Text>
                  </Pressable>
                </View>
              )}
            </View>
          )))
          || (
            <View style={styles.noFriendRequest}>
              <Text style={styles.text}>Bạn không gửi lời mời kết bạn nào</Text>
            </View>
          )
        }
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  noFriendRequest: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0ea3fd"
  },
  textSub: {
    fontSize: 14,
    color: "#848d94",
    fontWeight: "600",
  },
  avatar: {
    width: 50,
    height: 50,
  },
  info: {
    paddingLeft: 16,
  },
  btn: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 100,
    marginTop: 4,
  },
});
