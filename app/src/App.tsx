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

import ClientesListPage from "./pages/clientes/ClientesListPage";
import ClientesCreatePage from "./pages/clientes/ClientesCreatePage";

import ServiciosListPage from "./pages/servicios/ServiciosListPage";
import ServiciosCreatePage from "./pages/servicios/ServiciosCreatePage";


import { useAuth } from "./auth/AuthContext";
import ProfesionalCreatePage from "./pages/profesional/ProfesionalCreatePage";
import ProfesionalListPage from "./pages/profesional/ProfesionalListPage";

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

                        {/* CLIENTES */}
                        <IonAccordion value="clientes">
                          <IonItem slot="header" lines="none">
                            <IonLabel>Clientes</IonLabel>
                          </IonItem>
                          <div slot="content">
                            <IonList>
                              <IonMenuToggle autoHide={true}>
                                <IonItem
                                  routerLink="/app/clientes/crear"
                                  routerDirection="root"
                                  detail={false}
                                  lines="none"
                                >
                                  <IonLabel>Crear</IonLabel>
                                </IonItem>
                              </IonMenuToggle>

                              <IonMenuToggle autoHide={true}>
                                <IonItem
                                  routerLink="/app/clientes"
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

                        {/* SERVICIOS */}
                        <IonAccordion value="servicios">
                          <IonItem slot="header" lines="none">
                            <IonLabel>Servicios</IonLabel>
                          </IonItem>
                          <div slot="content">
                            <IonList>
                              <IonMenuToggle autoHide={true}>
                                <IonItem
                                  routerLink="/app/servicios/crear"
                                  routerDirection="root"
                                  detail={false}
                                  lines="none"
                                >
                                  <IonLabel>Crear</IonLabel>
                                </IonItem>
                              </IonMenuToggle>

                              <IonMenuToggle autoHide={true}>
                                <IonItem
                                  routerLink="/app/servicios"
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

                        {/* PROFESIONAL */}
                        <IonAccordion value="profesional">
                          <IonItem slot="header" lines="none">
                            <IonLabel>Profesional</IonLabel>
                          </IonItem>
                          <div slot="content">
                            <IonList>
                              <IonMenuToggle autoHide={true}>
                                <IonItem
                                  routerLink="/app/profesional/crear"
                                  routerDirection="root"
                                  detail={false}
                                  lines="none"
                                >
                                  <IonLabel>Crear</IonLabel>
                                </IonItem>
                              </IonMenuToggle>

                              <IonMenuToggle autoHide={true}>
                                <IonItem
                                  routerLink="/app/profesional"
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

                      {/* clientes */}
                      <Route
                        path="/app/clientes"
                        component={ClientesListPage}
                        exact
                      />
                      <Route
                        path="/app/clientes/crear"
                        component={ClientesCreatePage}
                        exact
                      />

                      {/* servicios */}
                      <Route
                        path="/app/servicios"
                        component={ServiciosListPage}
                        exact
                      />
                      <Route
                        path="/app/servicios/crear"
                        component={ServiciosCreatePage}
                        exact
                      />



                        {/* PROFESIONAL */}
                      <Route
                        path="/app/profesional"
                        component={ProfesionalListPage}
                        exact
                      />
                      <Route
                        path="/app/profesional/crear"
                        component={ProfesionalCreatePage}
                        exact
                      />

                      {/* Redirección al home */}
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
