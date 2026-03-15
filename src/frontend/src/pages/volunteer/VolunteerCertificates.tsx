import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Award, Download } from "lucide-react";
import { useAppStore } from "../../hooks/useAppStore";

export default function VolunteerCertificates() {
  const { state } = useAppStore();
  const currentUserId = state.currentUser?.id;

  const eventName = (id: string) =>
    state.events.find((e) => e.id === id)?.name || id;

  // Show global certs (no volunteerId) + certs sent specifically to this volunteer
  const visibleCerts = state.certificates.filter(
    (c) => !c.volunteerId || c.volunteerId === currentUserId,
  );

  function handleDownload(cert: (typeof state.certificates)[0]) {
    if (cert.fileDataUrl) {
      const a = document.createElement("a");
      a.href = cert.fileDataUrl;
      a.download = cert.title;
      a.click();
    } else {
      alert("No file attached to this certificate.");
    }
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Certificates</h1>
        <p className="text-muted-foreground">Download your NSS certificates</p>
      </div>

      {visibleCerts.length === 0 ? (
        <p className="text-muted-foreground" data-ocid="vol.certs.empty_state">
          No certificates available yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleCerts.map((c, i) => (
            <Card key={c.id} data-ocid={`vol.cert.item.${i + 1}`}>
              <CardContent className="p-6">
                <Award className="h-10 w-10 text-primary mb-3" />
                <h3 className="font-semibold mb-1">{c.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {eventName(c.eventId)}
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  Issued: {new Date(c.uploadedAt).toLocaleDateString()}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownload(c)}
                  data-ocid={`vol.cert.download.button.${i + 1}`}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
