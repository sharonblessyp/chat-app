import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const formatMessageTime = (value?: string) => {
  if (!value) {
    return "";
  }

  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Unable to read file"));
    reader.readAsDataURL(file);
  });

function ChatPage() {
  const authUser = useAuthStore((state) => state.authUser);
  const logout = useAuthStore((state) => state.logout);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const isUpdatingProfile = useAuthStore((state) => state.isUpdatingProfile);

  const contacts = useChatStore((state) => state.contacts);
  const chats = useChatStore((state) => state.chats);
  const messages = useChatStore((state) => state.messages);
  const selectedContact = useChatStore((state) => state.selectedContact);
  const isContactsLoading = useChatStore((state) => state.isContactsLoading);
  const isChatsLoading = useChatStore((state) => state.isChatsLoading);
  const isMessagesLoading = useChatStore((state) => state.isMessagesLoading);
  const isSendingMessage = useChatStore((state) => state.isSendingMessage);
  const getContacts = useChatStore((state) => state.getContacts);
  const getChats = useChatStore((state) => state.getChats);
  const getMessages = useChatStore((state) => state.getMessages);
  const setSelectedContact = useChatStore((state) => state.setSelectedContact);
  const sendMessage = useChatStore((state) => state.sendMessage);
  const resetChat = useChatStore((state) => state.resetChat);

  const [messageText, setMessageText] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [activeList, setActiveList] = useState<"recent" | "contacts">("recent");
  const profileInputRef = useRef<HTMLInputElement | null>(null);
  const messageInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    void Promise.all([getContacts(), getChats()]);

    return () => {
      resetChat();
    };
  }, [getContacts, getChats, resetChat]);

  useEffect(() => {
    if (!selectedContact && chats.length > 0) {
      setSelectedContact(chats[0].contact);
    }
  }, [chats, selectedContact, setSelectedContact]);

  useEffect(() => {
    if (!selectedContact) {
      return;
    }

    void getMessages(selectedContact._id);
  }, [selectedContact, getMessages]);

  const handleProfileFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const imageData = await fileToDataUrl(file);
      await updateProfile(imageData);
    } catch {
      // Toast feedback is handled in the auth store.
    }

    event.target.value = "";
  };

  const handleMessageFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const imageData = await fileToDataUrl(file);
      setImagePreview(imageData);
    } catch {
      setImagePreview("");
    }

    event.target.value = "";
  };

  const handleSendMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedContact) {
      return;
    }

    try {
      await sendMessage(selectedContact._id, {
        text: messageText,
        image: imagePreview,
      });

      setMessageText("");
      setImagePreview("");
    } catch {
      // Toast feedback is handled in the chat store.
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      resetChat();
    } catch {
      // Toast feedback is handled in the auth store.
    }
  };

  if (!authUser) {
    return null;
  }

  return (
    <div className="relative z-10 flex h-[calc(100vh-2rem)] w-full max-w-7xl overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/70 shadow-[0_28px_120px_rgba(15,23,42,0.8)] backdrop-blur lg:flex-row">
      <aside
        className={`w-full max-w-sm flex-col border-r border-white/10 bg-slate-950/90 ${
          selectedContact ? "hidden lg:flex" : "flex"
        }`}
      >
        <div className="border-b border-white/10 p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                className="relative"
                onClick={() => profileInputRef.current?.click()}
                type="button"
              >
                <img
                  alt={authUser.fullName}
                  className="size-16 rounded-2xl border border-white/10 object-cover"
                  src={
                    authUser.profilePic ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(authUser.fullName)}&background=0f172a&color=ffffff`
                  }
                />
                <span className="absolute -bottom-1 -right-1 rounded-full bg-cyan-400 px-2 py-1 text-[10px] font-bold text-slate-950">
                  Change
                </span>
              </button>

              <div>
                <h2 className="mt-1 text-xl font-bold text-white">{authUser.fullName}</h2>
                <p className="text-sm text-slate-400">{authUser.email}</p>
                <p className="mt-2 text-xs text-cyan-300">
                  {isUpdatingProfile ? "Updating photo..." : "Tap avatar to change profile photo"}
                </p>
              </div>
            </div>

            <button
              className="rounded-2xl border border-white/10 px-3 py-2 text-sm font-medium text-slate-300 transition hover:border-cyan-300/40 hover:text-white"
              onClick={handleLogout}
              type="button"
            >
              Logout
            </button>
          </div>

          <input
            accept="image/*"
            className="hidden"
            onChange={handleProfileFileChange}
            ref={profileInputRef}
            type="file"
          />
        </div>

        <div className="border-b border-white/10 px-6 py-4">
          <div className="inline-flex rounded-2xl border border-white/10 bg-slate-900/80 p-1">
            <button
              className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                activeList === "recent"
                  ? "bg-cyan-400 text-slate-950"
                  : "text-slate-400 hover:text-white"
              }`}
              onClick={() => setActiveList("recent")}
              type="button"
            >
              Recent chats
            </button>
            <button
              className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                activeList === "contacts"
                  ? "bg-cyan-400 text-slate-950"
                  : "text-slate-400 hover:text-white"
              }`}
              onClick={() => setActiveList("contacts")}
              type="button"
            >
              Contacts
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          {activeList === "recent" ? (
            <div className="space-y-2">
              {isChatsLoading && (
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-400">
                  Loading recent conversations...
                </div>
              )}

              {!isChatsLoading && chats.length === 0 && (
                <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 px-4 py-6 text-sm text-slate-400">
                  No recent chats yet. Start a conversation from the contacts tab.
                </div>
              )}

              {chats.map((chat) => (
                <button
                  className={`flex w-full items-start gap-3 rounded-3xl border px-4 py-4 text-left transition ${
                    selectedContact?._id === chat.contact._id
                      ? "border-cyan-300/30 bg-cyan-400/10"
                      : "border-transparent bg-white/5 hover:border-white/10 hover:bg-white/8"
                  }`}
                  key={chat.contact._id}
                  onClick={() => setSelectedContact(chat.contact)}
                  type="button"
                >
                  <img
                    alt={chat.contact.fullName}
                    className="size-12 rounded-2xl object-cover"
                    src={
                      chat.contact.profilePic ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(chat.contact.fullName)}&background=111827&color=ffffff`
                    }
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate font-semibold text-white">{chat.contact.fullName}</p>
                      <span className="text-xs text-slate-500">
                        {formatMessageTime(chat.lastMessage.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-sm text-slate-400">
                      {chat.lastMessage.text || "Sent an image"}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {isContactsLoading && (
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-400">
                  Loading contacts...
                </div>
              )}

              {!isContactsLoading && contacts.length === 0 && (
                <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 px-4 py-6 text-sm text-slate-400">
                  No contacts available right now.
                </div>
              )}

              {contacts.map((contact) => (
                <button
                  className={`flex w-full items-center gap-3 rounded-3xl border px-4 py-4 text-left transition ${
                    selectedContact?._id === contact._id
                      ? "border-fuchsia-300/30 bg-fuchsia-400/10"
                      : "border-transparent bg-white/5 hover:border-white/10 hover:bg-white/8"
                  }`}
                  key={contact._id}
                  onClick={() => setSelectedContact(contact)}
                  type="button"
                >
                  <img
                    alt={contact.fullName}
                    className="size-12 rounded-2xl object-cover"
                    src={
                      contact.profilePic ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(contact.fullName)}&background=111827&color=ffffff`
                    }
                  />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-white">{contact.fullName}</p>
                    <p className="truncate text-sm text-slate-400">{contact.email}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>

      <section
        className={`min-w-0 flex-1 flex-col bg-[linear-gradient(180deg,rgba(15,23,42,0.8),rgba(2,6,23,0.95))] ${
          selectedContact ? "absolute inset-0 z-20 flex lg:static" : "hidden lg:flex"
        }`}
      >
        {selectedContact ? (
          <>
            <header className="flex items-center justify-between border-b border-white/10 px-8 py-5">
              <div className="flex items-center gap-4">
                <button
                  className="rounded-2xl border border-white/10 px-3 py-2 text-sm text-slate-300 transition hover:border-white/20 hover:text-white lg:hidden"
                  onClick={() => setSelectedContact(null)}
                  type="button"
                >
                  Back
                </button>
                <img
                  alt={selectedContact.fullName}
                  className="size-14 rounded-2xl object-cover"
                  src={
                    selectedContact.profilePic ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedContact.fullName)}&background=111827&color=ffffff`
                  }
                />
                <div>
                  <h3 className="text-2xl font-bold text-white">{selectedContact.fullName}</h3>
                  <p className="text-sm text-slate-400">{selectedContact.email}</p>
                </div>
              </div>

              <button
                className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:border-white/20 hover:text-white"
                onClick={() => {
                  void Promise.all([getChats(), getMessages(selectedContact._id)]);
                }}
                type="button"
              >
                Refresh
              </button>
            </header>

            <div className="flex-1 space-y-4 overflow-y-auto px-8 py-6">
              {isMessagesLoading && (
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-400">
                  Loading conversation...
                </div>
              )}

              {!isMessagesLoading && messages.length === 0 && (
                <div className="flex h-full items-center justify-center">
                  <div className="max-w-md rounded-[2rem] border border-dashed border-white/10 bg-white/5 px-8 py-10 text-center">
                    <p className="text-sm uppercase tracking-[0.22em] text-slate-500">Say hello</p>
                    <h4 className="mt-3 text-2xl font-bold text-white">
                      Start the first message with {selectedContact.fullName}
                    </h4>
                    <p className="mt-3 text-sm leading-7 text-slate-400">
                      Send text, attach an image, and this thread will begin showing up in
                      your recent chat list.
                    </p>
                  </div>
                </div>
              )}

              {messages.map((message) => {
                const isOwnMessage = message.senderId === authUser._id;

                return (
                  <div
                    className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                    key={message._id}
                  >
                    <div
                      className={`max-w-xl rounded-[2rem] px-5 py-4 shadow-lg ${
                        isOwnMessage
                          ? "rounded-br-md bg-cyan-400 text-slate-950"
                          : "rounded-bl-md border border-white/10 bg-white/6 text-white"
                      }`}
                    >
                      {message.image && (
                        <img
                          alt="message attachment"
                          className="mb-3 max-h-72 w-full rounded-2xl object-cover"
                          src={message.image}
                        />
                      )}
                      {message.text && (
                        <p className="whitespace-pre-wrap text-sm leading-7">{message.text}</p>
                      )}
                      <p
                        className={`mt-3 text-[11px] uppercase tracking-[0.18em] ${
                          isOwnMessage ? "text-slate-800/70" : "text-slate-500"
                        }`}
                      >
                        {formatMessageTime(message.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <form className="border-t border-white/10 px-8 py-5" onSubmit={handleSendMessage}>
              {imagePreview && (
                <div className="mb-4 inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                  <img
                    alt="selected attachment preview"
                    className="size-16 rounded-xl object-cover"
                    src={imagePreview}
                  />
                  <button
                    className="rounded-xl border border-white/10 px-3 py-2 text-xs uppercase tracking-[0.16em] text-slate-300 transition hover:text-white"
                    onClick={() => setImagePreview("")}
                    type="button"
                  >
                    Remove
                  </button>
                </div>
              )}

              <div className="flex items-end gap-3">
                <label className="inline-flex cursor-pointer items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm font-medium text-slate-200 transition hover:border-cyan-300/30 hover:text-white">
                  Image
                  <input
                    accept="image/*"
                    className="hidden"
                    onChange={handleMessageFileChange}
                    ref={messageInputRef}
                    type="file"
                  />
                </label>

                <textarea
                  className="min-h-[64px] flex-1 rounded-[1.5rem] border border-white/10 bg-slate-900/70 px-5 py-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-400/20"
                  onChange={(event) => setMessageText(event.target.value)}
                  placeholder={`Message ${selectedContact.fullName}...`}
                  value={messageText}
                />

                <button
                  className="rounded-[1.4rem] bg-fuchsia-400 px-6 py-4 font-semibold text-slate-950 transition hover:bg-fuchsia-300 disabled:cursor-not-allowed disabled:bg-fuchsia-950/60 disabled:text-slate-400"
                  disabled={isSendingMessage}
                  type="submit"
                >
                  {isSendingMessage ? "Sending..." : "Send"}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex h-full items-center justify-center px-10">
            <div className="max-w-xl rounded-[2rem] border border-white/10 bg-white/5 px-10 py-12 text-center">
              <p className="text-sm uppercase tracking-[0.22em] text-slate-500">Choose a thread</p>
              <h3 className="mt-4 text-3xl font-black text-white">
                Select a recent chat or contact
              </h3>
              <p className="mt-4 text-sm leading-8 text-slate-400">
                Once you pick someone from the sidebar, this area will show your message history
                and composer with image upload support.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default ChatPage;
