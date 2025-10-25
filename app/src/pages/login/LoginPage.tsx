
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
  IonGrid,
  IonRow,
  IonCol,
} from "@ionic/react";
import { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { useIonRouter } from "@ionic/react";

import { jwtDecode } from "jwt-decode";


export default function TestLoginIngresosPage() {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const { login } = useAuth();
  const history = useHistory();

  const [fecha, setFecha] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );

  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [items, setItems] = useState<any[]>([]);
  const router = useIonRouter();

  async function onSubmitLogin() {
    if (!user || !pass) return setErr("Ingrese usuario y contraseña");

    try {
      if (user === "5555" && pass === "admin") {
        const demoJwt =
          "eyJhbGciOiJub25lIn0." +
          "eyJzdWIiOiJzZ555555XJnaW8iLCJyb2xlcyI6WyJBRE1JTiIsIlBST01PVE9SIl0sImV4cCI6MTg5MzQ1NjAwMH0." +
          "";
        const dec = jwtDecode<any>(demoJwt);
        const now = Date.now() / 1000;

        if (!dec.exp || dec.exp < now) {
          throw new Error("Token expirado o inválido");
        }

        try {
          const dec = jwtDecode<any>(demoJwt);
          const now = Date.now() / 1000;

          if (!dec.exp || dec.exp < now) {
            throw new Error("Token expirado o inválido");
          }

        

          // Si pasa la validación
          login(demoJwt);
          router.push("/app/home", "root", "replace");
          setOk("Inicio de sesión correcto");
        } catch (err) {
          console.error("Token inválido:", err);
          setErr("Token inválido o expirado");
        }
      } else {
        setErr("Credenciales inválidas");
      }
    } catch {
      setErr("Error al conectar con el servidor");
    }
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Login </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonGrid>
          <IonRow className="ion-align-items-start" style={{ gap: 16 }}>
            <IonCol size="12" sizeMd="5">
              <IonCard>
                <IonCardContent>
                  <h2 style={{ marginBottom: 12 }}>Login</h2>

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
          </IonRow>
        </IonGrid>

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
