import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useAppStore } from "../../hooks/useAppStore";

export default function VolunteerGallery() {
  const { state } = useAppStore();
  const [filterEvent, setFilterEvent] = useState("all");

  const filtered =
    filterEvent === "all"
      ? state.gallery
      : state.gallery.filter((p) => p.eventId === filterEvent);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Gallery</h1>
        <p className="text-muted-foreground">Event photo gallery</p>
      </div>

      <div className="flex gap-4 mb-6 items-center">
        <span className="text-sm font-medium">Filter:</span>
        <Select value={filterEvent} onValueChange={setFilterEvent}>
          <SelectTrigger className="w-48" data-ocid="vol.gallery.filter.select">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Events</SelectItem>
            {state.events.map((e) => (
              <SelectItem key={e.id} value={e.id}>
                {e.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <p
          className="text-muted-foreground"
          data-ocid="vol.gallery.empty_state"
        >
          No photos available.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((p, i) => (
            <div
              key={p.id}
              className="rounded-xl overflow-hidden"
              data-ocid={`vol.gallery.photo.item.${i + 1}`}
            >
              <img
                src={p.imageDataUrl}
                alt={p.title}
                className="w-full h-40 object-cover"
              />
              <p className="text-sm p-2 font-medium truncate">{p.title}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
