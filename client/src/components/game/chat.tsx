import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/use-auth';

interface ChatProps {
  matchId?: string;
}

interface ChatMessage {
  id: number;
  username: string;
  message: string;
  timestamp: Date;
}

export function Chat({ matchId }: ChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user || !matchId) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: 'chat_join',
        matchId,
        userId: user.id
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'chat_message') {
        setMessages(prev => [...prev, {
          id: Date.now(),
          username: data.username,
          message: data.message,
          timestamp: new Date()
        }]);
      }
    };

    setSocket(ws);
    return () => ws.close();
  }, [user, matchId]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = () => {
    if (!inputMessage.trim() || !socket || !user) return;

    socket.send(JSON.stringify({
      type: 'chat_message',
      matchId,
      userId: user.id,
      username: user.username,
      message: inputMessage
    }));

    setInputMessage('');
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Chat</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col h-[600px]">
          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`mb-2 ${
                  msg.username === user?.username
                    ? 'text-right'
                    : 'text-left'
                }`}
              >
                <span className="text-sm text-muted-foreground">
                  {msg.username}
                </span>
                <div
                  className={`mt-1 p-2 rounded-lg inline-block max-w-[80%] ${
                    msg.username === user?.username
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {msg.message}
                </div>
              </div>
            ))}
          </ScrollArea>
          <div className="flex gap-2 mt-4">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type a message..."
            />
            <Button onClick={sendMessage}>Send</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
