"use client";
import { BRAND_NAME } from "@/config/site";
import { useState } from "react";
import Link from "next/link";
import { STEPS, STEP_LABEL } from "@/types/catalog";
import { GOALS, GOAL_DEFS } from "@/types/goal";
import { SKIN_TYPE_LABEL } from "@/types/skin";
import { GOAL_FINDING } from "@/components/scan/scan-copy";
import type { ProfileSummary, ScanSource } from "@/types/storefront";
import { Icon } from "@/components/icons/icon";
import { IconButton } from "@/components/ui/icon-button";
import { ScanButton } from "@/components/ui/scan-button";
import { Button } from "@/components/ui/button";
import { Menu, type MenuItem } from "@/components/ui/menu";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Container } from "@/components/ui/container";

export type SiteHeaderProps = {
  profile?: ProfileSummary;
  recommendations: boolean;
  bagCount: number;
  onStartScan: (source: ScanSource) => void;
  onToggleRecommendations: () => void;
  onDeleteResults: () => void;
  onSearch: () => void;
};
export function ProfileChip({
  profile,
  recommendations,
  ...props
}: {
  profile: ProfileSummary;
  recommendations: boolean;
} & React.ComponentProps<"button">) {
  return (
    <button {...props} type="button" className="profile-chip type-button">
      <span
        className="profile-dot"
        data-on={recommendations}
        aria-hidden="true"
      />
      <span>
        {recommendations
          ? [
              SKIN_TYPE_LABEL[profile.skinType],
              profile.goals[0] && GOAL_FINDING[profile.goals[0].goal].name,
            ]
              .filter(Boolean)
              .join(" · ")
          : "Matches · off"}
      </span>
      <Icon name="chevron-down" />
    </button>
  );
}
export function SiteHeader({
  profile,
  recommendations,
  bagCount,
  onStartScan,
  onToggleRecommendations,
  onDeleteResults,
  onSearch,
}: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const shopItems: MenuItem[] = [
    { id: "all", label: "Shop all", href: "/shop" },
    ...STEPS.map((step) => ({
      id: step,
      label: STEP_LABEL[step],
      href: `/shop/${step}`,
    })),
  ];
  const goalItems: MenuItem[] = GOALS.map((goal) => ({
    id: goal,
    label: GOAL_DEFS[goal].title,
    href: `/concerns/${goal}`,
  }));
  const profileItems: MenuItem[] = [
    {
      id: "toggle",
      label: recommendations ? "Hide my matches" : "Show my matches",
      onSelect: onToggleRecommendations,
    },
    {
      id: "results",
      label: "View my results",
      onSelect: () => onStartScan("results"),
    },
    {
      id: "rescan",
      scan: true,
      label: "Rescan my skin",
      onSelect: () => onStartScan("header"),
    },
    { id: "delete", label: "Delete my results", onSelect: onDeleteResults },
  ];
  return (
    <>
      <a href="#main-content" className="skip-link control button-primary">
        Skip to content
      </a>
      <header className="site-header">
        <Container className="header-inner">
          <div className="mobile-only">
            <IconButton label="Open menu" onClick={() => setMenuOpen(true)}>
              <Icon name="menu" />
            </IconButton>
          </div>
          <Link
            href="/"
            className="type-wordmark wordmark"
            aria-label={`${BRAND_NAME} home`}
          >
            {BRAND_NAME}
          </Link>
          <nav className="desktop-nav" aria-label="Main navigation">
            <Menu
              label="Shop"
              items={shopItems}
              trigger={
                <button className="nav-trigger type-button">
                  Shop <Icon name="chevron-down" />
                </button>
              }
            />
            <Menu
              label="Concerns"
              items={goalItems}
              trigger={
                <button className="nav-trigger type-button">
                  Concerns <Icon name="chevron-down" />
                </button>
              }
            />
          </nav>
          <div className="header-actions">
            <div className="desktop-profile">
              {profile ? (
                <Menu
                  align="end"
                  label="Skin profile"
                  items={profileItems}
                  trigger={
                    <ProfileChip
                      profile={profile}
                      recommendations={recommendations}
                    />
                  }
                />
              ) : (
                <ScanButton onClick={() => onStartScan("header")} />
              )}
            </div>
            <IconButton label="Search products" onClick={onSearch}>
              <Icon name="search" />
            </IconButton>
            <Link
              href="/cart"
              className="icon-button bag-link"
              aria-label={`Bag, ${bagCount} ${bagCount === 1 ? "item" : "items"}`}
            >
              <Icon name="bag" />
              {bagCount > 0 && (
                <span key={bagCount} className="bag-count type-badge">{bagCount}</span>
              )}
            </Link>
          </div>
        </Container>
      </header>
      <div className="mobile-fab">
        {profile ? (
          <button
            className="profile-fab"
            type="button"
            aria-label="Open skin profile"
            onClick={() => setProfileOpen(true)}
          >
            <span
              className="profile-dot"
              data-on={recommendations}
              aria-hidden="true"
            />
            <span className="type-small">Skin</span>
          </button>
        ) : (
          <ScanButton size="fab" onClick={() => onStartScan("mobile")} />
        )}
      </div>
      <BottomSheet
        open={menuOpen}
        onOpenChange={setMenuOpen}
        title={`Explore ${BRAND_NAME}`}
        description="Shop by routine step or skin concern, or scan for your matches."
      >
        <nav aria-label="Mobile navigation" className="mobile-menu">
          <div>
            <h2 className="type-label">Shop</h2>
            {shopItems.map((item) => (
              <Link
                onClick={() => setMenuOpen(false)}
                className="mobile-menu-link"
                key={item.id}
                href={item.href!}
              >
                {item.label}
                <Icon name="chevron-right" />
              </Link>
            ))}
          </div>
          <div>
            <h2 className="type-label">Shop by concern</h2>
            {goalItems.map((item) => (
              <Link
                onClick={() => setMenuOpen(false)}
                className="mobile-menu-link"
                key={item.id}
                href={item.href!}
              >
                {item.label}
                <Icon name="chevron-right" />
              </Link>
            ))}
          </div>
        </nav>
        <ScanButton
          fullWidth
          onClick={() => {
            setMenuOpen(false);
            onStartScan("mobile");
          }}
        />
      </BottomSheet>
      <BottomSheet
        open={profileOpen}
        onOpenChange={setProfileOpen}
        title="Your skin"
        description="Your results stay in this browser. Hide, rescan or delete them here."
      >
        <div className="flex flex-col gap-3">
          {profileItems.map((item) => {
            if (item.href !== undefined) return null;
            const select = () => {
              setProfileOpen(false);
              item.onSelect();
            };
            return item.scan ? (
              <ScanButton fullWidth key={item.id} onClick={select}>
                ✦ {item.label}
              </ScanButton>
            ) : (
              <Button variant="secondary" key={item.id} onClick={select}>
                {item.label}
              </Button>
            );
          })}
        </div>
      </BottomSheet>
    </>
  );
}
