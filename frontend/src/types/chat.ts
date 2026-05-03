export type User = {
  _id: string;
  fullName: string;
  email: string;
  profilePic: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Message = {
  _id: string;
  senderId: string;
  receiverId: string;
  text: string;
  image: string;
  createdAt: string;
  updatedAt: string;
};

export type ChatPreview = {
  contact: User;
  lastMessage: Message;
};

export type AuthFormData = {
  fullName?: string;
  email: string;
  password: string;
};
