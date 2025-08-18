import {
    IonToolbar,
    IonButton,
    IonFooter,
    IonText,
    IonBadge,
} from "@ionic/react";

interface FooterToolbarProps {
    onToggleShowOne: () => void;
    onShowAll: (isSure: boolean) => void;
    showOneDiamonds: number;
    showAllDiamonds: number;
}

export default function FooterToolbar({
    onToggleShowOne,
    onShowAll,
    showOneDiamonds,
    showAllDiamonds,
}: FooterToolbarProps) {
    return (
        <IonFooter className="bottom-navigation">
            <IonToolbar>
                <IonButton
                    fill="clear"
                    className="navigation-button show-one-button"
                    onClick={onToggleShowOne}
                >
                    <IonText>Show One</IonText>
                    <IonBadge color="danger" className="hint-badge" slot="end">
                        {showOneDiamonds}
                    </IonBadge>
                </IonButton>
                <IonButton
                    fill="clear"
                    className="navigation-button show-all-button"
                    onClick={() => onShowAll(false)}
                >
                    <IonText slot="start">Show All</IonText>
                    <IonBadge color="danger" className="hint-badge" slot="end">
                        {showAllDiamonds}
                    </IonBadge>
                </IonButton>
            </IonToolbar>
        </IonFooter>
    );
}

