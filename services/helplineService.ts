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
  getDocs
} from 'firebase/firestore';
import { chatDb } from '../Firebase-kpchat';

export interface HelplineMessage {
  id?: string;
  text: string;
  senderId: string;
  senderName: string;
  createdAt: any;
  isAdminReply: boolean;
  chatId: string; // This is the public user's UID
}

const COLLECTION_NAME = 'helpline_messages';

export const sendHelplineMessage = async (text: string, senderId: string, senderName: string, chatId: string, isAdminReply: boolean = false) => {
  try {
    await addDoc(collection(chatDb, COLLECTION_NAME), {
      text,
      senderId,
      senderName,
      chatId,
      isAdminReply,
      createdAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error sending helpline message:', error);
  }
};

export const subscribeToHelplineMessages = (chatId: string, callback: (messages: HelplineMessage[]) => void) => {
  const q = query(
    collection(chatDb, COLLECTION_NAME),
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
  });
};

export const subscribeToAllHelplineChats = (callback: (chats: Record<string, HelplineMessage[]>) => void) => {
  const q = query(
    collection(chatDb, COLLECTION_NAME),
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
  });
};

export const cleanupOldMessages = async () => {
  const now = Date.now();
  const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;
  
  const q = query(
    collection(chatDb, COLLECTION_NAME),
    where('createdAt', '<', Timestamp.fromMillis(twentyFourHoursAgo))
  );

  const snapshot = await getDocs(q);
  const deletePromises = snapshot.docs.map(d => deleteDoc(doc(chatDb, COLLECTION_NAME, d.id)));
  await Promise.all(deletePromises);
};
