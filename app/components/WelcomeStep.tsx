import { Button, Hero, HomeGutter } from "@gouvfr-lasuite/ui-components";

export default function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="w-full animate-fade-in">
      <HomeGutter>
        <Hero
          // On pointe maintenant vers la racine du dossier public
          banner="/hero-image.png"
          logo={<img alt="Logo Fichiers" src="/logo-fichiers.svg" width={64} />}
          title="Outil d'Offboarding"
          subtitle="Bienvenue dans l'interface de gestion des départs de La Suite Numérique. Transférez facilement les droits et auditez les fichiers."
          mainButton={
            <Button variant="primary" onClick={onNext} size="large">
              Connexion (Bypass SSO)
            </Button>
          }
        />
      </HomeGutter>
    </div>
  );
}
