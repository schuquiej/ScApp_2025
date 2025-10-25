import { useEffect, useMemo, useState } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonMenuButton,
  IonContent,
  IonRefresher,
  IonRefresherContent,
  IonList,
  IonItem,
  IonLabel,
  IonNote,
  IonButton,
  IonIcon,
  IonToast,
  IonSkeletonText,
  IonBadge,
} from "@ionic/react";
import { refreshOutline, addOutline, receiptOutline } from "ionicons/icons";

import { useIonRouter } from "@ionic/react";
import { listarCitas } from "../../db/pouchApi";
import { updateFieldById } from "../../apis/couchGenericApi";

export default function FacturaCreatePage() {
  // sergio aca
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const router = useIonRouter();

  async function cargar() {
    setLoading(true);
    try {
      const selectors = {};
      const data = await listarCitas("db_sergio", selectors);

      console.log(data);
      setItems(data);
    } catch (e: any) {
      setErr(e?.message || "Error al cargar citas");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  async function facturarSolicitud(id: string) {
    try {
      await updateFieldById(id, "estado", "FACTURADO", "db_sergio"); // o la DB que corresponda
      setOk("Cita eliminada");
      await cargar();
    } catch (e: any) {
      setErr(e?.message || "No se pudo eliminar");
    }
  }

  const tz = "America/Guatemala";
  const fmtFecha = (iso?: string) =>
    iso
      ? new Intl.DateTimeFormat("es-GT", {
          dateStyle: "medium",
          timeStyle: "short",
          timeZone: tz,
        }).format(new Date(iso))
      : "";

  function colorEstado(
    estado?: string
  ): "success" | "warning" | "danger" | "medium" {
    switch (estado) {
      case "ATENDIDA":
        return "success";
      case "PROGRAMADA":
        return "warning";
      case "NO_ASISTIO":
        return "danger";
      case "CANCELADA":
        return "medium";
      default:
        return "medium";
    }
  }

  const citasOrdenadas = useMemo(() => {
    return [...items].sort(
      (a, b) =>
        new Date(a.fechaHora ?? 0).getTime() -
        new Date(b.fechaHora ?? 0).getTime()
    );
  }, [items]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>Facturar · Listado</IonTitle>
          <IonButtons slot="end">
            <IonButton
              onClick={() => router.push("/app/citas/crear", "forward")}
            >
              <IonIcon icon={addOutline} slot="icon-only" />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonRefresher
          slot="fixed"
          onIonRefresh={async (e) => {
            await cargar();
            e.detail.complete();
          }}
        >
          <IonRefresherContent pullingIcon={refreshOutline} />
        </IonRefresher>

        {loading && (
          <IonList>
            {Array.from({ length: 3 }).map((_, i) => (
              <IonItem key={i}>
                <IonLabel>
                  <h2>
                    <IonSkeletonText animated style={{ width: "60%" }} />
                  </h2>
                  <p>
                    <IonSkeletonText animated style={{ width: "80%" }} />
                  </p>
                  <p>
                    <IonSkeletonText animated style={{ width: "40%" }} />
                  </p>
                </IonLabel>
              </IonItem>
            ))}
          </IonList>
        )}

        {!loading && citasOrdenadas.length === 0 && (
          <div className="ion-text-center ion-padding">
            <p>No hay citas.</p>
            <IonButton
              onClick={() => router.push("/app/factura/crear", "forward")}
            >
              Crear cita
            </IonButton>
          </div>
        )}

        {!loading && citasOrdenadas.length > 0 && (
          <IonList>
            {citasOrdenadas.map((c) => (
              <IonItem key={c._id} lines="full">
                <IonLabel>
                  <h2>
                    {c.clienteNombre} → {c.profesionalId}
                  </h2>
                  <p>
                    {c.servicioId} · {fmtFecha(c.fechaHora)}
                  </p>
                  <p>
                    Estado:{" "}
                    <IonBadge color={colorEstado(c.estado)}>
                      {c.estado}
                    </IonBadge>
                    {c.notas ? ` · ${c.notas}` : ""}
                  </p>
                </IonLabel>
                <IonNote
                  slot="end"
                  className="ion-text-wrap"
                  style={{ maxWidth: 120 }}
                >
                  #{c._id?.split(":").slice(-1)[0]}
                </IonNote>
                <IonButton
                  slot="end"
                  fill="clear"
                  color="danger"
                  disabled={c.estado === "FACTURADO"}
                  onClick={() => facturarSolicitud(c._id!)}
                >
                  <IonIcon icon={receiptOutline} slot="icon-only" />
                </IonButton>
              </IonItem>
            ))}
          </IonList>
        )}

        <IonToast
          isOpen={!!ok}
          message={ok!}
          duration={1300}
          onDidDismiss={() => setOk(null)}
        />
        <IonToast
          isOpen={!!err}
          color="danger"
          message={err!}
          duration={1600}
          onDidDismiss={() => setErr(null)}
        />
      </IonContent>
    </IonPage>
  );
}
