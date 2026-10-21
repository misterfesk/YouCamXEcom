// Holds the page area while a dynamic segment streams in after a client navigation.
export function RouteFallback() {
  return <div aria-busy="true" className="min-h-screen flex-1" />;
}
