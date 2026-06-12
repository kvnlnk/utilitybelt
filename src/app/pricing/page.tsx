"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

interface Tier {
  name: string;
  price: string;
  description: string;
  features: { label: string; included: boolean }[];
  cta: string;
  highlighted?: boolean;
}

const tiers: Tier[] = [
  {
    name: "Free",
    price: "$0",
    description: "All the tools you need for everyday development tasks.",
    features: [
      { label: "All formatting tools", included: true },
      { label: "All encoding / decoding tools", included: true },
      { label: "All crypto tools (Hash, UUID, JWT)", included: true },
      { label: "All text tools (Regex, Diff, Case)", included: true },
      { label: "All conversion tools", included: true },
      { label: "Cheatsheet library", included: true },
      { label: "API access", included: false },
      { label: "Unlimited usage", included: false },
    ],
    cta: "Get Started",
  },
  {
    name: "Pro",
    price: "$9",
    description: "Everything in Free plus API access and unlimited usage.",
    features: [
      { label: "All formatting tools", included: true },
      { label: "All encoding / decoding tools", included: true },
      { label: "All crypto tools (Hash, UUID, JWT)", included: true },
      { label: "All text tools (Regex, Diff, Case)", included: true },
      { label: "All conversion tools", included: true },
      { label: "Cheatsheet library", included: true },
      { label: "API access", included: true },
      { label: "Unlimited usage", included: true },
    ],
    cta: "Upgrade to Pro",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "Tailored solutions for teams and organizations.",
    features: [
      { label: "Everything in Pro", included: true },
      { label: "Custom integrations", included: true },
      { label: "Dedicated support", included: true },
      { label: "On-premise deployment", included: true },
      { label: "SLA guarantees", included: true },
      { label: "Team management", included: true },
    ],
    cta: "Contact Sales",
  },
];

function FeatureRow({ label, included }: { label: string; included: boolean }) {
  return (
    <div className="flex items-center gap-2 py-1.5">
      {included ? (
        <Check className="h-4 w-4 shrink-0 text-green-500" />
      ) : (
        <X className="h-4 w-4 shrink-0 text-muted-foreground/50" />
      )}
      <span className={included ? "text-sm" : "text-sm text-muted-foreground/50"}>
        {label}
      </span>
    </div>
  );
}

export default function PricingPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Pricing</h1>
        <p className="text-muted-foreground mt-2 text-lg max-w-2xl mx-auto">
          Choose the plan that fits your needs. All plans include access to every tool.
          Upgrade for API access, unlimited usage, or custom enterprise features.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 items-start">
        {tiers.map((tier) => (
          <Card
            key={tier.name}
            className={`relative flex flex-col ${
              tier.highlighted
                ? "ring-2 ring-primary shadow-lg scale-[1.02] md:scale-105"
                : ""
            }`}
          >
            {tier.highlighted && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="inline-block rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-primary-foreground">
                  Most Popular
                </span>
              </div>
            )}

            <CardHeader>
              <CardTitle className="text-xl">{tier.name}</CardTitle>
              <div className="mt-2">
                <span className="text-4xl font-bold">{tier.price}</span>
                {tier.price !== "Custom" && (
                  <span className="text-sm text-muted-foreground ml-1">/month</span>
                )}
              </div>
              <CardDescription className="mt-2">{tier.description}</CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col flex-1">
              <div className="flex-1 space-y-1">
                {tier.features.map((feature) => (
                  <FeatureRow
                    key={feature.label}
                    label={feature.label}
                    included={feature.included}
                  />
                ))}
              </div>

              <div className="mt-6">
                <Button
                  className="w-full"
                  variant={tier.highlighted ? "default" : "outline"}
                >
                  {tier.cta}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
