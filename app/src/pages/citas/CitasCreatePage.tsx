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
  IonSelect,
  IonSelectOption,
  IonInput,
  IonTextarea,
  IonButton,
  IonToast,
} from "@ionic/react";
import { useIonRouter } from "@ionic/react";

import { syncEnabledDataSources } from "../../apis/couchCatalogAPI";
import { EstadoCita } from "../../apis/citas";

import { listarCitas } from "../../db/pouchApi";
import { createDocGeneric } from "../../apis/couchGenericApi";

export default function CitasCreatePage() {
  const router = useIonRouter();

  const [profes, setProfes] = useState<any[]>([]);
  const [servicios, setServicios] = useState<any[]>([]);

  const [clienteNombre, setClienteNombre] = useState<string>("");
  const [profesionalId, setProfesionalId] = useState<string>("");
  const [servicioId, setServicioId] = useState<string>("");
  const [fechaHora, setFechaHora] = useState<string>("");
  const [estado, setEstado] = useState<EstadoCita>("PROGRAMADA");
  const [notas, setNotas] = useState<string>("");

  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        await syncEnabledDataSources(); 
        const selectors = {};
        const profesiones = await listarCitas("profesiones", selectors);
        console.log(profesiones);
        const serviciosdb = await listarCitas("servicios", selectors);

        setProfes(profesiones);
        setServicios(serviciosdb);
      } catch (e: any) {
        console.error(e);
        setErr("No se pudieron cargar catálogos locales");
      }
    })();
  }, []);

  function defaultLocalISO() {
    const d = new Date();
    d.setMinutes(d.getMinutes() - (d.getMinutes() % 30), 0, 0);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  }

  async function onSubmit() {
    console.log(clienteNombre + profesionalId + servicioId + fechaHora);
    if (!clienteNombre || !profesionalId || !servicioId || !fechaHora) {
      setErr("Completa Cliente, Profesional, Servicio y Fecha/Hora");
      return;
    }
    setLoading(true);
    try {


      
            const doc = {
              type: "cita",
              clienteNombre,
              profesionalId,
              servicioId,
              fechaHora: new Date(fechaHora).toISOString(), 
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              estado,
            };
      
            // 2) guardar en Pouch (local)
            await createDocGeneric(doc, "db_sergio", {
              idPrefix: "db_sergio",
              dateKeys: ["clienteNac", "createdAt", "updatedAt"],
              forceType: "db_sergio",
            });
      
      


      setOk("Cita creada");
      setTimeout(() => router.push("/app/citas", "back", "replace"), 700);
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
          <IonTitle>Citas · Crear</IonTitle>
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
          <IonLabel position="stacked">Profesional</IonLabel>
          <IonSelect
            value={profesionalId}
            onIonChange={(e) => setProfesionalId(e.detail.value as string)}
            interface="popover"
          >
            {profes.map((p: any) => (
              <IonSelectOption key={p._id} value={p.value}>
                {p.clienteNombre  }-{p.clienteEspecialidad }
              </IonSelectOption>
            ))}
          </IonSelect>
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Servicio</IonLabel>
          <IonSelect
            value={servicioId}
            onIonChange={(e) => setServicioId(e.detail.value as string)}
            interface="popover"
          >
            {servicios.map((s: any) => (
              <IonSelectOption key={s._id} value={s.value}>
                {s.value ?? s._id}
              </IonSelectOption>
            ))}
          </IonSelect>
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Fecha y hora</IonLabel>
          <IonInput
            type="datetime-local"
            value={fechaHora || defaultLocalISO()}
            onIonChange={(e) => setFechaHora((e.detail.value as string) ?? "")}
          />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Estado</IonLabel>
          <IonSelect
            value={estado}
            onIonChange={(e) => setEstado(e.detail.value as any)}
            interface="popover"
          >
            <IonSelectOption value="PROGRAMADA">PROGRAMADA</IonSelectOption>
            <IonSelectOption value="CONFIRMADA">CONFIRMADA</IonSelectOption>
            <IonSelectOption value="ATENDIDA">ATENDIDA</IonSelectOption>
            <IonSelectOption value="CANCELADA">CANCELADA</IonSelectOption>
            <IonSelectOption value="NO_ASISTIO">NO_ASISTIO</IonSelectOption>
          </IonSelect>
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Notas</IonLabel>
          <IonTextarea
            value={notas}
            onIonChange={(e) => setNotas(e.detail.value ?? "")}
            autoGrow
          />
        </IonItem>

        <div className="ion-margin-top" style={{ display: "grid", gap: 8 }}>
          <IonButton expand="block" onClick={onSubmit} disabled={loading}>
            Guardar
          </IonButton>
          <IonButton
            expand="block"
            fill="outline"
            onClick={() => router.push("/app/citas", "back")}
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
