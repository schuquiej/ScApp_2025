import { useEffect, useState } from "react";
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
} from "@ionic/react";
import { refreshOutline, trashOutline, addOutline } from "ionicons/icons";
import { useIonRouter } from "@ionic/react";
import { listarCitas } from "../../db/pouchApi";
import { removeDocGeneric } from "../../apis/couchGenericApi";

export default function ProfesionalListPage() {
  // sergio acaPr
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const router = useIonRouter();

  async function cargar() {
    setLoading(true);
    try {
      const selectors = {};
      const data = await listarCitas("profesiones", selectors);

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

  async function onDelete(id: string) {
    try {
      console.log(id);
      await removeDocGeneric(id, "profesiones");
      setOk("Cita eliminada");
      await cargar();
    } catch (e: any) {
      setErr(e?.message || "No se pudo eliminar");
    }
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>Profesional · Listado</IonTitle>
          <IonButtons slot="end">
            <IonButton
              onClick={() => router.push("/app/profesional/crear", "forward")}
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

        <IonList>
          {items.map((c) => (
            <IonItem key={c._id} lines="full">
              <IonLabel>
                <h2>{c.clienteNombre}</h2>

                <p>Especilidad: {c.clienteEspecialidad} </p>
                <p>DPI: {c.clienteDPI} </p>
                <p>Correo: {c.clienteCorreo} </p>
              </IonLabel>
              <IonNote slot="end">#{c.id}</IonNote>
              <IonButton
                slot="end"
                fill="clear"
                color="danger"
                onClick={() => onDelete(c._id)}
              >
                <IonIcon icon={trashOutline} slot="icon-only" />
              </IonButton>
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
}
