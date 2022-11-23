import {
  View,
  Text,
  StyleSheet,
  Image,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { useContext, useState, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { AuthContext } from '../../utils/context/AuthContext';
import { CDN_URL } from '../../utils/constants';
import Dialog, { DialogContent } from 'react-native-popup-dialog';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import { updateStatusMessage, updateUserProfile } from '../../utils/api';

import Feather from 'react-native-vector-icons/Feather';

export default function ProfileScreen() {
  const [imagePreview, setImagePreview] = useState(null);
  const [backgroundPreview, setBackgroundPreview] = useState(null);
  const [hasGalleryPermission, setHasGalleryPermission] = useState(null);
  const [openModalError, setOpenModalError] = useState(false);
  const { user } = useContext(AuthContext);
  const [isEditStatus, setIsEditStatus] = useState(false);
  const [status, setStatus] = useState(
    user?.presence || user?.presence?.statusMessage || undefined
  );

  const avatar =
    (user?.profile?.avatar !== null &&
      CDN_URL.BASE.concat(user?.profile?.avatar)) ||
    require('../../assets/user.png');

  const background =
    (user?.profile?.banner !== null &&
      CDN_URL.BASE.concat(user?.profile?.banner)) ||
    require('../../assets/user.png');

  useEffect(() => {
    async () => {
      const gallaryStatus =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      setHasGalleryPermission(gallaryStatus.status === 'granted');
    };

    return () => {
      setImagePreview(null);
      setBackgroundPreview(null);
    };
  }, []);

  const pickAvatar = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (result.cancelled === false) {
      let localUri = result.uri;
      let filename = localUri.split('/').pop();

      let match = /\.(\w+)$/.exec(filename);
      let type = match ? `image/${match[1]}` : `image`;
      const formData = new FormData();
      formData.append('avatar', { uri: localUri, name: filename, type });

      const { data: updatedUser } = await updateUserProfile(formData);
      console.log(updatedUser);
      setImagePreview(result.uri);
    }

    if (hasGalleryPermission === false) {
      setOpenModalError(true);
    }
  };

  const pickBackground = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (result.cancelled !== false) {
      return;
    }

    if (hasGalleryPermission === false) {
      setOpenModalError(true);
    }

    setBackgroundPreview(result.uri);
    let localUri = result.uri;
    let filename = localUri.split('/').pop();

    let match = /\.(\w+)$/.exec(filename);
    let type = match ? `image/${match[1]}` : `image`;
    const formData = new FormData();
    formData.append('banner', { uri: localUri, name: filename, type });

    const { data: updatedUser } = await updateUserProfile(formData);
    console.log(updatedUser);
  };

  const handleChangeStatus = async () => {
    updateStatusMessage({ statusMessage: status });
    setIsEditStatus(false);
    setStatus(status);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="arrow-back" color="#fff" size={36} />
        <SimpleLineIcons name="options" color="#fff" size={36} />
      </View>

      <View style={styles.body}>
        <TouchableOpacity style={styles.background} onPress={pickBackground}>
          <Image
            source={
              (backgroundPreview !== null && { uri: backgroundPreview }) ||
              (user?.profile?.banner !== null && {
                uri: CDN_URL.BASE.concat(user?.profile?.banner),
              }) ||
              require('../../assets/user.png')
            }
            style={styles.banner}
          />
        </TouchableOpacity>
        <View>
          <TouchableOpacity onPress={pickAvatar} style={styles.avatarContainer}>
            <Image
              source={
                (imagePreview !== null && { uri: imagePreview }) ||
                (user?.profile?.avatar !== null && {
                  uri: CDN_URL.BASE.concat(user?.profile?.avatar),
                }) ||
                require('../../assets/user.png')
              }
              style={styles.avatar}
            />
          </TouchableOpacity>

          <View style={styles.nameContainer}>
            <Text
              style={styles.name}
            >{`${user?.firstName} ${user?.lastName}`}</Text>
          </View>

          <View style={styles.statusContainer}>
            {isEditStatus ? (
              <TextInput
                placeholder={'About'}
                value={status}
                onChangeText={(e) => setStatus(e)}
                onSubmitEditing={handleChangeStatus}
              />
            ) : (
              <Text style={styles.status}>About: {`${status && status}`}</Text>
            )}

            <TouchableOpacity
              onPress={() => setIsEditStatus(true)}
              onTouchOutside={() => setIsEditStatus(false)}
            >
              <Feather color={'#000'} size={20} name="edit-2" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <Dialog
        animationType="slide"
        visible={openModalError}
        onTouchOutside={() => {
          setOpenModalError(false);
        }}
      >
        <DialogContent>
          <View style={styles.modal}>
            <Text style={styles.modalTextError}>
              Bạn không cho phép truy cập vào thư viện hình ảnh!
            </Text>
            <Text style={styles.modalDesc}>
              Hãy cho phép quyền vào thư viện hình ảnh để truy cập tiếp!!!
            </Text>
            <View style={styles.modalPressOk}>
              <Pressable
                style={({ pressed }) => [
                  {
                    backgroundColor: pressed ? '#cd2c2c' : '#FF9494',
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    position: 'relative',
  },
  header: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'space-between',
    left: 12,
    top: 6,
    right: 12,
    elevation: 99,
    zIndex: 99,
  },
  body: {},
  background: {
    position: 'relative',
  },
  avatar: {
    height: 100,
    width: 100,
    borderRadius: 100,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  avatarContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    bottom: -50,
    left: '50%',
    right: '50%',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    bottom: -110,
    left: '50%',
    transform: [{ translateX: -50 }],
  },
  status: {
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 18,
  },
  nameContainer: {
    position: 'absolute',
    bottom: -80,
    left: '50%',
    transform: [{ translateX: -48 }],
    zIndex: 9,
    elevation: 9,
  },
  name: {
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 18,
  },
  banner: {
    position: 'relative',
    height: 300,
    marginHorizontal: -12,
    elevation: 3,
  },
  textError: {
    color: '#FF9494',
    fontWeight: '600',
    fontStyle: 'italic',
  },
  modal: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  modalTextError: {
    fontSize: 18,
    color: '#FF9494',
    fontWeight: '600',
    textAlign: 'center',
  },
  modalDesc: {
    fontWeight: '600',
    fontSize: 18,
    textAlign: 'center',
    paddingVertical: 12,
  },
  modalPressOk: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  borderRadius: {
    borderRadius: 100,
  },
  modalTextOk: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    textAlign: 'center',
    borderRadius: 100,
    color: '#fff',
  },
});
