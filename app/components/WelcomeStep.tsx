import { Hero, HomeGutter } from "@gouvfr-lasuite/ui-components";

export default function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    // On ajoute un style inline ou des classes pour annuler le padding supérieur par défaut
    <div className="w-full animate-fade-in -mt-30">
      <HomeGutter>
        <Hero
          banner="/banner.png"
          logo={<img alt="Logo Fichiers" src="/logo-passation.svg" width={164} />}
          title="Outil d'Offboarding"
          subtitle="Bienvenue dans l'interface de gestion des départs de La Suite Numérique. Transférez facilement les droits et auditez les fichiers."
          mainButton={
            <button
              type="button"
              onClick={onNext}
              className="c__button c__button--brand c__button--brand--primary c__button--medium pro-connect-button cursor-pointer transition-transform hover:scale-105"
              style={{
                backgroundImage: 'url("/proconnect-content.svg")',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                width: '250px',
                height: '48px'
              }}
            />
          }
        />
      </HomeGutter>
    </div>
  );
}
