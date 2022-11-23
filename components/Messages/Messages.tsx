import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Touchable,
  TouchableWithoutFeedback,
  Image,
  Pressable,
} from 'react-native';
import { useRef, useState, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  deleteMessage,
  selectConversationMessage,
} from '../../store/messages/messageSlice';
import { AppDispatch, RootState } from '../../store';

import Moment from 'moment';
import { selectType } from '../../store/selectedSlice';
import { DeleteMessageParams, EditMessagePayload } from '../../utils/types';
import {
  deleteMessageThunk,
  editMessageThunk,
} from '../../store/messages/messageThunk';
import { setIsEditing } from '../../store/messageContainerSlice';
import {
  deleteGroupMessageThunk,
  editGroupMessageThunk,
} from '../../store/groupMessageSlice';
import { selectGroupById } from '../../store/groupSlice';
import { AuthContext } from '../../utils/context/AuthContext';
import { CDN_URL } from '../../utils/constants';

export default function Messages({
  conversationId,
  currentUser,
  scrollDown,
  groupMessages,
  navigation,
}) {
  const [openModal, setOpenModal] = useState(null);
  const [editMessage, setEditMessage] = useState(null);
  const [textMessage, setTextMessage] = useState('');

  const conversationMessages = useSelector((state: RootState) =>
    selectConversationMessage(state, conversationId!)
  );

  const { user } = useContext(AuthContext);

  const dispatch = useDispatch<AppDispatch>();

  const conversationType = useSelector((state: RootState) => selectType(state));

  const { attachments, attachmentCounter } = useSelector(
    (state: RootState) => state.messagePanel
  );

  const avatar =
    (user?.profile?.avatar !== null &&
      CDN_URL.BASE.concat(user?.profile?.avatar)) ||
    undefined;

  const handleLastMessageAt = (item) => {
    const currentDate = new Date();
    const lastMessageTime = new Date(item.createdAt);
    const daysBetween = Math.abs(
      currentDate.getDate() - lastMessageTime.getDate()
    );

    if (daysBetween === 0) {
      const hours = parseInt(
        Moment(item.createdAt).format('HH:mm').toString().split(':')[0]
      );
      const mintues = Moment(item.createdAt)
        .format('HH:mm')
        .toString()
        .split(':')[1];
      if (hours >= 12) {
        return `${hours}:${mintues} PM`;
      } else {
        return `${hours}:${mintues} AM`;
      }
    } else if (daysBetween <= 7) {
      return `${daysBetween} ngày trước`;
    } else {
      const date = Moment(item.createdAt).format('DD/MM/YYYY');
      return `${date}`;
    }
  };

  const handleOpenModal = (item) => {
    setOpenModal(item.id);
  };

  const handleEditMessage = (item) => {
    console.log('Edit message');
    setEditMessage(item.id);
    setTextMessage(item.content);
    setOpenModal(null);
  };

  const handleDeleteMessage = (item) => {
    console.log('Delete message');
    const params: DeleteMessageParams = {
      id: conversationId!,
      messageId: item.id,
    };
    console.log(params);
    console.log('Delete...', conversationType);
    conversationType === 'private'
      ? dispatch(deleteMessageThunk(params))
      : dispatch(deleteGroupMessageThunk(params));

    setOpenModal(null);
  };

  const handleOpenImage = (image) => {
    navigation.navigate('Image', {
      image: image,
      navigation: navigation,
    });
  };

  const onSubmitEditText = (e, item) => {
    setEditMessage(null);
    console.log(e.nativeEvent.text);
    console.log('Submitting Edit');
    if (!e.nativeEvent.text) {
      console.log('messageBeingEdited is undefined... Returning');
      return;
    }
    const params: EditMessagePayload = {
      id: conversationId!,
      messageId: item.id,
      content: e.nativeEvent.text,
    };
    console.log(params);
    console.log('Editing...', conversationType);
    conversationType === 'private'
      ? dispatch(editMessageThunk(params)).finally(() =>
          dispatch(setIsEditing(false))
        )
      : dispatch(editGroupMessageThunk(params)).finally(() =>
          dispatch(setIsEditing(false))
        );
  };

  const handleTouchOutside = () => {
    setEditMessage(null);
    setOpenModal(null);
  };

  useEffect(() => {
    attachments.forEach((image) => {
      console.log('Attachment IMage: ', image);
    });
  }, []);

  return (
    <SafeAreaView style={styles.body}>
      <View style={{ flex: 6 }}>
        <ScrollView
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          ref={scrollDown}
          onContentSizeChange={() =>
            scrollDown.current &&
            scrollDown.current.scrollToEnd({ animated: true })
          }
        >
          {(conversationType === 'private' && (
            <TouchableWithoutFeedback onPress={handleTouchOutside}>
              <View style={styles.messageContainer}>
                {conversationMessages?.messages.map((item) => {
                  return (
                    (item.author.id === currentUser.id && (
                      <View
                        key={item.createdAt}
                        style={styles.positionRelative}
                      >
                        <TouchableOpacity
                          onLongPress={() => handleOpenModal(item)}
                          style={[styles.message, styles.sender]}
                        >
                          <Text>{item.content}</Text>
                          <View style={styles.attachments}>
                            {item.attachments.map((image) => (
                              <Pressable onPress={() => handleOpenImage(image)}>
                                <Image
                                  key={image.key}
                                  source={{
                                    uri: CDN_URL.ORIGINAL.concat(image.key),
                                  }}
                                  style={styles.attachment}
                                />
                              </Pressable>
                            ))}
                          </View>
                        </TouchableOpacity>
                        <Text style={[styles.sendTimeMessage]}>
                          {handleLastMessageAt(item)}
                        </Text>
                      </View>
                    )) || (
                      <View
                        key={item.createdAt}
                        style={styles.positionRelative}
                      >
                        <TouchableOpacity
                          onLongPress={() => handleOpenModal(item)}
                          style={[styles.message, styles.receiver]}
                        >
                          <View>
                            {(editMessage === item.id && (
                              <TextInput
                                value={textMessage || item.content}
                                onChangeText={setTextMessage}
                                onSubmitEditing={(e) =>
                                  onSubmitEditText(e, item)
                                }
                                autoFocus
                              />
                            )) || (
                              <View>
                                <Text style={styles.receiverText}>
                                  {item.content}
                                </Text>

                                <View style={styles.attachments}>
                                  {item.attachments.map((image) => (
                                    <Pressable
                                      onPress={() => handleOpenImage(image)}
                                    >
                                      <Image
                                        key={image.key}
                                        source={{
                                          uri: CDN_URL.ORIGINAL.concat(
                                            image.key
                                          ),
                                        }}
                                        style={styles.avatar}
                                      />
                                    </Pressable>
                                  ))}
                                </View>
                              </View>
                            )}
                          </View>

                          {openModal === item.id && (
                            <View style={[styles.modal]}>
                              <TouchableOpacity
                                style={[styles.btn, styles.btnEditMessage]}
                                onPress={() => handleEditMessage(item)}
                              >
                                <Text style={styles.btnText}>Sửa tin nhắn</Text>
                              </TouchableOpacity>

                              <View style={styles.space}></View>

                              <TouchableOpacity
                                style={[styles.btn, styles.btnDeleteMessage]}
                                onPress={() => handleDeleteMessage(item)}
                              >
                                <Text style={styles.btnText}>Xóa tin nhắn</Text>
                              </TouchableOpacity>
                            </View>
                          )}
                        </TouchableOpacity>
                        <Text
                          style={[
                            styles.sendTimeMessage,
                            styles.receiverSendTime,
                          ]}
                        >
                          {handleLastMessageAt(item)}
                        </Text>
                      </View>
                    )
                  );
                })}
              </View>
            </TouchableWithoutFeedback>
          )) || (
            <TouchableWithoutFeedback onPress={handleTouchOutside}>
              <View style={styles.messageContainer}>
                {groupMessages?.messages &&
                  groupMessages?.messages.map((message) => (
                    <View style={[styles.positionRelative]} key={message.id}>
                      <View
                        style={[
                          styles.row,
                          (message.author.id !== user.id &&
                            styles.senderContainer) ||
                            styles.receiverContainer,
                        ]}
                      >
                        {message.author.id !== user.id && (
                          <Image
                            source={
                              (message.author.profile !== null && {
                                uri: CDN_URL.BASE.concat(
                                  message.author.profile?.avatar
                                ),
                              }) ||
                              require('../../assets/user.png')
                            }
                            style={styles.avatar}
                          />
                        )}

                        <TouchableOpacity
                          style={[
                            styles.message,
                            (message.author.id !== user.id && styles.sender) ||
                              styles.receiver,
                          ]}
                        >
                          <Text
                            style={styles.userNameText}
                          >{`${message.author.firstName} ${message.author.lastName}`}</Text>
                          <Text>{message.content}</Text>
                          <View style={styles.attachments}>
                            {message.attachments.map((image) => (
                              <Pressable key={image.key} onPress={() => handleOpenImage(image)}>
                                <Image
                                  source={{
                                    uri: CDN_URL.ORIGINAL.concat(image.key),
                                  }}
                                  style={styles.attachment}
                                />
                              </Pressable>
                            ))}
                          </View>
                        </TouchableOpacity>
                        {message.author.id === user.id && (
                          <Image
                            source={
                              (avatar && { uri: avatar }) ||
                              require('../../assets/user.png')
                            }
                            style={styles.avatar}
                          />
                        )}
                      </View>
                      <View
                        style={
                          (message.author.id !== user.id &&
                            styles.senderText) ||
                          styles.receiverText
                        }
                      >
                        <Text style={[styles.sendTimeMessage]}>
                          {handleLastMessageAt(message)}
                        </Text>
                      </View>
                    </View>
                  ))}
              </View>
            </TouchableWithoutFeedback>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  positionRelative: {
    position: 'relative',
  },
  attachments: {
    flexDirection: 'row',
    maxWidth: '80%',
    flexWrap: 'wrap',
  },
  attachment: {
    height: 80,
    width: 80,
    marginLeft: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  senderContainer: {
    justifyContent: 'flex-start',
  },
  receiverContainer: {
    justifyContent: 'flex-end',
  },
  modal: {
    position: 'absolute',
    top: -15,
    right: 100,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  avatar: {
    height: 40,
    width: 40,
    marginHorizontal: 10,
    borderRadius: 100,
  },
  btn: {
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 10,
  },
  btnEditMessage: {
    backgroundColor: '#119dfc',
  },
  space: {
    borderColor: '#bcb3b3',
    borderBottomWidth: 1,
    marginVertical: 4,
    flex: 1,
    justifyContent: 'center',
  },
  btnDeleteMessage: {
    backgroundColor: '#fe5051',
  },
  btnText: {
    color: '#fff',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: '8%',
  },
  body: {
    flex: 0.92,
  },
  messageContainer: {
    flexGrow: 1,
    flexDirection: 'column-reverse',
    justifyContent: 'flex-end',
  },
  message: {
    maxWidth: '80%',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 100,
    marginVertical: 6,
  },
  sender: {
    backgroundColor: '#e6e8f0',
    borderBottomLeftRadius: 14,
  },
  sendTimeMessage: {
    fontSize: 10,
    fontWeight: '600',
    color: '#b0b6c4',
  },
  senderText: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  receiver: {
    backgroundColor: '#3ab4f2',
    borderRadius: 100,
    borderBottomEndRadius: 12,
    alignSelf: 'flex-end',
  },
  receiverSendTime: {
    alignSelf: 'flex-end',
  },
  receiverText: {
    color: '#fff',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    borderRadius: 100,
    borderColor: '#a4a8b7',
    borderWidth: 1,
    height: 40,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  userName: {
    color: '#232531',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 18,
  },
  userNameText: {
    color: '#232531',
    textAlign: 'left',
    fontSize: 14,
    fontWeight: '600',
  },
  status: {
    color: '#87d97b',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 18,
  },
  typingStatusContainer: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  typingStatus: {
    color: '#3ab4f2',
    fontSize: 12,
  },
  footer: {
    position: 'absolute',
    bottom: 8,
    left: 14,
    right: 46,
  },
  emojiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
});
