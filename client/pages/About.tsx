import { Layout } from "@/components/layout/Layout";
import { useCustomization } from "@/context/CustomizationContext";
import * as Icons from "lucide-react";

function getIconComponent(iconName: string) {
  const Icon = (Icons as Record<string, any>)[iconName];
  return Icon || Icons.Star;
}

export default function About() {
  const { about } = useCustomization();

  const heroEnabled = about.heroEnabled !== false;
  const valuesEnabled = about.valuesEnabled !== false;
  const milestonesEnabled = about.milestonesEnabled !== false;
  const teamEnabled = about.teamEnabled !== false;

  return (
    <Layout>
      {/* Hero Section */}
      {heroEnabled && (
        <section className="py-12 md:py-20 bg-gradient-to-br from-secondary/20 to-primary/10">
          <div className="container mx-auto px-4">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              {about.heroTitle}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              {about.heroSubtitle}
            </p>
          </div>
        </section>
      )}

      {/* Values Section */}
      {valuesEnabled && (
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-12 text-center">
              {about.valuesTitle}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {about.values.map((value) => {
                const Icon = getIconComponent(value.icon);
                return (
                  <div key={value.id} className="text-center">
                    <div className="flex justify-center mb-4">
                      <div className="p-4 bg-primary/10 rounded-lg">
                        <Icon className="w-8 h-8 text-primary" />
                      </div>
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{value.title}</h3>
                    <p className="text-muted-foreground text-sm">{value.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Milestones */}
      {milestonesEnabled && (
        <section className="py-16 md:py-24 bg-card">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-12 text-center">
              {about.milestonesTitle}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {about.milestones.map((milestone) => (
                <div key={milestone.id} className="text-center">
                  <div className="font-display text-4xl font-bold text-primary mb-2">
                    {milestone.year}
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{milestone.title}</h3>
                  <p className="text-muted-foreground">{milestone.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Team Section */}
      {teamEnabled && (
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-12 text-center">
              {about.teamTitle}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {about.team.map((member) => (
                <div key={member.id} className="bg-card border border-border rounded-xl p-6 text-center">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary to-secondary rounded-full mb-4 flex items-center justify-center">
                    <span className="text-3xl">👤</span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{member.name}</h3>
                  <p className="text-muted-foreground text-sm">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
}
