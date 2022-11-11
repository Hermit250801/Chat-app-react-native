import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  ScrollView,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import Feather from "react-native-vector-icons/Feather";

import FriendItem from "../../components/Friend/FriendItem";
import Notification from "../../components/Notification/Notification";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { AuthContext } from "../../utils/context/AuthContext";
import { getAuthUser } from "../../utils/api";
import { fetchFriendRequestThunk, fetchFriendsThunk } from "../../store/friends/friendsThunk";
import { SocketContext } from "../../utils/context/SocketContext";
import { addFriendRequest, removeFriendRequest } from "../../store/friends/friendsSlice";
import { AcceptFriendRequestResponse, FriendRequest } from "../../utils/types";
import { selectConversationById } from "../../store/conversationSlice";

export default function FriendScreen({ navigation }) {
  const { showContextMenu, friends, onlineFriends, friendRequests } = useSelector(
    (state: RootState) => state.friends
  );
  const socket = useContext(SocketContext);
  const dispatch = useDispatch<AppDispatch>();
  const [countUnreadMsg, setCountUnreadMsg] = useState(0);
  const { user } = useContext(AuthContext);



  const handleCountUnreadMsg = () => {
    friendRequests.forEach(item => {
      if(item.receiver.id === user.id) {
        setCountUnreadMsg(prev => prev + 1)
      }
    })
  }

  useEffect(() => {
    console.log('Registering all events for AppPage');
    socket.on('onFriendRequestReceived', (payload: FriendRequest) => {
      console.log('onFriendRequestReceived');
      console.log(payload);
      dispatch(addFriendRequest(payload));
      dispatch(fetchFriendRequestThunk());
    });

    socket.on('onFriendRequestCancelled', (payload: FriendRequest) => {
      console.log('onFriendRequestCancelled');
      console.log(payload);
      dispatch(removeFriendRequest(payload));
      dispatch(fetchFriendRequestThunk());
    });

    socket.on(
      'onFriendRequestAccepted',
      (payload: AcceptFriendRequestResponse) => {
        console.log('onFriendRequestAccepted');
        dispatch(removeFriendRequest(payload.friendRequest));
        socket.emit('getOnlineFriends');
        dispatch(fetchFriendRequestThunk());
      }
    );

    socket.on('onFriendRequestRejected', (payload: FriendRequest) => {
      console.log('onFriendRequestRejected');
      dispatch(removeFriendRequest(payload));
      dispatch(fetchFriendRequestThunk());
    });

    return () => {
      console.log('Removing all event listeners');
      socket.off('onFriendRequestCancelled');
      socket.off('onFriendRequestRejected');
      socket.off('onFriendRequestReceived');
      socket.off('onFriendRequestAccepted');
    };
  }, [socket]);


  useEffect(() => {
    dispatch(fetchFriendsThunk());
    dispatch(fetchFriendRequestThunk());
    handleCountUnreadMsg();
    return () => {
      setCountUnreadMsg(0)
    }
  }, [socket]);


  return (
    <View style={styles.container}>
      <Pressable
        style={({ pressed }) => [
          {
            backgroundColor: pressed ? "#d0d5d7" : "#fff",
          },
          styles.friendRequestContainer,
        ]}
        onPress={() => navigation.navigate("FriendRequest")}
      >
        {({ pressed }) => (
          <View style={styles.friendRequestContainer}>
            <View style={styles.row}>
              <Feather name="users" style={styles.icon} />
              <Text style={[styles.text]}>Lời mời kết bạn</Text>
            </View>
            {
              countUnreadMsg > 0 && <Notification number={countUnreadMsg} />
            }
            
          </View>
        )}
      </Pressable>

      <SafeAreaView style={styles.listFriendContainer}>
        <View style={styles.filterContainer}>
          <Pressable style={[styles.btnFilterAll, styles.activeBtnFilter]}>
            <Text style={styles.text}>Tất cả {friends.length}</Text>
          </Pressable>
          <Pressable style={[styles.btnFilterAll, styles.inActiveBtnFilter]}>
            <Text style={[styles.text, styles.textInActive]}>
              Mới truy cập {onlineFriends.length}
            </Text>
          </Pressable>
        </View>

        <View style={styles.padding}>
          <Text style={styles.text}>Danh Sách Bạn Bè</Text>
        </View>
        <ScrollView
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
        >
          {friends.map((friend) => {
            if (friend.sender.id !== user?.id) {
              return <FriendItem key={friend.sender.id} friend={friend.sender} navigation={navigation} />;
            } else {
              return <FriendItem key={friend.receiver.id} friend={friend.receiver} navigation={navigation} />
            }
          })}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  friendRequestContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 12,
    width: "100%",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  padding: {
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  text: {
    fontSize: 18,
  },
  icon: {
    fontSize: 18,
    fontWeight: "600",
    backgroundColor: "#187afb",
    color: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    marginRight: 10,
  },
  listFriendContainer: {
    marginTop: 5,
    backgroundColor: "#fff",
    flex: 1,
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 12,
    alignItems: "center",
    paddingVertical: 12,
    borderBottomColor: "#d5d7db",
    borderBottomWidth: 1,
  },
  btnFilterAll: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    marginRight: 12,
  },
  activeBtnFilter: {
    backgroundColor: "#e9ebed",
  },
  inActiveBtnFilter: {
    borderColor: "#d5d7db",
    borderWidth: 1,
  },
  textInActive: {
    color: "#767a7f",
    fontWeight: "600",
  },
});
