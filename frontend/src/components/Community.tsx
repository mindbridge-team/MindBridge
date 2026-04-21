import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { MessageSquare, Users } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ErrorMessage } from './ui/feedback';
import { Input } from './ui/input';
import { useAuth } from '../contexts/AuthContext';
import {
  createRoom,
  getNotifications,
  getRoomMessages,
  getRooms,
  joinRoom,
  leaveRoom,
  sendRoomMessage,
  type ChatMessage,
  type Room,
  type Notification,
} from '../lib/api';
import { createApiAuth } from '../lib/auth';

function formatTime(iso: string): string {
  const date = new Date(iso);
  if (!Number.isFinite(date.getTime())) return iso;
  return date.toLocaleString();
}

export function Community() {
  const { accessToken, refreshToken, persistAccessToken, me } = useAuth();
  const auth = useMemo(
    () => createApiAuth(refreshToken, persistAccessToken),
    [refreshToken, persistAccessToken]
  );

  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [messageText, setMessageText] = useState('');
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomDescription, setNewRoomDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastMessagesUpdatedAt, setLastMessagesUpdatedAt] = useState<Date | null>(null);
  const [lastNotificationsUpdatedAt, setLastNotificationsUpdatedAt] = useState<Date | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadInitial() {
      if (!accessToken) return;
      setLoading(true);
      setError('');
      try {
        const [roomList, notificationList] = await Promise.all([
          getRooms(accessToken, auth),
          getNotifications(accessToken, auth),
        ]);
        if (cancelled) return;
        setRooms(roomList);
        setNotifications(notificationList);
        setLastNotificationsUpdatedAt(new Date());
        setSelectedRoomId((prev) => prev ?? roomList[0]?.id ?? null);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load community data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void loadInitial();
    return () => {
      cancelled = true;
    };
  }, [accessToken, auth]);

  useEffect(() => {
    let cancelled = false;
    async function loadMessages() {
      if (!accessToken || !selectedRoomId) {
        setMessages([]);
        return;
      }
      try {
        // Backend only allows messages for room participants; joining is idempotent.
        await joinRoom(accessToken, selectedRoomId, auth);
        const roomMessages = await getRoomMessages(accessToken, selectedRoomId, auth);
        if (!cancelled) {
          setMessages(roomMessages);
          setLastMessagesUpdatedAt(new Date());
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load room messages');
      }
    }
    void loadMessages();
    return () => {
      cancelled = true;
    };
  }, [accessToken, selectedRoomId, auth]);

  useEffect(() => {
    if (!accessToken || !selectedRoomId) return;
    const intervalId = window.setInterval(async () => {
      try {
        await joinRoom(accessToken, selectedRoomId, auth);
        const roomMessages = await getRoomMessages(accessToken, selectedRoomId, auth);
        setMessages(roomMessages);
        setLastMessagesUpdatedAt(new Date());
      } catch {
        // Keep polling silent to avoid noisy UI for temporary network issues.
      }
    }, 5000);
    return () => {
      window.clearInterval(intervalId);
    };
  }, [accessToken, selectedRoomId, auth]);

  useEffect(() => {
    if (!accessToken) return;
    const intervalId = window.setInterval(async () => {
      try {
        const notificationList = await getNotifications(accessToken, auth);
        setNotifications(notificationList);
        setLastNotificationsUpdatedAt(new Date());
      } catch {
        // Keep polling silent to avoid noisy UI for temporary network issues.
      }
    }, 10000);
    return () => {
      window.clearInterval(intervalId);
    };
  }, [accessToken, auth]);

  async function handleJoin(roomId: number) {
    if (!accessToken) return;
    setError('');
    try {
      await joinRoom(accessToken, roomId, auth);
      setSelectedRoomId(roomId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join room');
    }
  }

  async function handleLeave(roomId: number) {
    if (!accessToken) return;
    setError('');
    try {
      await leaveRoom(accessToken, roomId, auth);
      if (selectedRoomId === roomId) {
        setSelectedRoomId(null);
        setMessages([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to leave room');
    }
  }

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    if (!accessToken || !selectedRoomId || !messageText.trim()) return;
    setError('');
    try {
      await joinRoom(accessToken, selectedRoomId, auth);
      const sent = await sendRoomMessage(accessToken, selectedRoomId, messageText.trim(), auth);
      setMessages((prev) => [...prev, sent]);
      setMessageText('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    }
  }

  async function handleCreateRoom(e: FormEvent) {
    e.preventDefault();
    if (!accessToken || !newRoomName.trim()) return;
    setError('');
    try {
      const created = await createRoom(accessToken, newRoomName.trim(), newRoomDescription.trim(), auth);
      setRooms((prev) => [created, ...prev]);
      setSelectedRoomId(created.id);
      setNewRoomName('');
      setNewRoomDescription('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create room');
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div>
        <h2 className="text-2xl text-foreground">Community</h2>
        <p className="text-sm text-muted-foreground">Join rooms, chat, and view your notifications.</p>
      </div>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4" />
              Rooms
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading rooms…</p>
            ) : rooms.length === 0 ? (
              <p className="text-sm text-muted-foreground">No rooms yet.</p>
            ) : (
              rooms.map((room) => (
                <div key={room.id} className="rounded-md border p-2 space-y-2">
                  <button
                    type="button"
                    className="w-full text-left"
                    onClick={() => setSelectedRoomId(room.id)}
                  >
                    <p className="text-sm font-medium">{room.name}</p>
                    {room.description ? <p className="text-xs text-muted-foreground">{room.description}</p> : null}
                  </button>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => void handleJoin(room.id)}>Join</Button>
                    <Button size="sm" variant="outline" onClick={() => void handleLeave(room.id)}>Leave</Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageSquare className="h-4 w-4" />
              Room chat
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Last updated: {lastMessagesUpdatedAt ? lastMessagesUpdatedAt.toLocaleTimeString() : '—'}
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {!selectedRoomId ? (
              <p className="text-sm text-muted-foreground">Pick or join a room to start chatting.</p>
            ) : (
              <>
                <div className="max-h-72 overflow-y-auto border rounded-md p-2 space-y-2 bg-muted/30">
                  {messages.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No messages yet.</p>
                  ) : (
                    messages.map((message) => (
                      <div key={message.id} className="text-sm">
                        <p>
                          <span className="font-medium">{message.user}</span>: {message.message_text}
                        </p>
                        <p className="text-xs text-muted-foreground">{formatTime(message.created_at)}</p>
                      </div>
                    ))
                  )}
                </div>
                <form onSubmit={handleSend} className="flex gap-2">
                  <Input
                    placeholder="Write a message"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                  />
                  <Button type="submit">Send</Button>
                </form>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {(me?.role === 'counsellor' || me?.role === 'admin') && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Create room</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateRoom} className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Input
                placeholder="Room name"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
              />
              <Input
                placeholder="Description (optional)"
                value={newRoomDescription}
                onChange={(e) => setNewRoomDescription(e.target.value)}
              />
              <Button type="submit">Create</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">My notifications</CardTitle>
          <p className="text-xs text-muted-foreground">
            Last updated: {lastNotificationsUpdatedAt ? lastNotificationsUpdatedAt.toLocaleTimeString() : '—'}
          </p>
        </CardHeader>
        <CardContent className="space-y-2">
          {notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground">No notifications yet.</p>
          ) : (
            notifications.map((notification) => (
              <div key={notification.id} className="rounded-md border p-2">
                <p className="text-sm font-medium">{notification.title}</p>
                <p className="text-sm text-muted-foreground">{notification.message}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
