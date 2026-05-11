import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import { collection, query, where, orderBy, getDocs, updateDoc, doc, addDoc, serverTimestamp, onSnapshot, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, MessageSquare, Check, CheckCheck } from 'lucide-react';
import { format } from 'date-fns';

interface Chat {
  id: string;
  participants: string[];
  participantNames: Record<string, string>;
  participantAvatars: Record<string, string>;
  lastMessage: string;
  lastMessageTime: any;
  unreadCount?: Record<string, number>;
  productId?: string;
  productName?: string;
  productImage?: string;
}

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: any;
  isRead: boolean;
}

export default function SellerMessages() {
  const { user } = useAuthStore();
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingChats, setLoadingChats] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', user.uid),
      orderBy('lastMessageTime', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      const chatData = snap.docs.map(d => ({ id: d.id, ...d.data() } as Chat));
      setChats(chatData);
      setLoadingChats(false);
      
      if (selectedChat) {
         const updatedSelected = chatData.find(c => c.id === selectedChat.id);
         if (updatedSelected) setSelectedChat(updatedSelected);
      }
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!selectedChat || !user) return;
    
    // Mark as read
    if ((selectedChat.unreadCount?.[user.uid] || 0) > 0) {
      updateDoc(doc(db, 'chats', selectedChat.id), {
        [`unreadCount.${user.uid}`]: 0
      }).catch(console.error);
    }

    const messagesQ = query(
      collection(db, 'chats', selectedChat.id, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(messagesQ, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() } as Message)));
    });

    return () => unsubscribe();
  }, [selectedChat, user]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || !selectedChat || !user) return;
    
    const text = newMessage.trim();
    setNewMessage('');
    
    try {
      const buyerId = selectedChat.participants.find(p => p !== user.uid) || selectedChat.participants[0];
      
      const messageRef = collection(db, 'chats', selectedChat.id, 'messages');
      await addDoc(messageRef, {
        senderId: user.uid,
        text,
        timestamp: serverTimestamp(),
        isRead: false
      });
      
      await updateDoc(doc(db, 'chats', selectedChat.id), {
        lastMessage: text,
        lastMessageTime: serverTimestamp(),
        [`unreadCount.${buyerId}`]: increment(1)
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex bg-white rounded-3xl border border-border shadow-sm overflow-hidden">
      {/* Sidebar */}
      <div className={`w-full md:w-80 lg:w-96 border-r border-border flex flex-col ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-border bg-sand/30">
          <h2 className="font-heading font-bold text-xl text-ink">Messages</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {loadingChats ? (
            <div className="p-8 text-center text-muted-foreground animate-pulse font-serif italic">Loading messages...</div>
          ) : chats.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
               <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
               <p className="font-medium text-ink">No messages yet</p>
               <p className="text-sm mt-1">When buyers contact you about your products, conversations will appear here.</p>
            </div>
          ) : (
            chats.map(chat => {
              const otherUserId = chat.participants.find(id => id !== user?.uid) || chat.participants[0];
              const otherUserName = chat.participantNames?.[otherUserId] || 'Buyer';
              const otherUserAvatar = chat.participantAvatars?.[otherUserId] || '';
              const unreadCount = chat.unreadCount?.[user?.uid || ''] || 0;
              const isSelected = selectedChat?.id === chat.id;
              
              return (
                <button 
                  key={chat.id} 
                  onClick={() => setSelectedChat(chat)}
                  className={`w-full text-left p-4 border-b border-border hover:bg-muted/50 transition-colors flex items-start gap-4 ${isSelected ? 'bg-muted/80' : ''}`}
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-navy/10 flex items-center justify-center shrink-0">
                      {otherUserAvatar ? <img src={otherUserAvatar} className="w-full h-full object-cover" alt={`Profile photo of ${otherUserName}`} /> : <span className="font-heading font-bold text-navy italic">{otherUserName[0]}</span>}
                    </div>
                    {unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-gold border-2 border-white rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                        {unreadCount}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <p className="font-bold text-sm truncate">{otherUserName}</p>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                        {chat.lastMessageTime?.toMillis ? format(chat.lastMessageTime.toMillis(), 'MMM d') : ''}
                      </span>
                    </div>
                    {chat.productName && <p className="text-[10px] uppercase tracking-widest text-navy mb-1 truncate">{chat.productName}</p>}
                    <p className={`text-sm truncate ${unreadCount > 0 ? 'font-bold text-ink' : 'text-muted-foreground'}`}>{chat.lastMessage}</p>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col bg-sand/10 ${!selectedChat ? 'hidden md:flex' : 'flex'}`}>
        {!selectedChat ? (
           <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
             <MessageSquare className="w-16 h-16 text-muted-foreground/30 mb-4" />
             <h3 className="font-heading font-bold text-2xl text-ink mb-2">Your Inbox</h3>
             <p className="text-muted-foreground max-w-sm">Select a conversation from the list to start messaging with buyers.</p>
           </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="h-16 px-6 border-b border-border bg-white flex items-center justify-between shadow-sm z-10 shrink-0">
               <div className="flex items-center gap-4">
                 <button className="md:hidden p-2 -ml-2 text-muted-foreground hover:text-ink" onClick={() => setSelectedChat(null)}>
                   &larr; Back
                 </button>
                 {(() => {
                    const otherUserId = selectedChat.participants.find(id => id !== user?.uid) || selectedChat.participants[0];
                    return (
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full overflow-hidden bg-navy/10 flex items-center justify-center shrink-0">
                            {selectedChat.participantAvatars?.[otherUserId] ? <img src={selectedChat.participantAvatars[otherUserId]} className="w-full h-full object-cover" alt={`Profile photo of ${selectedChat.participantNames?.[otherUserId] || 'Buyer'}`} /> : <span className="font-heading font-bold text-navy italic">{selectedChat.participantNames?.[otherUserId]?.[0] || 'B'}</span>}
                         </div>
                         <h3 className="font-bold text-base">{selectedChat.participantNames?.[otherUserId] || 'Buyer'}</h3>
                      </div>
                    );
                 })()}
               </div>
               
               {selectedChat.productName && (
                 <div className="hidden sm:flex items-center gap-2 bg-muted/50 p-2 rounded-lg border border-border">
                   {selectedChat.productImage && <img src={selectedChat.productImage} className="w-8 h-8 rounded shrink-0 object-cover" alt={`${selectedChat.productName} — product being discussed`} />}
                   <p className="text-xs font-medium truncate max-w-[150px]">{selectedChat.productName}</p>
                 </div>
               )}
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 flex flex-col-reverse">
              <div className="space-y-6">
                {messages.map((msg, i) => {
                  const isMine = msg.senderId === user?.uid;
                  const showTime = i === 0 || (msg.timestamp?.toMillis() - messages[i-1]?.timestamp?.toMillis() > 1000 * 60 * 30); // 30 min gap
                  
                  return (
                    <div key={msg.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                      {showTime && (
                         <div className="w-full text-center mb-4 mt-2">
                           <span className="text-[10px] uppercase tracking-widest text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                             {msg.timestamp?.toMillis ? format(msg.timestamp.toMillis(), 'MMM d, h:mm a') : 'Just now'}
                           </span>
                         </div>
                      )}
                      
                      <div className={`max-w-[75%] rounded-2xl px-5 py-3 ${isMine ? 'bg-navy text-white rounded-tr-sm' : 'bg-white border border-border text-ink rounded-tl-sm shadow-sm'}`}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                      </div>
                      
                      {isMine && (
                         <div className="flex items-center mt-1 mr-1 text-muted-foreground">
                            {msg.isRead ? <CheckCheck className="w-3 h-3 text-gold" /> : <Check className="w-3 h-3" />}
                         </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-border mt-auto">
               <div className="flex gap-2 mb-3 overflow-x-auto no-scrollbar pb-1">
                 {['Thank you for your interest!', 'This item is currently available.', 'I will ship this tomorrow.'].map(template => (
                   <button 
                     key={template}
                     type="button" 
                     onClick={() => setNewMessage(p => p ? `${p} ${template}` : template)}
                     className="whitespace-nowrap shrink-0 text-xs px-3 py-1.5 rounded-full border border-border text-muted-foreground hover:text-ink hover:border-ink transition-colors"
                   >
                     {template}
                   </button>
                 ))}
               </div>
               <form onSubmit={handleSendMessage} className="flex gap-2 items-end">
                  <Input 
                    value={newMessage} 
                    onChange={e => setNewMessage(e.target.value)} 
                    placeholder="Type a message..." 
                    className="rounded-2xl rounded-br-sm resize-none"
                    autoComplete="off"
                  />
                  <Button type="submit" disabled={!newMessage.trim()} size="icon" className="h-10 w-10 rounded-2xl rounded-bl-sm shrink-0 bg-gold hover:bg-gold-light text-white transition-colors">
                     <Send className="w-4 h-4" />
                  </Button>
               </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
