import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { AppDispatch, RootState } from "../../store";
import { fetchFriendRequestThunk } from "../../store/friends/friendsThunk";
import FriendRequestItem from "../../components/Friend/FriendRequestItem";
import { SocketContext } from "../../utils/context/SocketContext";
import { AuthContext } from "../../utils/context/AuthContext";

export default function FriendRequestReceiveScreen() {
  const { friendRequests } = useSelector((state: RootState) => state.friends);
  const { user } = useContext(AuthContext);

  return (
    <>
      <>
        {(friendRequests.length > 0 && (
          <SafeAreaView style={styles.container}>
            <ScrollView
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
            >
              {friendRequests.map(
                (request) =>
                  request.receiver.id === user.id && (
                    <FriendRequestItem key={request.id} request={request} />
                  )
              )}
            </ScrollView>
          </SafeAreaView>
        )) || (
          <View style={styles.noFriendRequest}>
            <Text style={styles.text}>Không có lời mời kết bạn</Text>
          </View>
        )}
      </>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
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
    fontSize: 18,
    color: "#0ea3fd",
    fontWeight: "600",
  },
});
