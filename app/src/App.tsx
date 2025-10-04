// src/App.tsx
import React from "react";
import {
  IonMenu,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonMenuToggle,
  IonAccordionGroup,
  IonAccordion,
  IonRouterOutlet,
  IonSplitPane,
  IonApp,
  setupIonicReact,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { Route, Redirect, Switch } from "react-router-dom";

import LoginPage from "./pages/login/LoginPage";
import UsersPage from "./pages/login/UsersPage";
import CitasListPage from "./pages/citas/CitasListPage";
import CitasCreatePage from "./pages/citas/CitasCreatePage";
import { useAuth } from "./auth/AuthContext";

setupIonicReact();

export default function App() {
  const { auth } = useAuth();
  const DEV_FREE_PASS = false;
  const isAuthed =
    DEV_FREE_PASS || !!(auth.token || localStorage.getItem("access_token"));

  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          <Route
            path="/login"
            exact
            render={() =>
              isAuthed ? <Redirect to="/app/users" /> : <LoginPage />
            }
          />

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
                      <IonAccordionGroup multiple={true}>
                        {/* USUARIOS */}
                        <IonAccordion value="usuarios">
                          <IonItem slot="header" lines="none">
                            <IonLabel>Usuarios</IonLabel>
                          </IonItem>
                          <div slot="content">
                            <IonList>
                              <IonMenuToggle autoHide={true}>
                                <IonItem
                                  routerLink="/app/users"
                                  routerDirection="root"
                                  detail={false}
                                  lines="none"
                                >
                                  <IonLabel>Lista</IonLabel>
                                </IonItem>
                              </IonMenuToggle>
                            </IonList>
                          </div>
                        </IonAccordion>

                        {/* CITAS */}
                        <IonAccordion value="citas">
                          <IonItem slot="header" lines="none">
                            <IonLabel>Citas</IonLabel>
                          </IonItem>
                          <div slot="content">
                            <IonList>
                              <IonMenuToggle autoHide={true}>
                                <IonItem
                                  routerLink="/app/citas/crear"
                                  routerDirection="root"
                                  detail={false}
                                  lines="none"
                                >
                                  <IonLabel>Crear</IonLabel>
                                </IonItem>
                              </IonMenuToggle>

                              <IonMenuToggle autoHide={true}>
                                <IonItem
                                  routerLink="/app/citas"
                                  routerDirection="root"
                                  detail={false}
                                  lines="none"
                                >
                                  <IonLabel>Listar</IonLabel>
                                </IonItem>
                              </IonMenuToggle>
                            </IonList>
                          </div>
                        </IonAccordion>
                      </IonAccordionGroup>
                    </IonContent>
                  </IonMenu>

                  <IonRouterOutlet id="main">
                    <Switch>
                      <Route path="/app/users" component={UsersPage} exact />

                      {/* Citas */}
                      <Route
                        path="/app/citas"
                        component={CitasListPage}
                        exact
                      />
                      <Route
                        path="/app/citas/crear"
                        component={CitasCreatePage}
                        exact
                      />

                      {/* Redirección por defecto dentro de /app */}
                      <Redirect exact from="/app" to="/app/users" />
                    </Switch>
                  </IonRouterOutlet>
                </IonSplitPane>
              )
            }
          />

          <Redirect exact from="/" to={isAuthed ? "/app/users" : "/login"} />
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
}
