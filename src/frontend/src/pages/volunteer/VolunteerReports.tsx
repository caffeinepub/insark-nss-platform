import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { type Report, useAppStore } from "../../hooks/useAppStore";

export default function VolunteerReports() {
  const store = useAppStore();
  const user = store.state.currentUser!;
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    eventName: "",
    title: "",
    description: "",
  });
  const [fileDataUrl, setFileDataUrl] = useState<string | null>(null);

  const myReports = store.state.reports.filter(
    (r) => r.volunteerId === user.id,
  );

  function handleFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => setFileDataUrl(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  function handleSubmit() {
    if (!form.eventName || !form.title) {
      toast.error("Event name and title required");
      return;
    }
    const r: Report = {
      id: `rpt_${Date.now().toString(36)}`,
      volunteerId: user.id,
      volunteerName: user.name,
      ...form,
      fileDataUrl: fileDataUrl || undefined,
      status: "Pending",
      submittedAt: Date.now(),
    };
    store.addReport(r);
    toast.success("Report submitted");
    setForm({ eventName: "", title: "", description: "" });
    setFileDataUrl(null);
  }

  function handleDelete(id: string) {
    store.deleteReport(id);
    toast.success("Report deleted");
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">My Reports</h1>
        <p className="text-muted-foreground">Submit service activity reports</p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Submit New Report</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Event Name</Label>
            <Input
              value={form.eventName}
              onChange={(e) =>
                setForm((f) => ({ ...f, eventName: e.target.value }))
              }
              data-ocid="report.eventname.input"
            />
          </div>
          <div>
            <Label>Report Title</Label>
            <Input
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              data-ocid="report.title.input"
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              data-ocid="report.description.textarea"
            />
          </div>
          <div>
            <Label>Attach File (optional)</Label>
            <div className="flex gap-3 mt-1">
              <input
                type="file"
                ref={fileRef}
                className="hidden"
                onChange={(e) =>
                  e.target.files?.[0] && handleFile(e.target.files[0])
                }
              />
              <Button
                variant="outline"
                onClick={() => fileRef.current?.click()}
                data-ocid="report.file.upload.button"
              >
                <Upload className="h-4 w-4 mr-2" />
                Choose File
              </Button>
              {fileDataUrl && (
                <span className="text-sm text-muted-foreground self-center">
                  File attached
                </span>
              )}
            </div>
          </div>
          <Button onClick={handleSubmit} data-ocid="report.submit.button">
            Submit Report
          </Button>
        </CardContent>
      </Card>

      <h2 className="text-lg font-semibold mb-4">Submitted Reports</h2>
      <Table data-ocid="vol.reports.table">
        <TableHeader>
          <TableRow>
            <TableHead>Event</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Feedback</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {myReports.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center text-muted-foreground"
                data-ocid="vol.reports.empty_state"
              >
                No reports submitted yet.
              </TableCell>
            </TableRow>
          ) : (
            myReports.map((r, i) => (
              <TableRow key={r.id} data-ocid={`vol.report.row.${i + 1}`}>
                <TableCell>{r.eventName}</TableCell>
                <TableCell>{r.title}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      r.status === "Approved"
                        ? "default"
                        : r.status === "Rejected"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {r.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {r.feedback || "—"}
                </TableCell>
                <TableCell>
                  {new Date(r.submittedAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(r.id)}
                    data-ocid={`report.delete.button.${i + 1}`}
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
