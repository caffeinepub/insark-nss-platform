import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { type CommunityMessage, useAppStore } from "../../hooks/useAppStore";

const ROLE_BADGE: Record<string, { label: string; className: string }> = {
  admin: { label: "Admin", className: "bg-emerald-600 text-white" },
  coordinator: { label: "Coordinator", className: "bg-blue-600 text-white" },
  volunteer: { label: "Volunteer", className: "bg-amber-500 text-white" },
};

export default function CoordinatorChat() {
  const store = useAppStore();
  const user = store.state.currentUser!;
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const messages = [...store.state.communityMessages].sort(
    (a, b) => a.timestamp - b.timestamp,
  );

  function handleSend() {
    if (!text.trim()) return;
    const msg: CommunityMessage = {
      id: `cm_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`,
      fromId: user.id,
      fromName: user.name,
      fromRole: user.role,
      content: text.trim(),
      timestamp: Date.now(),
    };
    store.sendCommunityMessage(msg);
    setText("");
    setTimeout(
      () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
      50,
    );
  }

  function handleDelete(id: string) {
    store.deleteCommunityMessage(id);
    toast.success("Message deleted");
  }

  return (
    <div className="flex flex-col h-screen p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-primary" />
          Community Chat
        </h1>
        <p className="text-muted-foreground">Chat with admin and volunteers</p>
      </div>

      <div className="flex-1 border rounded-xl overflow-hidden flex flex-col bg-card">
        <ScrollArea className="flex-1 p-4">
          {messages.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center h-40 text-muted-foreground gap-2"
              data-ocid="communitychat.empty_state"
            >
              <MessageSquare className="h-10 w-10 opacity-30" />
              <p>No messages yet. Be the first to say something!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg, i) => {
                const isOwn = msg.fromId === user.id;
                const canDelete = msg.fromId === user.id;
                const badge = ROLE_BADGE[msg.fromRole] ?? ROLE_BADGE.volunteer;
                return (
                  <div
                    key={msg.id}
                    className={`group flex gap-3 ${
                      isOwn ? "flex-row-reverse" : "flex-row"
                    }`}
                    data-ocid={`communitychat.message.item.${i + 1}`}
                  >
                    <div
                      className={`max-w-[70%] space-y-1 ${
                        isOwn ? "items-end" : "items-start"
                      } flex flex-col`}
                    >
                      <div
                        className={`flex items-center gap-2 ${
                          isOwn ? "flex-row-reverse" : ""
                        }`}
                      >
                        <span className="text-xs font-medium text-foreground">
                          {msg.fromName}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${badge.className}`}
                        >
                          {badge.label}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <div
                        className={`rounded-2xl px-4 py-2 text-sm ${
                          isOwn
                            ? "bg-primary text-primary-foreground rounded-tr-sm"
                            : "bg-muted text-foreground rounded-tl-sm"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                    {canDelete && (
                      <button
                        type="button"
                        className="opacity-0 group-hover:opacity-100 transition-opacity self-center p-1 rounded hover:bg-destructive/10 text-destructive"
                        onClick={() => handleDelete(msg.id)}
                        data-ocid={`communitychat.delete.button.${i + 1}`}
                        title="Delete message"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
          )}
        </ScrollArea>

        <div className="border-t p-4 flex gap-3">
          <Input
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            data-ocid="communitychat.input"
            className="flex-1"
          />
          <Button onClick={handleSend} data-ocid="communitychat.send.button">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
