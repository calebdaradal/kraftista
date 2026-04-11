import { Layout } from "@/components/layout/Layout";
import { Leaf, Heart, Award, Users } from "lucide-react";

export default function About() {
  const team = [
    { name: "Emma", role: "Founder & Creative Director" },
    { name: "James", role: "Artisan Relations" },
    { name: "Sofia", role: "Product Curator" },
  ];

  const milestones = [
    { year: "2020", title: "Founded", description: "Started with a vision" },
    { year: "2021", title: "100 Artisans", description: "Connected our first 100" },
    { year: "2023", title: "10k+ Customers", description: "Reached global audience" },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-12 md:py-20 bg-gradient-to-br from-secondary/20 to-primary/10">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            Our Story
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Craft was founded on the belief that handmade products carry a special soul. We're dedicated to bringing authentic artisan work to people who appreciate quality and craftsmanship.
          </p>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-12 text-center">
            Our Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: Heart, title: "Passion", desc: "We care deeply about what we do" },
              { icon: Leaf, title: "Sustainability", desc: "Eco-friendly practices always" },
              { icon: Award, title: "Quality", desc: "Excellence in every detail" },
              { icon: Users, title: "Community", desc: "Supporting artisans worldwide" },
            ].map((value, i) => {
              const Icon = value.icon;
              return (
                <div key={i} className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="p-4 bg-primary/10 rounded-lg">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{value.title}</h3>
                  <p className="text-muted-foreground text-sm">{value.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Milestones */}
      <section className="py-16 md:py-24 bg-card">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-12 text-center">
            Our Journey
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {milestones.map((milestone, i) => (
              <div key={i} className="text-center">
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

      {/* Team Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-12 text-center">
            Meet the Team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-6 text-center">
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
    </Layout>
  );
}
