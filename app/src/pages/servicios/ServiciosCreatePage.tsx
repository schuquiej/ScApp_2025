import { useState } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonMenuButton,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonToast,
} from "@ionic/react";
import { useIonRouter } from "@ionic/react";
import { createDocGeneric } from "../../apis/couchGenericApi";

export default function ServicioCreatePage() {
  const router = useIonRouter();

  const [servicioEtiqueta, setEtiqueta] = useState<string>("");

  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    if (!servicioEtiqueta) {
      setErr("Completa Cliente, Profesional, Servicio y Fecha/Hora");
      return;
    }
    setLoading(true);
    try {
      const doc = {
        type: "servicio",
        value:servicioEtiqueta,
        status: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // 2) guardar en Pouch (local)
      await createDocGeneric(doc, "servicios", {
        idPrefix: "servicios",
        dateKeys: ["clienteNac", "createdAt", "updatedAt"],
        forceType: "servicios",
      });

      setOk("Cliente creada");
      setTimeout(() => router.push("/app/servicios", "back", "replace"), 700);
    } catch (e: any) {
      console.error(e);
      setErr(e?.message || "No se pudo crear la cita");
    } finally {
      setLoading(false);
    }
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>Servicios · Crear</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonItem>
          <IonLabel position="stacked">Etiqueta</IonLabel>
          <IonInput
            placeholder="Etiqueta servicio"
            value={servicioEtiqueta}
            onIonChange={(e) => setEtiqueta((e.detail.value as string) ?? "")}
          />
        </IonItem>

        <div className="ion-margin-top" style={{ display: "grid", gap: 8 }}>
          <IonButton expand="block" onClick={onSubmit} disabled={loading}>
            Guardar
          </IonButton>
          <IonButton
            expand="block"
            fill="outline"
            onClick={() => router.push("/app/servicios", "back")}
          >
            Cancelar
          </IonButton>
        </div>

        <IonToast
          isOpen={!!ok}
          message={ok!}
          duration={1200}
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
