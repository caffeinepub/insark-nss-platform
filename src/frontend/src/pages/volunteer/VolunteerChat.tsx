import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { useState } from "react";
import { useAppStore } from "../../hooks/useAppStore";

export default function VolunteerChat() {
  const store = useAppStore();
  const user = store.state.currentUser!;
  const [message, setMessage] = useState("");

  const messages = store.state.messages
    .filter((m) => m.fromId === user.id || m.toId === user.id)
    .sort((a, b) => a.timestamp - b.timestamp);

  function sendMessage() {
    if (!message.trim()) return;
    store.sendMessage({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2),
      fromId: user.id,
      fromRole: "volunteer",
      toId: "coordinator",
      toRole: "coordinator",
      content: message,
      timestamp: Date.now(),
    });
    setMessage("");
  }

  return (
    <div className="p-8 flex flex-col" style={{ height: "calc(100vh - 2rem)" }}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Feedback</h1>
        <p className="text-muted-foreground">Send feedback to coordinators</p>
      </div>

      <div
        className="flex-1 border rounded-xl overflow-y-auto p-4 space-y-3 bg-card mb-4"
        style={{ maxHeight: "60vh" }}
      >
        {messages.length === 0 ? (
          <p
            className="text-muted-foreground text-center"
            data-ocid="chat.empty_state"
          >
            No messages yet. Start the conversation!
          </p>
        ) : (
          messages.map((m, i) => (
            <div
              key={m.id}
              className={`flex ${m.fromId === user.id ? "justify-end" : "justify-start"}`}
              data-ocid={`chat.message.item.${i + 1}`}
            >
              <div
                className={`rounded-xl px-4 py-2 max-w-xs ${
                  m.fromId === user.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                <p className="text-sm">{m.content}</p>
                <p className="text-xs opacity-60 mt-1">
                  {new Date(m.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex gap-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your feedback..."
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          data-ocid="chat.message.input"
        />
        <Button onClick={sendMessage} data-ocid="chat.send.button">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
