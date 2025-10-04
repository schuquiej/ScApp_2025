import { useEffect, useState } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton,
  IonContent, IonItem, IonLabel, IonSelect, IonSelectOption,
  IonInput, IonTextarea, IonButton, IonToast
} from '@ionic/react';
import { useIonRouter } from '@ionic/react';
import { crearCita, CitaDTO, EstadoCita } from '../../apis/citas';
import { listarClientes, listarProfesionales, listarServicios, Cliente, Profesional, Servicio } from '../../apis/catalogs';

export default function ProfesionalCreatePage() {
  const router = useIonRouter();

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [profes, setProfes] = useState<Profesional[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);

  const [clienteId, setClienteId] = useState<number | undefined>();
  const [profesionalId, setProfesionalId] = useState<number | undefined>();
  const [servicioId, setServicioId] = useState<number | undefined>();
  const [fechaHora, setFechaHora] = useState<string>(''); // ISO
  const [estado, setEstado] = useState<EstadoCita>('PROGRAMADA');
  const [notas, setNotas] = useState<string>('');

  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [cs, ps, ss] = await Promise.all([listarClientes(), listarProfesionales(), listarServicios()]);
        setClientes(cs); setProfes(ps); setServicios(ss);
      } catch (e: any) {
        setErr(e?.message || 'No se pudieron cargar catálogos');
      }
    })();
  }, []);

  async function onSubmit() {
    if (!clienteId || !profesionalId || !servicioId || !fechaHora) {
      setErr('Completa Cliente, Profesional, Servicio y Fecha/Hora');
      return;
    }
    setLoading(true);
    try {
      const dto: CitaDTO = { clienteId, profesionalId, servicioId, fechaHora, estado, notas: notas || undefined };
      await crearCita(dto);
      setOk('Cita creada');
      setTimeout(() => router.push('/app/citas', 'back', 'replace'), 600);
    } catch (e: any) {
      setErr(e?.message || 'No se pudo crear la cita');
    } finally {
      setLoading(false);
    }
  }

  // helper: default local datetime redondeada a 30 min
  function defaultLocalISO() {
    const d = new Date();
    d.setMinutes(d.getMinutes() - (d.getMinutes()%30), 0, 0);
    return d.toISOString().slice(0,19); // "YYYY-MM-DDTHH:mm:ss" (sin zona)
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start"><IonMenuButton /></IonButtons>
          <IonTitle>Clientes · Crear</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonItem>
          <IonLabel position="stacked">Cliente</IonLabel>
          <IonSelect value={clienteId} onIonChange={e => setClienteId(Number(e.detail.value))} interface="popover">
            {clientes.map(c => <IonSelectOption key={c.id} value={c.id}>{c.nombre}</IonSelectOption>)}
          </IonSelect>
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Profesional</IonLabel>
          <IonSelect value={profesionalId} onIonChange={e => setProfesionalId(Number(e.detail.value))} interface="popover">
            {profes.map(p => <IonSelectOption key={p.id} value={p.id}>{p.nombre}</IonSelectOption>)}
          </IonSelect>
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Servicio</IonLabel>
          <IonSelect value={servicioId} onIonChange={e => setServicioId(Number(e.detail.value))} interface="popover">
            {servicios.map(s => <IonSelectOption key={s.id} value={s.id}>{s.nombre}</IonSelectOption>)}
          </IonSelect>
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Fecha y hora</IonLabel>
          <IonInput
            type="datetime-local"
            value={fechaHora || defaultLocalISO()}
            onIonChange={e => setFechaHora((e.detail.value as string) ?? '')}
          />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Estado</IonLabel>
          <IonSelect value={estado} onIonChange={e => setEstado(e.detail.value as any)} interface="popover">
            <IonSelectOption value="PROGRAMADA">PROGRAMADA</IonSelectOption>
            <IonSelectOption value="CONFIRMADA">CONFIRMADA</IonSelectOption>
            <IonSelectOption value="ATENDIDA">ATENDIDA</IonSelectOption>
            <IonSelectOption value="CANCELADA">CANCELADA</IonSelectOption>
            <IonSelectOption value="NO_ASISTIO">NO_ASISTIO</IonSelectOption>
          </IonSelect>
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Notas</IonLabel>
          <IonTextarea value={notas} onIonChange={e => setNotas(e.detail.value ?? '')} autoGrow />
        </IonItem>

        <div className="ion-margin-top" style={{ display: 'grid', gap: 8 }}>
          <IonButton expand="block" onClick={onSubmit} disabled={loading}>Guardar</IonButton>
          <IonButton expand="block" fill="outline" onClick={() => router.push('/app/citas', 'back')}>Cancelar</IonButton>
        </div>

        <IonToast isOpen={!!ok} message={ok!} duration={1200} onDidDismiss={() => setOk(null)} />
        <IonToast isOpen={!!err} color="danger" message={err!} duration={1600} onDidDismiss={() => setErr(null)} />
      </IonContent>
    </IonPage>
  );
}
