import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { type GalleryPhoto, useAppStore } from "../../hooks/useAppStore";

export default function CoordinatorGallery() {
  const store = useAppStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [eventId, setEventId] = useState("");
  const [title, setTitle] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [filterEvent, setFilterEvent] = useState("all");
  const [dragging, setDragging] = useState(false);

  function handleFile(file: File) {
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      toast.error("Only PNG, JPG, WEBP allowed");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  function handleUpload() {
    if (!eventId || !title || !preview) {
      toast.error("Please fill all fields and select an image");
      return;
    }
    const photo: GalleryPhoto = {
      id: `ph_${Date.now().toString(36)}`,
      eventId,
      title,
      imageDataUrl: preview,
      uploadedAt: Date.now(),
    };
    store.addGalleryPhoto(photo);
    toast.success("Photo uploaded");
    setEventId("");
    setTitle("");
    setPreview(null);
  }

  const filtered =
    filterEvent === "all"
      ? store.state.gallery
      : store.state.gallery.filter((p) => p.eventId === filterEvent);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Gallery</h1>
        <p className="text-muted-foreground">Upload and manage event photos</p>
      </div>

      {/* Upload form */}
      <Card className="mb-8">
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Event</Label>
              <Select value={eventId} onValueChange={setEventId}>
                <SelectTrigger data-ocid="gallery.event.select">
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
              <Label>Photo Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                data-ocid="gallery.title.input"
              />
            </div>
          </div>

          {/* Drag drop */}
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              dragging
                ? "border-primary bg-accent"
                : "border-border hover:border-primary/50"
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              const f = e.dataTransfer.files[0];
              if (f) handleFile(f);
            }}
            onClick={() => fileRef.current?.click()}
            onKeyUp={(e) => e.key === "Enter" && fileRef.current?.click()}
            // biome-ignore lint/a11y/useSemanticElements: dropzone needs div for drag events
            role="button"
            tabIndex={0}
            data-ocid="gallery.dropzone"
          >
            {preview ? (
              <div className="relative inline-block">
                <img
                  src={preview}
                  alt="preview"
                  className="max-h-40 rounded-lg mx-auto"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreview(null);
                  }}
                  className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <div>
                <Upload className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Drag &amp; drop or click to upload
                </p>
                <p className="text-xs text-muted-foreground">PNG, JPG, WEBP</p>
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) =>
                e.target.files?.[0] && handleFile(e.target.files[0])
              }
            />
          </div>

          <Button onClick={handleUpload} data-ocid="gallery.upload.button">
            <Upload className="h-4 w-4 mr-2" />
            Upload Photo
          </Button>
        </CardContent>
      </Card>

      {/* Filter */}
      <div className="flex gap-4 mb-4 items-center">
        <span className="text-sm font-medium">Filter by event:</span>
        <Select value={filterEvent} onValueChange={setFilterEvent}>
          <SelectTrigger className="w-48" data-ocid="gallery.filter.select">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Events</SelectItem>
            {store.state.events.map((e) => (
              <SelectItem key={e.id} value={e.id}>
                {e.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Photo grid */}
      {filtered.length === 0 ? (
        <p className="text-muted-foreground" data-ocid="gallery.empty_state">
          No photos yet.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((p, i) => (
            <div
              key={p.id}
              className="relative group rounded-xl overflow-hidden"
              data-ocid={`gallery.photo.item.${i + 1}`}
            >
              <img
                src={p.imageDataUrl}
                alt={p.title}
                className="w-full h-40 object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                <p className="text-white text-sm font-medium truncate">
                  {p.title}
                </p>
                <button
                  type="button"
                  onClick={() => store.deleteGalleryPhoto(p.id)}
                  className="mt-1 self-end text-white hover:text-destructive"
                  data-ocid={`gallery.delete.button.${i + 1}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
