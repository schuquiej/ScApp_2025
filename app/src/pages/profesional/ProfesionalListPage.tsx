import { useEffect, useState } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton,
  IonContent, IonRefresher, IonRefresherContent,
  IonList, IonItem, IonLabel, IonNote, IonButton, IonIcon, IonToast
} from '@ionic/react';
import { refreshOutline, trashOutline, addOutline } from 'ionicons/icons';
import { listarCitas, borrarCita, CitaResponse } from '../../apis/citas';
import { useIonRouter } from '@ionic/react';

export default function ProfesionalListPage() {
  const [items, setItems] = useState<CitaResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const router = useIonRouter();

  async function cargar() {
    setLoading(true);
    try {
      const data = await listarCitas();
      setItems(data);
    } catch (e: any) {
      setErr(e?.message || 'Error al cargar citas');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { cargar(); }, []);

  async function onDelete(id: number) {
    try {
      await borrarCita(id);
      setOk('Cita eliminada');
      await cargar();
    } catch (e: any) {
      setErr(e?.message || 'No se pudo eliminar');
    }
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start"><IonMenuButton /></IonButtons>
          <IonTitle>Clientes · Listado</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => router.push('/app/citas/crear', 'forward')}>
              <IonIcon icon={addOutline} slot="icon-only" />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonRefresher slot="fixed" onIonRefresh={async (e) => { await cargar(); e.detail.complete(); }}>
          <IonRefresherContent pullingIcon={refreshOutline} />
        </IonRefresher>

        <IonList>
          {items.map(c => (
            <IonItem key={c.id} lines="full">
              <IonLabel>
                <h2>{c.clienteNombre} → {c.profesionalNombre}</h2>
                <p>{c.servicioNombre} · {new Date(c.fechaHora).toLocaleString()}</p>
                <p>Estado: {c.estado}{c.notas ? ` · ${c.notas}` : ''}</p>
              </IonLabel>
              <IonNote slot="end">#{c.id}</IonNote>
              <IonButton slot="end" fill="clear" color="danger" onClick={() => onDelete(c.id)}>
                <IonIcon icon={trashOutline} slot="icon-only" />
              </IonButton>
            </IonItem>
          ))}
        </IonList>

        <IonToast isOpen={!!ok} message={ok!} duration={1300} onDidDismiss={() => setOk(null)} />
        <IonToast isOpen={!!err} color="danger" message={err!} duration={1600} onDidDismiss={() => setErr(null)} />
      </IonContent>
    </IonPage>
  );
}
