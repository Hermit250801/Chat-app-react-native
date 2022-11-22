import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Modal,
} from "react-native";
import { useState, useRef } from "react";
import Entypo from "react-native-vector-icons/Entypo";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { Formik, useFormik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import { selectType } from "../../store/selectedSlice";
import * as ImagePicker from "expo-image-picker";
import {
  addAttachment,
  incrementAttachmentCounter,
} from "../../store/message-panel/messagePanelSlice";
import IconPicker from "react-native-icon-picker";
export default function InputChat({
  conversationId,
  sendMessage,
  scrollDown,
  sendTypingStatus,
}) {
  const conversationType = useSelector((state) => selectType(state));
  const { attachments, attachmentCounter } = useSelector(
    (state) => state.messagePanel
  );
  const dispatch = useDispatch();
  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (result.cancelled !== false) {
      return;
    }

    let localUri = result.uri;
    let filename = localUri.split("/").pop();

    let match = /\.(\w+)$/.exec(filename);
    let type = match ? `image/${match[1]}` : `image`;
    const formData = new FormData();
    formData.append("attchments", { uri: localUri, name: filename, type });
    let localCounter = attachmentCounter;
    dispatch(addAttachment({ id: localCounter++, file: formData }));
    dispatch(incrementAttachmentCounter());
  };
  return (
    <View style={{ position: "relative", flex: 1 }}>
      <Formik
        initialValues={{ message: "" }}
        onSubmit={async (values, { resetForm }) => {
          sendMessage(values);
          resetForm();
        }}
      >
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          errors,
          touched,
        }) => (
          <View style={styles.container}>
            <Pressable>
              <Entypo name={"emoji-happy"} size={30} />
            </Pressable>
            <View style={[styles.container, styles.viewInputContainer]}>
              <TextInput
                placeholder="Nhập tin nhắn ..."
                style={styles.textInput}
                onFocus={() =>
                  scrollDown.current &&
                  scrollDown.current.scrollToEnd({ animated: true })
                }
                onChangeText={handleChange("message")}
                value={values.message}
                onChange={() => {
                  sendTypingStatus();
                }}
                multiline={true}
              />
              <Pressable
                style={({ pressed }) => [
                  {
                    backgroundColor: pressed ? "#c5c9d5" : "transparent",
                  },
                  styles.zipBtn,
                ]}
                onPress={pickImage}
              >
                <MaterialIcons name={"attach-file"} size={30} />
              </Pressable>
            </View>
            <Pressable
              style={({ pressed }) => [
                {
                  backgroundColor: pressed ? "#c5c9d5" : "transparent",
                },
                styles.sendBtn,
              ]}
              onPress={() => handleSubmit()}
            >
              <FontAwesome name="send" size={24} color={"#fff"} />
            </Pressable>
          </View>
        )}
      </Formik>

    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "flex-start",
  },
  emoijContainer: {
    flexDirection: "column",
    alignItems: "center",
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconPicker: {

  },
  viewInputContainer: {
    flex: 1,
    backgroundColor: "#f5f7fa",
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 10,
    justifyContent: "space-between",
  },
  textInput: {
    maxWidth: "90%",
    paddingHorizontal: 12,
    flexShrink: 1,
    flex: 1,
  },
  sendBtn: {
    backgroundColor: "#3ab4f2",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 100,
  },
  zipBtn: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 100,
  },
});
