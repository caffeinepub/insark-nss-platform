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

export default function CoordinatorCertificates() {
  const store = useAppStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const sendFileRef = useRef<HTMLInputElement>(null);

  // Global upload state
  const [eventId, setEventId] = useState("");
  const [title, setTitle] = useState("");
  const [fileDataUrl, setFileDataUrl] = useState<string | null>(null);

  // Send-to-volunteer state
  const [sendVolunteerId, setSendVolunteerId] = useState("");
  const [sendEventId, setSendEventId] = useState("");
  const [sendTitle, setSendTitle] = useState("");
  const [sendFileDataUrl, setSendFileDataUrl] = useState<string | null>(null);

  function handleFile(file: File, setter: (v: string | null) => void) {
    const reader = new FileReader();
    reader.onload = (e) => setter(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  function handleUpload() {
    if (!eventId || !title) {
      toast.error("Event and title required");
      return;
    }
    const cert: Certificate = {
      id: `cert_${Date.now().toString(36)}`,
      eventId,
      title,
      fileDataUrl: fileDataUrl || undefined,
      uploadedAt: Date.now(),
    };
    store.addCertificate(cert);
    toast.success("Certificate uploaded for all volunteers");
    setEventId("");
    setTitle("");
    setFileDataUrl(null);
  }

  function handleSendToVolunteer() {
    if (!sendVolunteerId || !sendEventId || !sendTitle) {
      toast.error("Volunteer, event, and title are required");
      return;
    }
    const cert: Certificate = {
      id: `cert_${Date.now().toString(36)}`,
      eventId: sendEventId,
      title: sendTitle,
      fileDataUrl: sendFileDataUrl || undefined,
      uploadedAt: Date.now(),
      volunteerId: sendVolunteerId,
    };
    store.sendCertificateToVolunteer(cert);
    const vol = store.state.volunteers.find((v) => v.id === sendVolunteerId);
    toast.success(
      `Certificate sent to ${vol ? `${vol.firstName} ${vol.lastName}` : "volunteer"}`,
    );
    setSendVolunteerId("");
    setSendEventId("");
    setSendTitle("");
    setSendFileDataUrl(null);
  }

  const eventName = (id: string) =>
    store.state.events.find((e) => e.id === id)?.name || id;

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Certificates</h1>
        <p className="text-muted-foreground">
          Upload event certificates for volunteers
        </p>
      </div>

      {/* Global Upload Section */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload Certificate (All Volunteers)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Event</Label>
              <Select value={eventId} onValueChange={setEventId}>
                <SelectTrigger data-ocid="cert.event.select">
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
                data-ocid="cert.title.input"
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
                  e.target.files?.[0] &&
                  handleFile(e.target.files[0], setFileDataUrl)
                }
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileRef.current?.click()}
                data-ocid="cert.upload.button"
              >
                <Upload className="h-4 w-4 mr-2" />
                Choose File
              </Button>
              {fileDataUrl && (
                <span className="text-sm text-muted-foreground self-center">
                  File ready
                </span>
              )}
            </div>
          </div>
          <Button onClick={handleUpload} data-ocid="cert.save.button">
            Upload Certificate
          </Button>
        </CardContent>
      </Card>

      {/* Send to Individual Volunteer Section */}
      <Card className="mb-8">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Award className="h-4 w-4 text-primary" />
            Send Certificate to Individual Volunteer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label>Volunteer</Label>
              <Select
                value={sendVolunteerId}
                onValueChange={setSendVolunteerId}
              >
                <SelectTrigger data-ocid="cert.send.volunteer.select">
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
              <Select value={sendEventId} onValueChange={setSendEventId}>
                <SelectTrigger data-ocid="cert.send.event.select">
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
                value={sendTitle}
                onChange={(e) => setSendTitle(e.target.value)}
                placeholder="e.g. Excellence Award"
                data-ocid="cert.send.title.input"
              />
            </div>
          </div>
          <div>
            <Label>File (optional)</Label>
            <div className="flex gap-3">
              <Input
                type="file"
                ref={sendFileRef}
                onChange={(e) =>
                  e.target.files?.[0] &&
                  handleFile(e.target.files[0], setSendFileDataUrl)
                }
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => sendFileRef.current?.click()}
                data-ocid="cert.send.upload.button"
              >
                <Upload className="h-4 w-4 mr-2" />
                Attach File
              </Button>
              {sendFileDataUrl && (
                <span className="text-sm text-muted-foreground self-center">
                  File ready
                </span>
              )}
            </div>
          </div>
          <Button
            onClick={handleSendToVolunteer}
            className="gap-2"
            data-ocid="cert.send.submit.button"
          >
            <Send className="h-4 w-4" />
            Send Certificate
          </Button>
        </CardContent>
      </Card>

      {/* Certificates Table */}
      <Table data-ocid="coord.certs.table">
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Event</TableHead>
            <TableHead>Recipient</TableHead>
            <TableHead>Uploaded</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {store.state.certificates.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center text-muted-foreground"
                data-ocid="coord.certs.empty_state"
              >
                No certificates uploaded.
              </TableCell>
            </TableRow>
          ) : (
            store.state.certificates.map((c, i) => {
              const recipient = c.volunteerId
                ? store.state.volunteers.find((v) => v.id === c.volunteerId)
                : null;
              return (
                <TableRow key={c.id} data-ocid={`coord.cert.row.${i + 1}`}>
                  <TableCell>{c.title}</TableCell>
                  <TableCell>{eventName(c.eventId)}</TableCell>
                  <TableCell>
                    {recipient ? (
                      `${recipient.firstName} ${recipient.lastName}`
                    ) : (
                      <span className="text-muted-foreground text-xs">
                        All Volunteers
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(c.uploadedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => store.deleteCertificate(c.id)}
                      data-ocid={`coord.cert.delete.button.${i + 1}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
