import { useEffect, useState } from "react";
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
import { syncSolicitudesFromRemote } from "../../db/remote/couch";
import { createDocGeneric } from "../../apis/couchGenericApi";


export default function ClientesCreatePage() {
  const router = useIonRouter();


  const [clienteNombre, setClienteNombre] = useState<string>("");
  const [clienteDPI, setClienteDPI] = useState<string>("");
  const [clienteCorreo, setClienteCorreo] = useState<string>("");
  const [clienteTelefono, setClienteTelefono] = useState<string>("");
  const [clienteNAC, setClienteNAC] = useState<string>("");

  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);


  
  function defaultLocalISO() {
    const d = new Date();
    d.setMinutes(d.getMinutes() - (d.getMinutes() % 30), 0, 0);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  }

  async function onSubmit() {
    if (
      !clienteNombre ||
      !clienteDPI ||
      !clienteTelefono ||
      !clienteCorreo ||
      !clienteNAC
    ) {
      setErr("Completa Cliente, Profesional, Servicio y Fecha/Hora");
      return;
    }
    setLoading(true);
    try {
     

      const doc = {
        type: "cliente",
        clienteNombre,
        clienteDPI,
        clienteCorreo,
        clienteTelefono,
        clienteNac: new Date(clienteNAC).toISOString(), // 👈 ISO
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        estado: true,
      };

      // 2) guardar en Pouch (local)
      await createDocGeneric(doc, "clientes", {
        idPrefix: "cliente",
        dateKeys: ["clienteNac", "createdAt", "updatedAt"],
        forceType: "cliente",
      });

   

      setOk("Cliente creada");
      setTimeout(() => router.push("/app/clientes", "back", "replace"), 700);
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
          <IonTitle>cliente · Crear</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonItem>
          <IonLabel position="stacked">Cliente</IonLabel>
          <IonInput
            placeholder="Nombre del cliente"
            value={clienteNombre}
            onIonChange={(e) =>
              setClienteNombre((e.detail.value as string) ?? "")
            }
          />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Identificador</IonLabel>
          <IonInput
            placeholder="DPI cliente"
            value={clienteDPI}
            onIonChange={(e) =>
              setClienteDPI((e.detail.value as string) ?? "")
            }
          />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Correo</IonLabel>
          <IonInput
            placeholder="Correo cliente"
            value={clienteCorreo}
            onIonChange={(e) =>
              setClienteCorreo((e.detail.value as string) ?? "")
            }
          />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Telefono</IonLabel>
          <IonInput
            placeholder="Telefono cliente"
            value={clienteTelefono}
            onIonChange={(e) =>
              setClienteTelefono((e.detail.value as string) ?? "")
            }
          />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Fecha y hora</IonLabel>
          <IonInput
            type="date"
            value={clienteNAC || defaultLocalISO()}
            onIonChange={(e) => setClienteNAC((e.detail.value as string) ?? "")}
          />
        </IonItem>

        <div className="ion-margin-top" style={{ display: "grid", gap: 8 }}>
          <IonButton expand="block" onClick={onSubmit} disabled={loading}>
            Guardar
          </IonButton>
          <IonButton
            expand="block"
            fill="outline"
            onClick={() => router.push("/app/clientes", "back")}
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
