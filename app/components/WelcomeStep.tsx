import { Hero, HomeGutter, Button } from "@gouvfr-lasuite/ui-components";

export default function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="w-full animate-fade-in -mt-30">
      <HomeGutter>
        <Hero
          banner="/banner.png"
          logo={<img alt="Passation Logo" src="/logo-passation.svg" width={164} />}
          title="Offboarding Tool"
          subtitle="Welcome to the La Suite Numérique departure management interface. Easily transfer rights and audit files."
          mainButton={
            // plans to authenticate via “account” in the future
            <Button onClick={onNext} variant="primary" className="transition-transform hover:scale-105">
              Sign In
            </Button>
          }
        />
      </HomeGutter>
    </div>
  );
}
