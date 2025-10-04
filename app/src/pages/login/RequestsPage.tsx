import {
  IonPage, IonHeader, IonToolbar, IonTitle,
  IonButtons, IonMenuButton, IonContent
} from '@ionic/react';

export default function UsersPage() {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start"><IonMenuButton /></IonButtons>
          <IonTitle>Usuarios</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        Contenido Usuarios
      </IonContent>
    </IonPage>
  );
}
