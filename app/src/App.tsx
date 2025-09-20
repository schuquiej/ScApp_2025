import React from 'react';
import {
  IonApp, IonRouterOutlet, setupIonicReact, IonSplitPane, IonMenu,
  IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonMenuToggle
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route, Redirect, Switch } from 'react-router-dom';

import LoginPage from './pages/login/LoginPage';
import UsersPage from './pages/login/UsersPage';
import RequestsPage from './pages/login/RequestsPage';
import { useAuth } from './auth/AuthContext';

setupIonicReact();

export default function App() {
  const { auth } = useAuth();
  const DEV_FREE_PASS = true;
  const isAuthed = DEV_FREE_PASS || !!(auth.token || localStorage.getItem('access_token'));

  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          <Route path="/login" component={LoginPage} exact />

          <Route
            path="/app"
            render={() =>
              !isAuthed ? (
                <Redirect to="/login" />
              ) : (
                  <IonSplitPane contentId="main" when={false}>
                    <IonMenu contentId="main" type="overlay">
                      <IonHeader>
                        <IonToolbar>
                          <IonTitle>Menú</IonTitle>
                        </IonToolbar>
                      </IonHeader>
                      <IonContent>
                        <IonList>
                          <IonMenuToggle autoHide={false}>
                            <IonItem routerLink="/app/users">Usuarios</IonItem>
                            <IonItem routerLink="/app/requests">Solicitudes</IonItem>
                          </IonMenuToggle>
                        </IonList>
                      </IonContent>
                    </IonMenu>

                    <IonRouterOutlet id="main">
                      <Switch>
                        <Route path="/app/users" component={UsersPage} exact />
                        <Route path="/app/requests" component={RequestsPage} exact />
                        <Redirect exact from="/app" to="/app/users" />
                      </Switch>
                    </IonRouterOutlet>
                  </IonSplitPane>

              )
            }
          />

          <Redirect exact from="/" to={isAuthed ? '/app/users' : '/login'} />
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
}
