import {
  View,
  TextInput,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import Dialog, { DialogContent } from "react-native-popup-dialog";
import AntDesgin from "react-native-vector-icons/AntDesign";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import {
  createFriendRequestThunk,
  fetchFriendsThunk,
} from "../../store/friends/friendsThunk";
import { Formik } from "formik";
import AwesomeAlert from "react-native-awesome-alerts";
import * as Yup from "yup";
import {
  addGroupRecipient,
  createFriendRequest,
  fetchGroups,
} from "../../utils/api";
import CheckBox from "../CheckBox/CheckBox";
import { AuthContext } from "../../utils/context/AuthContext";
import {
  createGroupThunk,
  fetchGroupsThunk,
  groupsSlice,
  selectGroupById,
} from "../../store/groupSlice";

export default function ModalAddMember({
  visible,
  setVisible,
  navigation,
  group,
  users,
  setUsers,
  usersGroup,
  setUsersGroup
}) {
  const [showAlert, setShowAlert] = useState(false);
  const [showAlertErr, setShowAlertErr] = useState(false);
  const [selected, setSelected] = useState([]);
  const { friends } = useSelector((state: RootState) => state.friends);
  const { user } = useContext(AuthContext);
  const dispatch = useDispatch<AppDispatch>();
  const groupItem = useSelector((state: RootState) =>
    selectGroupById(state, group.id)
  );


  useEffect(() => {
    let newGroupItem = group.users.filter(item => {
      return item.id !== user.id
    })

    console.log(newGroupItem)

    newGroupItem.forEach((item) => {
      if (!usersGroup.includes(item.id)) {
        setUsersGroup((prev) => [...prev, item.id]);
      }
    });

  });


  const handleOnPressCheckBox = (friend, index) => {
    setSelected((prev) => [...prev, index]);
    setUsers((prev) => [...prev, friend.username]);
    if (selected.includes(index)) {
      let newSelected = selected.filter((item) => {
        return item !== index;
      });
      let newUsers = users.filter((item) => {
        return item !== friend.username;
      });

      setSelected(newSelected);
      setUsers(newUsers);
    }
  };


  const handleAddUserToGroup = () => {
    if(groupItem.owner.id === user.id) {
      users.forEach((user) => {
        addGroupRecipient({ id: group.id, username: user })
          .then(({ data }) => {
            console.log(data);
          })
          .catch((err) => {
            console.log(err);
            
          });
      });
      setShowAlert(true);
    setVisible(false);
    dispatch(fetchGroupsThunk())
    } else {
      setShowAlertErr(true)
    }
    
    
  };

  const handleFormatFriendAddGroup = () => {
    return friends.map((friend, index) => {
      if (friend.receiver.id !== user.id) {
        if (usersGroup.includes(friend.receiver.id)) {
          return (
            <View key={friend.id}>
              <CheckBox
                key={friend.id}
                friend={friend.receiver}
                selected={true}
                onPress={() => console.log("test")}
                member={true}
              />
            </View>
          );
        }
        return (
          <CheckBox
            key={friend.id}
            friend={friend.receiver}
            selected={selected.includes(index)}
            onPress={() => handleOnPressCheckBox(friend.receiver, index)}
            member={false}
          />
        );
      } 
      
      if(friend.sender.id !== user.id){
        if (usersGroup.includes(friend.sender.id)) {
          return (
            <View  key={friend.id}>
              <CheckBox
                key={friend.id}
                friend={friend.sender}
                selected={true}
                onPress={() => console.log("Test")}
                member={true}
              />
            </View>
          );
        }
        return (
          <CheckBox
            key={friend.id}
            friend={friend.sender}
            selected={selected.includes(index)}
            onPress={() => handleOnPressCheckBox(friend.sender, index)}
            member={false}
          />
        );
      }
    });
  };


  return (
    <>
      <Dialog
        visible={visible}
        animationType="slide"
        onTouchOutside={() => {
          setVisible(false);
        }}
        style={styles.dialog}
      >
        <DialogContent style={styles.modal}>
          <Text style={styles.textTitle}>Thêm bạn bè vào nhóm</Text>
          <View style={styles.row}>
            <Formik
              initialValues={{ title: "" }}
              onSubmit={(values) => handleAddUserToGroup()}
            >
              {({
                handleChange,
                handleBlur,
                handleSubmit,
                values,
                errors,
                touched,
              }) => (
                <View style={styles.wrapperForm}>
                  <SafeAreaView>
                    <ScrollView>{handleFormatFriendAddGroup()}</ScrollView>
                  </SafeAreaView>

                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => handleSubmit()}
                  >
                    <Text style={styles.buttonColor}>Thêm thành viên</Text>
                  </TouchableOpacity>
                </View>
              )}
            </Formik>
          </View>
        </DialogContent>
      </Dialog>
      <AwesomeAlert
        show={showAlert}
        showProgress={false}
        title="Thêm thành viên thành công"
        message="Đã thêm thành viên thành công hãy trò chuyện ngay!!!"
        closeOnTouchOutside={true}
        closeOnHardwareBackPress={false}
        showCancelButton={false}
        showConfirmButton={true}
        confirmText="Ok"
        confirmButtonColor="#567af3"
        onConfirmPressed={() => {
          setShowAlert(false);
          setVisible(false);
        }}
      />
      <AwesomeAlert
        show={showAlertErr}
        showProgress={false}
        title="Thêm thành viên thất bại!!! Bạn không phải là trưởng nhóm"
        closeOnTouchOutside={true}
        closeOnHardwareBackPress={false}
        showCancelButton={false}
        showConfirmButton={true}
        confirmText="Ok"
        confirmButtonColor="#FF9494"
        onConfirmPressed={() => {
          setShowAlertErr(false);
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  dialog: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },
  modal: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  textInput: {
    fontSize: 14,
    fontWeight: "600",
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 8,
    backgroundColor: "#06b1fb",
    borderRadius: 100,
    flexShrink: 1,
    width: 200,
  },
  textTitle: {
    fontSize: 20,
    textAlign: "center",
    fontWeight: "600",
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 100,
    backgroundColor: "#06b1fb",
    flexDirection: "row",
    alignSelf: "center",
    marginTop: 14,
  },
  buttonColor: {
    color: "#fff",
  },
  wrapperForm: {},
  textError: {
    textAlign: "center",
    marginLeft: -40,
    color: "#FF9494",
    fontSize: 14,
    fontWeight: "600",
  },
});
