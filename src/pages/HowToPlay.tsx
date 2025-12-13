import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonButton,
    IonTitle,
    IonContent,
    IonIcon,
    IonGrid,
    IonRow,
    IonCol,
} from "@ionic/react";
import { arrowBack, informationCircle } from "ionicons/icons";
import { useIonRouter } from "@ionic/react";
import "./HowToPlay.css";
import { playSound } from "../data/audio";

const HowToPlay: React.FC = () => {
    const router = useIonRouter();

    const handleBack = () => {
        playSound("click");
        router.goBack();
    };

    const instructions = [
        {
            text: "Combine two identical cards to get their sum.",
            image: "/how1.png",
        },
        {
            text: "Use the joker card with any other card.",
            image: "/how2.png",
        },
        {
            text: "Mix all your cards using the shuffle card.",
            image: "/how3.png",
        },
        {
            text: "Get more time in Flash Mode.",
            image: "/how4.png",
        },
    ];

    return (
        <IonPage>
            <IonHeader translucent>
                <IonToolbar className="px-2">
                    <IonButtons slot="start">
                        <IonButton onClick={handleBack}>
                            <IonIcon icon={arrowBack} />
                        </IonButton>
                    </IonButtons>
                    <IonTitle className="text-center">
                        <div className="header-title">
                            <IonIcon
                                icon={informationCircle}
                                className="header-icon"
                            />
                            <span className="header-title-text">
                                How to Play
                            </span>
                        </div>
                    </IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent fullscreen className="how-to-play-content">
                <div className="how-to-play-container">
                    <div className="instruction-section">
                        <h2 className="section-title">
                            Add cards with the same value to get their sum. You
                            only have 3 chances 🙂
                        </h2>
                        <div className="instruction-card">
                            <IonGrid className="instructions-grid">
                                {instructions.map((instruction, index) => (
                                    <IonRow key={index} className="instruction-row">
                                        <IonCol size="auto" className="image-col">
                                            <img
                                                src={instruction.image}
                                                alt={`Instruction ${index + 1}`}
                                                className="instruction-image"
                                                onError={(e) => {
                                                    // Fallback si l'image n'existe pas
                                                    e.currentTarget.style.display = 'none';
                                                }}
                                            />
                                        </IonCol>
                                        <IonCol className="text-col">
                                            <p className="instruction-text">
                                                {instruction.text}
                                            </p>
                                        </IonCol>
                                    </IonRow>
                                ))}
                            </IonGrid>
                        </div>
                    </div>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default HowToPlay;
