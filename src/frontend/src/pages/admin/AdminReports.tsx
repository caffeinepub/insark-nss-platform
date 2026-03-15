import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { type Report, useAppStore } from "../../hooks/useAppStore";

function downloadReport(r: Report) {
  if (r.fileDataUrl) {
    const a = document.createElement("a");
    a.href = r.fileDataUrl;
    a.download = `${r.title}.pdf`;
    a.click();
  } else {
    const content = [
      `Report: ${r.title}`,
      `Volunteer: ${r.volunteerName}`,
      `Event: ${r.eventName}`,
      `Description: ${r.description}`,
      `Status: ${r.status}`,
      `Feedback: ${r.feedback || "N/A"}`,
      `Submitted: ${new Date(r.submittedAt).toLocaleString()}`,
    ].join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${r.title}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

export default function AdminReports() {
  const store = useAppStore();
  const [feedback, setFeedback] = useState<Record<string, string>>({});

  function grade(reportId: string, status: "Approved" | "Rejected") {
    const report = store.state.reports.find((r) => r.id === reportId);
    if (!report) return;
    store.updateReport({
      ...report,
      status,
      feedback: feedback[reportId] || "",
    });
    toast.success(`Report ${status.toLowerCase()}`);
  }

  function handleDelete(id: string) {
    store.deleteReport(id);
    toast.success("Report deleted");
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-muted-foreground">
          View and grade volunteer service reports
        </p>
      </div>
      <Table data-ocid="admin.reports.table">
        <TableHeader>
          <TableRow>
            <TableHead>Volunteer</TableHead>
            <TableHead>Event</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Feedback</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {store.state.reports.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center text-muted-foreground"
                data-ocid="admin.reports.empty_state"
              >
                No reports submitted.
              </TableCell>
            </TableRow>
          ) : (
            store.state.reports.map((r, i) => (
              <TableRow key={r.id} data-ocid={`admin.reports.row.${i + 1}`}>
                <TableCell>{r.volunteerName}</TableCell>
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
                <TableCell>
                  <Input
                    placeholder="Add feedback"
                    value={feedback[r.id] || r.feedback || ""}
                    onChange={(e) =>
                      setFeedback((f) => ({ ...f, [r.id]: e.target.value }))
                    }
                    data-ocid={`report.feedback.input.${i + 1}`}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      size="sm"
                      onClick={() => grade(r.id, "Approved")}
                      data-ocid={`report.approve.button.${i + 1}`}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => grade(r.id, "Rejected")}
                      data-ocid={`report.reject.button.${i + 1}`}
                    >
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadReport(r)}
                      data-ocid={`report.download.button.${i + 1}`}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(r.id)}
                      data-ocid={`report.delete.button.${i + 1}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
