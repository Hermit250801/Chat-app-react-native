import { View, TextInput, Pressable, StyleSheet, Text } from "react-native";
import React, { useState } from "react";
import Dialog, { DialogContent } from "react-native-popup-dialog";
import AntDesgin from "react-native-vector-icons/AntDesign";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store";
import { createFriendRequestThunk } from "../../store/friends/friendsThunk";
import { Formik } from "formik";
import AwesomeAlert from "react-native-awesome-alerts";
import * as Yup from "yup";
import { createFriendRequest } from "../../utils/api"

const FriendRequestSchema = Yup.object().shape({
  username: Yup.string()
    .email("Email không đúng!!")
    .required("Vui lòng nhập email!!"),
});

export default function ModalAddFriend({ visible, setVisible, navigation }) {
  const dispatch = useDispatch<AppDispatch>();
  const [showAlert, setShowAlert] = useState(false);
  const [showAlertErr, setShowAlertErr] = useState(false);

  const handleSendFriendRequest = async (values) => {
    const { username } = values;
    
    dispatch(createFriendRequestThunk(username))
    .unwrap()
    .then(() => {
      console.log('Success Friend Request');
      setShowAlert(true)
    })
    .catch((err) => {
      setShowAlertErr(true)
      console.log(err.message);
      console.log('Error sending friend request');
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
          <Text style={styles.textTitle}>Thêm bạn bè</Text>
          <View style={styles.row}>
            <AntDesgin name="adduser" size={24} color={"#06b1fb"} />
            <Formik
              initialValues={{ username: "" }}
              onSubmit={(values) => handleSendFriendRequest(values)}
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
                <View>
                  <View style={styles.row}>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Thêm bạn bằng email"
                      onChangeText={handleChange("username")}
                      value={values.username}
                    />
                    <Pressable
                      style={({ pressed }) => [
                        styles.button,
                        {
                          backgroundColor: pressed ? "#93989a" : "#1194ff",
                        },
                      ]}
                      onPress={() => handleSubmit()}
                    >
                      <Text style={styles.buttonColor}>Tìm</Text>
                    </Pressable>
                  </View>

                  <View>
                    {errors.username && <Text style={styles.textError} >Email không đúng định dạng</Text>}
                  </View>
                </View>
              )}
            </Formik>
          </View>
        </DialogContent>
      </Dialog>
      <AwesomeAlert
        show={showAlert}
        showProgress={false}
        title="Gửi lời mời kết bạn thành công"
        message="Đã gửi yêu cầu thêm bạn thành công!!!"
        closeOnTouchOutside={true}
        closeOnHardwareBackPress={false}
        showCancelButton={false}
        showConfirmButton={true}
        confirmText="Ok"
        confirmButtonColor="#567af3"
        onConfirmPressed={() => {
          setShowAlert(false)
          setVisible(false)
        }}
      />
      <AwesomeAlert
        show={showAlertErr}
        showProgress={false}
        title="Gửi lời mời kết bạn thất bại"
        message="Người nhận đã là bạn bè của bạn!!!"
        closeOnTouchOutside={true}
        closeOnHardwareBackPress={false}
        showCancelButton={false}
        showConfirmButton={true}
        confirmText="Ok"
        confirmButtonColor="#FF9494"
        onConfirmPressed={() => {
          setShowAlertErr(false)
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
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 100,
  },
  buttonColor: {
    color: "#fff",
  },
  textError: {
    textAlign: "center",
    marginLeft: -40,
    color: "#FF9494",
    fontSize: 14,
    fontWeight: "600"
  }
});
