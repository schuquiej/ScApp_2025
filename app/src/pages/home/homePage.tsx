import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonSpinner,
  IonText,
  IonChip,
  IonButtons,
  IonMenuButton,
  IonRefresher,
  IonRefresherContent,
  IonToast,
} from "@ionic/react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Chart from "chart.js/auto";
import { CitaResponse, EstadoCita } from "../../apis/citas";
import { syncSolicitudesFromRemote } from "../../db/remote/couch";
import { listarCitas } from "../../db/pouchApi";
import type { RefresherEventDetail } from "@ionic/core";

export default function HomePage() {
  const [range, setRange] = useState<"30" | "90" | "365">("30");
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  const lineRef = useRef<HTMLCanvasElement | null>(null);
  const doughnutRef = useRef<HTMLCanvasElement | null>(null);
  const lineChartRef = useRef<Chart | null>(null);
  const doughnutChartRef = useRef<Chart | null>(null);

  // ---------- Carga reusable ----------
  async function loadData(showSpinner = true) {
    if (showSpinner) setLoading(true);
    setErr(null);
    try {
      const selectors = {
        $and: [{ type: { $eq: "cita" } }, { servicioId: { $eq: "quimio" } }],
      };
      const selectorsl = {};

      await syncSolicitudesFromRemote("db_sergio", selectors);
      const data = await listarCitas("db_sergio", selectorsl);

      setItems(data ?? []);
    } catch (e: any) {
      console.warn("Fallo al listar citas:", e?.message || e);
      setErr("No se pudo cargar las citas");
      setItems([]);
    } finally {
      if (showSpinner) setLoading(false);
    }
  }

  useEffect(() => {
    let alive = true;
    (async () => {
      await loadData(true);
    })();
    return () => {
      alive = false;
    };
  }, []);

  // ---------- Utiles de fecha ----------
  const TZ = "America/Guatemala";

  function toYMDLocal(d: Date | string) {
    const dd = typeof d === "string" ? new Date(d) : d;
    return dd.toLocaleDateString("en-CA", { timeZone: TZ });
  }

  function toYMLocal(d: Date | string) {
    const dd = typeof d === "string" ? new Date(d) : d;
    const y = dd.toLocaleString("en-CA", { year: "numeric", timeZone: TZ });
    const m = dd.toLocaleString("en-CA", { month: "2-digit", timeZone: TZ });
    return `${y}-${m}`;
  }

  function ymdToLocalDate(ymd: string) {
    const [y, m, d] = ymd.split("-").map(Number);
    return new Date(y, (m ?? 1) - 1, d ?? 1);
  }

  const today = useMemo(() => {
    const ymd = toYMDLocal(new Date());
    return ymdToLocalDate(ymd);
  }, []);

  const startDate = useMemo(() => {
    const base = new Date(today);
    const days = range === "30" ? 30 : range === "90" ? 90 : 365;
    base.setDate(base.getDate() - Math.floor((days - 1) / 2));
    return base;
  }, [range, today]);

  const endDate = useMemo(() => {
    const base = new Date(startDate);
    const days = range === "30" ? 30 : range === "90" ? 90 : 365;
    base.setDate(base.getDate() + (days - 1));
    return base;
  }, [startDate, range]);

  // ---------- Filtro rango ----------
  const filtered = useMemo(() => {
    return items.filter((c) => {
      const ymdLocal = toYMDLocal(c.fechaHora);
      const dLocal = ymdToLocalDate(ymdLocal);
      return dLocal >= startDate && dLocal <= endDate;
    });
  }, [items, startDate, endDate]);

  // ---------- Serie linea ----------
  const { lineLabels, lineCounts, totalEnRango } = useMemo(() => {
    const byKey = new Map<string, number>();
    const daily = range !== "365";

    if (daily) {
      const labels: string[] = [];
      const counts: number[] = [];
      const cursor = new Date(startDate);
      while (cursor <= endDate) {
        const key = toYMDLocal(cursor);
        labels.push(key);
        byKey.set(key, 0);
        cursor.setDate(cursor.getDate() + 1);
      }
      for (const c of filtered) {
        const key = toYMDLocal(c.fechaHora);
        byKey.set(key, (byKey.get(key) || 0) + 1);
      }
      for (const k of labels) counts.push(byKey.get(k) || 0);
      return {
        lineLabels: labels,
        lineCounts: counts,
        totalEnRango: filtered.length,
      };
    } else {
      const labelsSet = new Set<string>();
      const cursor = new Date(startDate);
      while (cursor <= endDate) {
        labelsSet.add(toYMLocal(cursor));
        cursor.setMonth(cursor.getMonth() + 1);
      }
      for (const c of filtered) {
        const key = toYMLocal(c.fechaHora);
        byKey.set(key, (byKey.get(key) || 0) + 1);
      }
      const labels = Array.from(labelsSet);
      const counts = labels.map((k) => byKey.get(k) || 0);
      return {
        lineLabels: labels,
        lineCounts: counts,
        totalEnRango: filtered.length,
      };
    }
  }, [filtered, range, startDate, endDate]);

  // ---------- Dona por estado ----------
  const ESTADOS: EstadoCita[] = [
    "PROGRAMADA",
    "CONFIRMADA",
    "ATENDIDA",
    "CANCELADA",
    "NO_ASISTIO",
    "FACTURADO",
  ];

  const estadoData = useMemo(() => {
    const counts = ESTADOS.map(
      (e) => filtered.filter((s) => s.estado === e).length
    );
    return { labels: ESTADOS, counts };
  }, [filtered]);

  // ---------- Render charts ----------
  useEffect(() => {
    // LINE
    if (lineChartRef.current) lineChartRef.current.destroy();
    if (lineRef.current) {
      lineChartRef.current = new Chart(lineRef.current, {
        type: "line",
        data: {
          labels: lineLabels,
          datasets: [
            {
              label: "Citas",
              data: lineCounts,
              tension: 0.25,
              fill: false,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: true },
            tooltip: { enabled: true },
          },
          scales: {
            x: {
              ticks: {
                autoSkip: true,
                maxTicksLimit: 10,
              },
            },
            y: {
              beginAtZero: true,
              ticks: { precision: 0 },
            },
          },
        },
      });
    }

    // DOUGHNUT
    if (doughnutChartRef.current) doughnutChartRef.current.destroy();
    if (doughnutRef.current) {
      doughnutChartRef.current = new Chart(doughnutRef.current, {
        type: "doughnut",
        data: {
          labels: estadoData.labels,
          datasets: [{ label: "Estados", data: estadoData.counts }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: "bottom" },
            tooltip: { enabled: true },
          },
          cutout: "60%",
        },
      });
    }

    return () => {
      if (lineChartRef.current) lineChartRef.current.destroy();
      if (doughnutChartRef.current) doughnutChartRef.current.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    lineLabels.join("|"),
    lineCounts.join("|"),
    estadoData.labels.join("|"),
    estadoData.counts.join("|"),
  ]);

  // ---------- Pull-to-refresh ----------
  const onRefresh = async (ev: CustomEvent<RefresherEventDetail>) => {
    try {
      await loadData(false); // sin spinner central
      setShowToast(true);
    } finally {
      ev.detail.complete(); // terminar animación
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>Home</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {/* Pull to refresh */}
        <IonRefresher slot="fixed" onIonRefresh={onRefresh}>
          <IonRefresherContent
            pullingText="Desliza hacia abajo para refrescar"
            refreshingSpinner="circles"
            refreshingText="Actualizando…"
          />
        </IonRefresher>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Resumen de citas</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <div
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <IonSegment
                value={range}
                onIonChange={(e) => setRange((e.detail.value as any) ?? "30")}
              >
                <IonSegmentButton value="30">
                  <IonLabel>30 días</IonLabel>
                </IonSegmentButton>
                <IonSegmentButton value="90">
                  <IonLabel>90 días</IonLabel>
                </IonSegmentButton>
                <IonSegmentButton value="365">
                  <IonLabel>1 año</IonLabel>
                </IonSegmentButton>
              </IonSegment>

              <IonChip color="primary">
                <IonLabel>Total en rango: {totalEnRango}</IonLabel>
              </IonChip>
            </div>
          </IonCardContent>
        </IonCard>

        {loading ? (
          <div style={{ display: "grid", placeItems: "center", padding: 24 }}>
            <IonSpinner />
            <IonText className="ion-margin-top">Cargando datos…</IonText>
          </div>
        ) : filtered.length === 0 ? (
          <IonText color="medium" className="ion-padding">
            No hay citas en el rango seleccionado.
          </IonText>
        ) : (
          <IonGrid>
            <IonRow className="ion-align-items-stretch">
              <IonCol size="12" sizeMd="7">
                <IonCard style={{ height: 360 }}>
                  <IonCardHeader>
                    <IonCardTitle>
                      Citas por {range === "365" ? "mes" : "día"}
                    </IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent style={{ height: 300 }}>
                    <canvas ref={lineRef} />
                  </IonCardContent>
                </IonCard>
              </IonCol>

              <IonCol size="12" sizeMd="5">
                <IonCard style={{ height: 360 }}>
                  <IonCardHeader>
                    <IonCardTitle>Estados</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent style={{ height: 300 }}>
                    <canvas ref={doughnutRef} />
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
          </IonGrid>
        )}

        <IonToast
          isOpen={showToast}
          duration={1200}
          message="Actualizado"
          onDidDismiss={() => setShowToast(false)}
          position="top"
        />
      </IonContent>
    </IonPage>
  );
}
