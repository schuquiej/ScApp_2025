import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonInput, IonButton, IonText, IonCard, IonCardContent
} from '@ionic/react';
import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';


import './LoginPage.css';

export default function LoginPage() {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const { login, auth } = useAuth();
  const history = useHistory();

  useEffect(() => {
    if (auth.token || localStorage.getItem('access_token')) {
      history.replace('/app/users');
    }
  }, [auth.token, history]);

  async function onSubmit() {
    setErr(null);
    try {
      const fakeJwt =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

      if (user === 'admin' && pass === 'admin') {
        login(fakeJwt);                
        history.replace('/app/users'); 
      } else {
        setErr('Credenciales inválidas');
      }
    } catch {
      setErr('Error al conectar con el servidor');
    }
  }


 

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Iniciar Sesión</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding login-wrapper" scrollY={false}>
        <IonCard className="login-card">
          <IonCardContent>
            <h2 style={{ textAlign: 'center', marginBottom: 16 }}>Bienvenido</h2>

            <IonInput
              label="Usuario"
              labelPlacement="floating"
              value={user}
              onIonChange={e => setUser(e.detail.value ?? '')}
            />
            <IonInput
              label="Contraseña"
              type="password"
              labelPlacement="floating"
              value={pass}
              onIonChange={e => setPass(e.detail.value ?? '')}
            />

            {err && (
              <IonText color="danger" style={{ display: 'block', marginTop: 10 }}>
                {err}
              </IonText>
            )}

            <IonButton expand="block" style={{ marginTop: 20 }} onClick={onSubmit}>
              Entrar
            </IonButton>
             </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
}
