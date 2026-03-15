import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Award, Send, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { type Certificate, useAppStore } from "../../hooks/useAppStore";

export default function AdminCertificates() {
  const store = useAppStore();
  const fileRef = useRef<HTMLInputElement>(null);

  const [volunteerId, setVolunteerId] = useState("");
  const [eventId, setEventId] = useState("");
  const [title, setTitle] = useState("");
  const [fileDataUrl, setFileDataUrl] = useState<string | null>(null);

  function handleFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => setFileDataUrl(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  function handleSend() {
    if (!volunteerId || !eventId || !title) {
      toast.error("Volunteer, event, and title are required");
      return;
    }
    const cert: Certificate = {
      id: `cert_${Date.now().toString(36)}`,
      eventId,
      title,
      fileDataUrl: fileDataUrl || undefined,
      uploadedAt: Date.now(),
      volunteerId,
    };
    store.sendCertificateToVolunteer(cert);
    const vol = store.state.volunteers.find((v) => v.id === volunteerId);
    toast.success(
      `Certificate sent to ${
        vol ? `${vol.firstName} ${vol.lastName}` : "volunteer"
      }`,
    );
    setVolunteerId("");
    setEventId("");
    setTitle("");
    setFileDataUrl(null);
  }

  const eventName = (id: string) =>
    store.state.events.find((e) => e.id === id)?.name || id;

  const volunteerName = (id: string) => {
    const v = store.state.volunteers.find((x) => x.id === id);
    return v ? `${v.firstName} ${v.lastName}` : id;
  };

  const sentCerts = store.state.certificates.filter((c) => !!c.volunteerId);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Certificates</h1>
        <p className="text-muted-foreground">
          Generate and send certificates to individual volunteers
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Award className="h-4 w-4 text-primary" />
            Send Certificate to Volunteer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label>Volunteer</Label>
              <Select value={volunteerId} onValueChange={setVolunteerId}>
                <SelectTrigger data-ocid="admin.cert.volunteer.select">
                  <SelectValue placeholder="Select volunteer" />
                </SelectTrigger>
                <SelectContent>
                  {store.state.volunteers.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.firstName} {v.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {store.state.volunteers.length === 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  No volunteers registered yet.
                </p>
              )}
            </div>
            <div>
              <Label>Event</Label>
              <Select value={eventId} onValueChange={setEventId}>
                <SelectTrigger data-ocid="admin.cert.event.select">
                  <SelectValue placeholder="Select event" />
                </SelectTrigger>
                <SelectContent>
                  {store.state.events.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Certificate Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Participation Certificate"
                data-ocid="admin.cert.title.input"
              />
            </div>
          </div>
          <div>
            <Label>File (optional)</Label>
            <div className="flex gap-3">
              <Input
                type="file"
                ref={fileRef}
                onChange={(e) =>
                  e.target.files?.[0] && handleFile(e.target.files[0])
                }
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileRef.current?.click()}
                data-ocid="admin.cert.upload.button"
              >
                <Upload className="h-4 w-4 mr-2" />
                Attach File
              </Button>
              {fileDataUrl && (
                <span className="text-sm text-muted-foreground self-center">
                  File ready
                </span>
              )}
            </div>
          </div>
          <Button
            onClick={handleSend}
            className="gap-2"
            data-ocid="admin.cert.send.button"
          >
            <Send className="h-4 w-4" />
            Send Certificate
          </Button>
        </CardContent>
      </Card>

      {/* Table of sent certificates */}
      <div className="mb-3">
        <h2 className="text-lg font-semibold">Sent Certificates</h2>
        <p className="text-sm text-muted-foreground">
          Certificates sent to individual volunteers
        </p>
      </div>
      <Table data-ocid="admin.certs.table">
        <TableHeader>
          <TableRow>
            <TableHead>Volunteer</TableHead>
            <TableHead>Event</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sentCerts.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center text-muted-foreground"
                data-ocid="admin.certs.empty_state"
              >
                No certificates sent yet.
              </TableCell>
            </TableRow>
          ) : (
            sentCerts.map((c, i) => (
              <TableRow key={c.id} data-ocid={`admin.cert.row.${i + 1}`}>
                <TableCell className="font-medium">
                  {volunteerName(c.volunteerId!)}
                </TableCell>
                <TableCell>{eventName(c.eventId)}</TableCell>
                <TableCell>{c.title}</TableCell>
                <TableCell>
                  {new Date(c.uploadedAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => store.deleteCertificate(c.id)}
                    data-ocid={`admin.cert.delete.button.${i + 1}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
