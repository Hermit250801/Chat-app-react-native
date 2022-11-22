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
import { createFriendRequest, fetchGroups } from "../../utils/api";
import CheckBox from "../CheckBox/CheckBox";
import { AuthContext } from "../../utils/context/AuthContext";
import { createGroupThunk, fetchGroupsThunk, selectGroupById } from "../../store/groupSlice";

const FriendRequestSchema = Yup.object().shape({
  title: Yup.string().required("Vui lòng nhập tên nhóm!!"),
});

export default function ModalAddGroup({ visible, setVisible, navigation }) {
  const [showAlert, setShowAlert] = useState(false);
  const [showAlertErr, setShowAlertErr] = useState(false);
  const [selected, setSelected] = useState([]);
  const [users, setUsers] = useState([]);
  const { friends } = useSelector((state: RootState) => state.friends);
  const { user } = useContext(AuthContext);
  const dispatch = useDispatch<AppDispatch>();

  

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

  const handleCreateGroup = (title: string) => {
    if(users.length >= 2) {
      dispatch(createGroupThunk({ users, title }))
      .unwrap()
      .then(() => {
        console.log("Success Create Group");
        setShowAlert(true);
        dispatch(fetchGroupsThunk());
      })
      .catch((err) => {
        setShowAlertErr(true);
        console.log(err.message);
        console.log("Error create group");
      });
    } else {
      setShowAlertErr(true);
    }
   
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
              onSubmit={(values) => handleCreateGroup(values.title)}
              validationSchema={FriendRequestSchema}
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
                  <View style={styles.row}>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Đặt tên nhóm"
                      onChangeText={handleChange("title")}
                      value={values.title}
                    />
                  </View>
                  <SafeAreaView>
                    <ScrollView>
                      {friends.map(
                        (friend, index) =>
                          (friend.receiver.id !== user.id && (
                            <CheckBox
                              key={friend.id}
                              friend={friend.receiver}
                              selected={selected.includes(index)}
                              onPress={() =>
                                handleOnPressCheckBox(friend.receiver, index)
                              }
                              member={false}
                            />
                          )) || (
                            <CheckBox
                              key={friend.id}
                              friend={friend.sender}
                              selected={selected.includes(index)}
                              onPress={() =>
                                handleOnPressCheckBox(friend.sender, index)
                              }
                              member={false}
                            />
                          )
                      )}
                    </ScrollView>
                  </SafeAreaView>

                  <View>
                    {errors.title && (
                      <Text style={styles.textError}>
                        Vui lòng nhập tên nhóm!!!
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => handleSubmit()}
                  >
                    <Text style={styles.buttonColor}>Tạo</Text>
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
        title="Tạo nhóm thành công"
        message="Dã tạo nhóm thành công hãy trò chuyện ngay!!!"
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
        title="Tạo nhóm thất bại! Vui lòng chọn thêm ít nhất 2 thành viên"
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
