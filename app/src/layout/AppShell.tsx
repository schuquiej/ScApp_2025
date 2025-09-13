import React, { Suspense } from 'react';
import {
  IonSplitPane, IonMenu, IonHeader, IonToolbar, IonTitle, IonContent,
  IonList, IonItem, IonMenuToggle, IonRouterOutlet
} from '@ionic/react';
import { Route, Redirect, Switch } from 'react-router-dom';
import UsersPage from '../pages/login/UsersPage';
import RequestsPage from '../pages/login/RequestsPage';

export default function AppShell() {
  return (
    <IonSplitPane contentId="main" when={false}>
      {/* Menú lateral overlay (móvil y web) */}
      <IonMenu contentId="main" type="overlay">
        <IonHeader>
          <IonToolbar><IonTitle>Menú</IonTitle></IonToolbar>
        </IonHeader>
        <IonContent>
          <IonList>
            <IonMenuToggle autoHide={true}>
              <IonItem
                routerLink="/app/users"
                routerDirection="root"
                detail={false}
                lines="none"
              >
                Usuarios
              </IonItem>
              <IonItem
                routerLink="/app/requests"
                routerDirection="root"
                detail={false}
                lines="none"
              >
                Solicitudes
              </IonItem>
            </IonMenuToggle>
          </IonList>
        </IonContent>
      </IonMenu>

      {/* Área principal */}
      <IonRouterOutlet id="main">
        <Suspense fallback={<div className="ion-padding">Cargando…</div>}>
          <Switch>
            <Route path="/app/users" component={UsersPage} exact />
            <Route path="/app/requests" component={RequestsPage} exact />
            {/* MUY importante: exact y al final */}
            <Redirect exact from="/app" to="/app/users" />
          </Switch>
        </Suspense>
      </IonRouterOutlet>
    </IonSplitPane>
  );
}
