// src/pages/TestLoginIngresosPage.tsx
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonInput,
  IonButton,
  IonText,
  IonCard,
  IonCardContent,
  IonToast,
  IonLoading,
  IonList,
  IonItem,
  IonLabel,
  IonNote,
  IonSelect,
  IonSelectOption,
  IonGrid,
  IonRow,
  IonCol,
} from "@ionic/react";
import { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { useIonRouter } from "@ionic/react";
import {
  crearIngreso,
  listarIngresos,
  borrarIngreso,
} from "../../apis/APIIngreso";

export default function TestLoginIngresosPage() {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const { login } = useAuth();
  const history = useHistory();

  const [fecha, setFecha] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [categoria, setCategoria] = useState<string>("Ventas");
  const [descripcion, setDescripcion] = useState<string>("");
  const [monto, setMonto] = useState<string>("");

  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [items, setItems] = useState<any[]>([]);
  const router = useIonRouter();

  async function onSubmitLogin() {
    setErr(null);
    if (!user || !pass) return setErr("Ingrese usuario y contraseña");

    try {
      const fakeJwt = "xxx"; // tu token
      if (user === "admin" && pass === "admin") {
        login(fakeJwt);

        // 🔑 reemplaza el stack (no deja Login atrás) y fuerza transición correcta
       router.push('/app/users', 'root', 'replace');

        setOk("Inicio de sesión correcto");
      } else {
        setErr("Credenciales inválidas");
      }
    } catch {
      setErr("Error al conectar con el servidor");
    }
  }

  async function cargarIngresos() {
    try {
      const data = await listarIngresos();
      setItems(data as any);
    } catch (e) {
      console.error(e);
      setErr("Error al listar ingresos");
    }
  }

  useEffect(() => {
    cargarIngresos();
  }, []);

  async function onCrearIngreso() {
    setErr(null);
    if (!fecha || !categoria || !monto) {
      setErr("Complete fecha, categoría y monto");
      return;
    }
    setLoading(true);
    try {
      await crearIngreso({
        fecha,
        categoria,
        descripcion: descripcion || undefined,
        monto: Number(monto),
      });
      setOk("Ingreso guardado");
      setDescripcion("");
      setMonto("");
      await cargarIngresos();
    } catch (e) {
      console.error(e);
      setErr("No se pudo guardar el ingreso");
    } finally {
      setLoading(false);
    }
  }

  async function onValidarServicio() {
    setLoading(true);
    try {
      await crearIngreso({
        fecha: new Date().toISOString().slice(0, 10),
        categoria: "Prueba",
        descripcion: "Ingreso de validación",
        monto: 123.45,
      });
      setOk("Validación OK: ingreso de prueba creado");
      await cargarIngresos();
    } catch (e) {
      console.error(e);
      setErr("Falló la validación");
    } finally {
      setLoading(false);
    }
  }

  async function onBorrar(id?: string) {
    if (!id) return;
    setLoading(true);
    try {
      await borrarIngreso(id);
      setOk("Ingreso borrado");
      await cargarIngresos();
    } catch (e) {
      console.error(e);
      setErr("No se pudo borrar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Pruebas: Login + Ingresos</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonGrid>
          <IonRow className="ion-align-items-start" style={{ gap: 16 }}>
            <IonCol size="12" sizeMd="5">
              <IonCard>
                <IonCardContent>
                  <h2 style={{ marginBottom: 12 }}>Login de prueba</h2>

                  <IonInput
                    label="Usuario"
                    labelPlacement="stacked"
                    value={user}
                    onIonChange={(e) => setUser(e.detail.value ?? "")}
                    onKeyDown={(e) => e.key === "Enter" && onSubmitLogin()}
                  />
                  <IonInput
                    label="Contraseña"
                    type="password"
                    labelPlacement="stacked"
                    className="ion-margin-top"
                    value={pass}
                    onIonChange={(e) => setPass(e.detail.value ?? "")}
                    onKeyDown={(e) => e.key === "Enter" && onSubmitLogin()}
                  />

                  <IonButton
                    expand="block"
                    className="ion-margin-top"
                    onClick={onSubmitLogin}
                  >
                    Entrar
                  </IonButton>
                </IonCardContent>
              </IonCard>
            </IonCol>

            <IonCol size="12" sizeMd="7">
              <IonCard>
                <IonCardContent>
                  <h2 style={{ marginBottom: 12 }}>Ingresos (Pouch)</h2>

                  <IonInput
                    label="Fecha"
                    type="date"
                    labelPlacement="stacked"
                    value={fecha}
                    onIonChange={(e) =>
                      setFecha((e.detail.value as string) ?? "")
                    }
                  />

                  <IonInput
                    label="Categoría"
                    labelPlacement="stacked"
                    className="ion-margin-top"
                    value={categoria}
                    onIonChange={(e) => setCategoria(e.detail.value ?? "")}
                  />

                  <IonInput
                    label="Descripción"
                    labelPlacement="stacked"
                    className="ion-margin-top"
                    value={descripcion}
                    onIonChange={(e) => setDescripcion(e.detail.value ?? "")}
                  />

                  <IonInput
                    label="Monto (Q)"
                    type="number"
                    inputmode="decimal"
                    labelPlacement="stacked"
                    className="ion-margin-top"
                    value={monto}
                    onIonChange={(e) => setMonto(e.detail.value ?? "")}
                  />

                  <div
                    className="ion-margin-top"
                    style={{ display: "grid", gap: 8 }}
                  >
                    <IonButton onClick={onCrearIngreso} disabled={loading}>
                      Guardar ingreso
                    </IonButton>
                    <IonButton
                      onClick={onValidarServicio}
                      fill="outline"
                      disabled={loading}
                    >
                      Validar servicio (crear prueba)
                    </IonButton>
                    <IonButton
                      onClick={cargarIngresos}
                      fill="clear"
                      disabled={loading}
                    >
                      Recargar lista
                    </IonButton>
                  </div>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>

        <IonCard>
          <IonCardContent>
            <h2 style={{ marginBottom: 12 }}>Listado</h2>
            <IonList>
              {items.map((i: any) => (
                <IonItem key={i._id}>
                  <IonLabel>
                    <h2>{i.categoria}</h2>
                    <p>{i.descripcion}</p>
                  </IonLabel>
                  <IonNote slot="end">
                    {i.fecha} · Q {Number(i.monto).toFixed(2)}
                  </IonNote>
                  <IonButton
                    slot="end"
                    fill="clear"
                    color="danger"
                    onClick={() => onBorrar(i._id)}
                  >
                    Borrar
                  </IonButton>
                </IonItem>
              ))}
            </IonList>
          </IonCardContent>
        </IonCard>

        <IonLoading isOpen={loading} message="Procesando..." />
        {err && (
          <IonToast
            isOpen={!!err}
            color="danger"
            message={err}
            duration={1700}
            onDidDismiss={() => setErr(null)}
          />
        )}
        {ok && (
          <IonToast
            isOpen={!!ok}
            message={ok}
            duration={1500}
            onDidDismiss={() => setOk(null)}
          />
        )}
      </IonContent>
    </IonPage>
  );
}
