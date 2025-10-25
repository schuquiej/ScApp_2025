// src/App.tsx
import React, { useEffect, useRef } from "react";
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
import { useIonRouter } from "@ionic/react"; // 👈 agregado

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

import { syncEnabledDataSources } from "./apis/couchCatalogAPI";
import HomePage from "./pages/home/homePage"; // 👈 PascalCase
import { syncSolicitudesFromRemote } from "./db/remote/couch";
import FacturaListPage from "./pages/facturacion/FacturaListPage";
import FacturaCreatePage from "./pages/facturacion/FacturaCreatePage";

setupIonicReact();

export default function App() {
  const { auth, logout } = useAuth(); // 👈 obtenemos logout
  const router = useIonRouter(); // 👈 para navegar al cerrar sesión

  const DEV_FREE_PASS = false;
  const isAuthed =
    DEV_FREE_PASS || !!(auth.token || localStorage.getItem("access_token"));

  const syncRef = useRef<any>(null);

  useEffect(() => {
    if (isAuthed) {
      (async () => {
        try {
          await syncEnabledDataSources();
          await syncEnabledDataSources({ live: true });

          const h1 = await syncSolicitudesFromRemote("db_sergio", {
            type: "cita",
          });
          const h2 = await syncSolicitudesFromRemote("clientes", {
            type: "cliente",
          });

          const h3 = await syncSolicitudesFromRemote("servicios", {});

          const h4 = await syncSolicitudesFromRemote("profesiones", {});

          // guarda canceladores
          syncRef.current = {
            cancelAll: () => {
              try {
                h1?.cancel?.();
              } catch {}
              try {
                h2?.cancel?.();
              } catch {}
              try {
                h3?.cancel?.();
              } catch {}
              try {
                h4?.cancel?.();
              } catch {}
            },
          };
        } catch (e) {
          console.error("No se pudo iniciar la sync:", e);
        }
      })();
    } else {
      syncRef.current = null;
      console.log("🛑 Sync detenida (no autenticado)");
    }
    return () => {
      syncRef.current = null;
    };
  }, [isAuthed]);

  // 👇 Handler para cerrar sesión
  const handleLogout = () => {
    try {
      logout(); // limpia access_token y estado
    } finally {
      router.push("/login", "root", "replace"); // manda al login
    }
  };

  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          <Route
            path="/login"
            exact
            render={() =>
              isAuthed ? <Redirect to="/app/home" /> : <LoginPage />
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
                      <IonList>
                        {/* HOME */}
                        <IonMenuToggle autoHide={true}>
                          <IonItem
                            routerLink="/app/home"
                            routerDirection="root"
                            detail={false}
                            lines="none"
                          >
                            <IonLabel>Home</IonLabel>
                          </IonItem>
                        </IonMenuToggle>
                      </IonList>

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



                        
                        {/* FACTURA */}
                        <IonAccordion value="factura">
                          <IonItem slot="header" lines="none">
                            <IonLabel>Factura</IonLabel>
                          </IonItem>
                          <div slot="content">
                            <IonList>
                              <IonMenuToggle autoHide={true}>
                                <IonItem
                                  routerLink="/app/factura/crear"
                                  routerDirection="root"
                                  detail={false}
                                  lines="none"
                                >
                                  <IonLabel>Facturar</IonLabel>
                                </IonItem>
                              </IonMenuToggle>

                              <IonMenuToggle autoHide={true}>
                                <IonItem
                                  routerLink="/app/factura"
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


                        {/* CERRAR SESIÓN */}
                        <IonMenuToggle autoHide={true}>
                          <IonItem
                            button
                            onClick={handleLogout}
                            detail={false}
                            lines="none"
                          >
                            <IonLabel>Cerrar sesión</IonLabel>
                          </IonItem>
                        </IonMenuToggle>
                      </IonAccordionGroup>
                    </IonContent>
                  </IonMenu>

                  <IonRouterOutlet id="main">
                    <Switch>
                      {/* HOME */}
                      <Route path="/app/home" component={HomePage} exact />

                      {/* Usuarios (si la usas) */}
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

                      {/* Clientes */}
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

                      {/* Servicios */}
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

                      {/* Profesional */}
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


                       {/* facturas */}
                      <Route
                        path="/app/factura"
                        component={FacturaListPage}
                        exact
                      />
                      <Route
                        path="/app/factura/crear"
                        component={FacturaCreatePage}
                        exact
                      />

                      {/* Redirección al home */}
                      <Redirect exact from="/app" to="/app/home" />
                    </Switch>
                  </IonRouterOutlet>
                </IonSplitPane>
              )
            }
          />

          {/* Root → según autenticación, ahora a /app/home */}
          <Redirect exact from="/" to={isAuthed ? "/app/home" : "/login"} />
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
}
