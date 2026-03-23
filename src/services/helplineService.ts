import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  Timestamp, 
  where,
  deleteDoc,
  doc,
  getDocs,
  updateDoc
} from 'firebase/firestore';
import { helplineDb } from '../../Firebase-helpline';

import { handleFirestoreError, OperationType } from './firestoreErrorHandler';

export interface HelplineMessage {
  id?: string;
  text: string;
  senderId: string;
  senderName: string;
  createdAt: any;
  isAdminReply: boolean;
  chatId: string; // This is the public user's UID
  readByAdmin?: boolean;
}

const COLLECTION_NAME = 'helpline_messages';

export const sendHelplineMessage = async (text: string, senderId: string, senderName: string, chatId: string, isAdminReply: boolean = false) => {
  try {
    await addDoc(collection(helplineDb, COLLECTION_NAME), {
      text,
      senderId,
      senderName,
      chatId,
      isAdminReply,
      readByAdmin: isAdminReply, // Admin replies are read by default
      createdAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error sending helpline message:', error);
  }
};

export const subscribeToHelplineMessages = (chatId: string, callback: (messages: HelplineMessage[]) => void) => {
  const q = query(
    collection(helplineDb, COLLECTION_NAME),
    where('chatId', '==', chatId)
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as HelplineMessage[];
    
    // Filter messages older than 24 hours
    const now = Date.now();
    const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;
    
    // Sort and filter client-side
    const processedMessages = messages
      .filter(msg => {
        const msgTime = msg.createdAt?.toMillis ? msg.createdAt.toMillis() : 0;
        return msgTime > twentyFourHoursAgo;
      })
      .sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return timeA - timeB; // Ascending for chat view
      });

    callback(processedMessages);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, `${COLLECTION_NAME}/${chatId}`);
  });
};

export const subscribeToAllHelplineChats = (callback: (chats: Record<string, HelplineMessage[]>) => void) => {
  const q = query(
    collection(helplineDb, COLLECTION_NAME),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as HelplineMessage[];

    const now = Date.now();
    const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;
    
    const chats: Record<string, HelplineMessage[]> = {};
    
    messages.forEach(msg => {
      const msgTime = msg.createdAt?.toMillis ? msg.createdAt.toMillis() : 0;
      if (msgTime > twentyFourHoursAgo) {
        if (!chats[msg.chatId]) {
          chats[msg.chatId] = [];
        }
        chats[msg.chatId].push(msg);
      }
    });

    callback(chats);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, COLLECTION_NAME);
  });
};

export const markChatAsRead = async (chatId: string) => {
  try {
    const q = query(
      collection(helplineDb, COLLECTION_NAME),
      where('chatId', '==', chatId),
      where('readByAdmin', '==', false)
    );
    const snapshot = await getDocs(q);
    const promises = snapshot.docs.map(d => updateDoc(doc(helplineDb, COLLECTION_NAME, d.id), { readByAdmin: true }));
    await Promise.all(promises);
  } catch (error) {
    console.error('Error marking chat as read:', error);
  }
};

export const subscribeToUnreadCount = (callback: (count: number) => void) => {
  const q = query(
    collection(helplineDb, COLLECTION_NAME),
    where('readByAdmin', '==', false),
    where('isAdminReply', '==', false)
  );

  return onSnapshot(q, (snapshot) => {
    // We want to count unique chatIds that have unread messages
    const uniqueChatIds = new Set();
    snapshot.docs.forEach(doc => {
      uniqueChatIds.add(doc.data().chatId);
    });
    callback(uniqueChatIds.size);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, `${COLLECTION_NAME}/unread_count`);
  });
};

export const cleanupOldMessages = async () => {
  const now = Date.now();
  const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;
  
  const q = query(
    collection(helplineDb, COLLECTION_NAME),
    where('createdAt', '<', Timestamp.fromMillis(twentyFourHoursAgo))
  );

  const snapshot = await getDocs(q);
  const deletePromises = snapshot.docs.map(d => deleteDoc(doc(helplineDb, COLLECTION_NAME, d.id)));
  await Promise.all(deletePromises);
};
