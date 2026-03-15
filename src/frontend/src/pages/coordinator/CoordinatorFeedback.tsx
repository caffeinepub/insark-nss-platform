import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import { useAppStore } from "../../hooks/useAppStore";

export default function CoordinatorFeedback() {
  const store = useAppStore();
  const { state } = store;
  const [replies, setReplies] = useState<Record<string, string>>({});

  const user = state.currentUser!;
  const incomingMessages = state.messages.filter(
    (m) =>
      m.fromRole === "volunteer" &&
      (m.toRole === "coordinator" || m.toId === user.id),
  );

  function handleReply(toId: string) {
    const content = replies[toId];
    if (!content?.trim()) {
      toast.error("Message cannot be empty");
      return;
    }
    store.sendMessage({
      id: Date.now().toString(36),
      fromId: user.id,
      fromRole: "coordinator",
      toId,
      toRole: "volunteer",
      content,
      timestamp: Date.now(),
    });
    store.addNotification(toId, "volunteer", "New reply from coordinator.");
    setReplies((r) => ({ ...r, [toId]: "" }));
    toast.success("Reply sent");
  }

  const volunteerIds = [...new Set(incomingMessages.map((m) => m.fromId))];

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Feedback</h1>
        <p className="text-muted-foreground">Messages from volunteers</p>
      </div>

      {volunteerIds.length === 0 ? (
        <p className="text-muted-foreground" data-ocid="feedback.empty_state">
          No messages yet.
        </p>
      ) : (
        volunteerIds.map((volId, idx) => {
          const vol = state.volunteers.find((v) => v.id === volId);
          const volName = vol ? `${vol.firstName} ${vol.lastName}` : volId;
          const msgs = state.messages
            .filter(
              (m) =>
                (m.fromId === volId && m.toRole === "coordinator") ||
                (m.toId === volId && m.fromRole === "coordinator"),
            )
            .sort((a, b) => a.timestamp - b.timestamp);

          return (
            <Card
              key={volId}
              className="mb-6"
              data-ocid={`feedback.thread.item.${idx + 1}`}
            >
              <CardHeader>
                <CardTitle className="text-base">{volName}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {msgs.map((m) => (
                    <div
                      key={m.id}
                      className={`flex ${m.fromRole === "coordinator" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`rounded-lg px-3 py-2 max-w-xs text-sm ${
                          m.fromRole === "coordinator"
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground"
                        }`}
                      >
                        <p>{m.content}</p>
                        <p className="text-xs opacity-60 mt-1">
                          {new Date(m.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Reply..."
                    value={replies[volId] || ""}
                    onChange={(e) =>
                      setReplies((r) => ({ ...r, [volId]: e.target.value }))
                    }
                    className="resize-none h-16"
                    data-ocid={`feedback.reply.textarea.${idx + 1}`}
                  />
                  <Button
                    onClick={() => handleReply(volId)}
                    data-ocid={`feedback.reply.button.${idx + 1}`}
                  >
                    Reply
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}
