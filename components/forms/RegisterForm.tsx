import { useState } from "react";
import { View, TextInput, Text, StyleSheet, Pressable } from "react-native";
import { Formik } from "formik";
import Button from "../Button/ButtonComponent";
import { postRegisterUser } from "../../utils/api";
import { CreateUserParams } from "../../utils/types";
import * as Yup from "yup";
import AwesomeAlert from "react-native-awesome-alerts";

import Dialog, { DialogContent } from "react-native-popup-dialog";

const ReisgerSchema = Yup.object().shape({
  username: Yup.string()
    .required("Vui lòng nhập username!!"),
  password: Yup.string()
    .required("Vui lòng nhập password!!")
    .min(6, "Mật khẩu ít nhất sáu kí tự!!"),
  firstName: Yup.string().required("Vui lòng nhập họ!!!"),
  lastName: Yup.string().required("Vui lòng nhập tên!!!"),
  confirmPassword: Yup.string()
    .required("Vui lòng nhập nhập lại password!!")
    .oneOf(
      [Yup.ref("password"), null],
      "Password và nhập lại password không khớp!!!"
    ),
});

const RegisterForm = ({ navigation }) => {
  const [openModalError, setOpenModalError] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  
  const handleSubmit = async (values: CreateUserParams) => {
    try {
      
      const { username, firstName, lastName, password } = values;
      console.log({ username, firstName, lastName, password })
      await postRegisterUser({ username, firstName, lastName, password });
      setShowAlert(true);
    } catch (error) {
      console.log(error);
      setOpenModalError(true);
    }
  };

  return (
    <>
      <Formik
        initialValues={{
          username: "",
          firstName: "",
          lastName: "",
          password: "",
          confirmPassword: "",
        }}
        onSubmit={(values) => handleSubmit(values)}
        validationSchema={ReisgerSchema}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors }) => (
          <View style={styles.form}>
            <View>
              <TextInput
                placeholder={"Email"}
                style={styles.textInput}
                onChangeText={handleChange("username")}
                value={values.username}
              />
              {errors.username && (
                <Text style={styles.textError}>{errors.username}</Text>
              )}
            </View>
            <View>
              <TextInput
                placeholder={"Họ"}
                style={styles.textInput}
                onChangeText={handleChange("firstName")}
                value={values.firstName}
              />
              {errors.firstName && (
                <Text style={styles.textError}>{errors.firstName}</Text>
              )}
            </View>
            <View>
              <TextInput
                placeholder={"Tên"}
                style={styles.textInput}
                onChangeText={handleChange("lastName")}
                value={values.lastName}
              />
              {errors.lastName && (
                <Text style={styles.textError}>{errors.lastName}</Text>
              )}
            </View>
            <View>
              <TextInput
                placeholder={"Mật khẩu"}
                style={styles.textInput}
                secureTextEntry={true}
                onChangeText={handleChange("password")}
                value={values.password}
              />
              {errors.password && (
                <Text style={styles.textError}>{errors.password}</Text>
              )}
            </View>
            <View>
              <TextInput
                placeholder={"Nhập lại mật khẩu"}
                style={styles.textInput}
                secureTextEntry={true}
                onChangeText={handleChange("confirmPassword")}
                value={values.confirmPassword}
              />
              {errors.confirmPassword && (
                <Text style={styles.textError}>{errors.confirmPassword}</Text>
              )}
            </View>

            <Button onPress={() => handleSubmit()} title="Đăng kí" />
            <AwesomeAlert
              show={showAlert}
              showProgress={false}
              title="Đăng kí"
              message="Bạn đã đăng kí tài khoản thành công!! Chúc bạn có những khoảnh khắc tuyệt vời bên bạn bè và gia đình"
              closeOnTouchOutside={true}
              closeOnHardwareBackPress={false}
              showCancelButton={false}
              showConfirmButton={true}
              confirmText="Ok"
              confirmButtonColor="#567af3"
              onConfirmPressed={() => {
                navigation.navigate("Login");
              }}
            />
          </View>
        )}
      </Formik>
      <Dialog
        animationType="slide"
        visible={openModalError}
        onTouchOutside={() => {
          setOpenModalError(false);
        }}
      >
        <DialogContent>
          <View style={styles.modal}>
            <Text style={styles.modalTextError}>Đăng kí thất bại</Text>
            <Text style={styles.modalDesc}>Đã tồn tại email vui lòng chọn tài khoản email khác!!!</Text>
            <View style={styles.modalPressOk}>
              <Pressable
                style={({ pressed }) => [
                  {
                    backgroundColor: pressed ? "#cd2c2c" : "#FF9494",
                  },
                  styles.borderRadius,
                ]}
                onPress={() => setOpenModalError(false)}
              >
                <Text style={styles.modalTextOk}>Ok</Text>
              </Pressable>
            </View>
          </View>
        </DialogContent>
      </Dialog>
    </>
  );
};

const styles = StyleSheet.create({
  form: {
    width: "100%",
  },
  textInput: {
    marginVertical: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderBottomColor: "#567af3",
    borderWidth: 1,
    borderRadius: 6,
    backgroundColor: "#f7f8fd",
    fontSize: 16,
    fontWeight: "600",
  },
  textError: {
    color: "#FF9494",
    fontWeight: "600",
    fontStyle: "italic",
  },
  modal: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    justifyContent: "center",
  },
  modalTextError: {
    fontSize: 18,
    color: "#FF9494",
    fontWeight: "600",
    textAlign: "center",
  },
  modalDesc: {
    fontWeight: "600",
    fontSize: 18,
    textAlign: "center",
    paddingVertical: 12,
  },
  modalPressOk: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
  },
  borderRadius: {
    borderRadius: 100,
  },
  modalTextOk: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    textAlign: "center",
    borderRadius: 100,
    color: "#fff",
  },
});

export default RegisterForm;
