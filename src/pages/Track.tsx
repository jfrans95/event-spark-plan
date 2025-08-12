import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface TimelineItem {
  title: string;
  status: "pending" | "in_progress" | "done";
  date?: string;
  note?: string;
}

const Track = () => {
  const { code } = useParams();
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [contact, setContact] = useState<{ collaboratorName: string; phone: string } | null>(null);

  useEffect(() => {
    if (!code) return;
    supabase.functions
      .invoke("tracking-get", { body: { code } })
      .then(({ data, error }) => {
        if (error) throw error;
        setTimeline(data?.timeline || []);
        setContact(data?.contact || null);
      })
      .catch(console.error);
  }, [code]);

  if (typeof document !== "undefined") document.title = `Tracking ${code} | EventCraft`;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Seguimiento del evento: {code}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {timeline.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay información de seguimiento disponible.</p>
            ) : (
              <ul className="space-y-3">
                {timeline.map((t, idx) => (
                  <li key={idx} className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium">{t.title}</p>
                      {t.note && <p className="text-sm text-muted-foreground">{t.note}</p>}
                    </div>
                    <Badge variant={t.status === "done" ? "secondary" : t.status === "in_progress" ? "default" : "outline"}>
                      {t.status}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {contact && (
          <Card>
            <CardHeader>
              <CardTitle>Contacto del colaborador</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm">{contact.collaboratorName}</p>
              <a
                className="text-primary underline text-sm"
                href={`https://wa.me/${contact.phone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
              >
                Agendar por WhatsApp
              </a>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Track;
