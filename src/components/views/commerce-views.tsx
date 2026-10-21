"use client";
import type { BagItem, DemoOrder } from "@/types/commerce-view";
import { Container } from "@/components/ui/container";
import { Accent } from "@/components/ui/accent";
import { Button } from "@/components/ui/button";
import {
  BagLine,
  OrderSummary,
  EmptyBag,
} from "@/components/commerce/bag-parts";
export function BagView({
  items,
  onQuantityChange,
  onRemove,
}: {
  items: BagItem[];
  onQuantityChange: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
}) {
  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.product.price,
    0,
  );
  return (
    <main id="main-content" className="section">
      <Container>
        <p className="type-label text-brand mb-3">
          Your routine, coming together
        </p>
        <h1 className="type-h1 mb-8">
          In your <Accent>bag.</Accent>
        </h1>
        {items.length ? (
          <div className="commerce-layout">
            <div>
              {items.map((item) => (
                <BagLine
                  key={item.product.id}
                  {...item}
                  onQuantityChange={onQuantityChange}
                  onRemove={onRemove}
                />
              ))}
              <Button variant="ghost" href="/shop">
                Keep exploring
              </Button>
            </div>
            <OrderSummary subtotal={subtotal}>
              <Button href="/checkout">Continue to demo checkout</Button>
            </OrderSummary>
          </div>
        ) : (
          <EmptyBag />
        )}
      </Container>
    </main>
  );
}
export function CheckoutView({
  items,
  onPlaceOrder,
}: {
  items: BagItem[];
  onPlaceOrder: () => void;
}) {
  return (
    <main id="main-content" className="section">
      <Container>
        <p className="type-label text-brand mb-3">Try the last step</p>
        <h1 className="type-h1 mb-6">
          Make it a <Accent>routine.</Accent>
        </h1>
        <p className="demo-banner mb-8">
          This is a demo checkout. No payment, delivery or email. Use made-up
          details.
        </p>
        {items.length ? (
          <div className="commerce-layout">
            <form
              className="checkout-form"
              onSubmit={(e) => {
                e.preventDefault();
                onPlaceOrder();
              }}
            >
              <h2 className="type-h3">Demo contact</h2>
              <label className="field-label">
                First name
                <input
                  className="text-control"
                  name="demo-name"
                  autoComplete="off"
                  required
                  maxLength={80}
                  placeholder="Alex"
                />
              </label>
              <label className="field-label">
                Email address
                <input
                  className="text-control"
                  name="demo-email"
                  type="email"
                  autoComplete="off"
                  required
                  maxLength={160}
                  placeholder="alex@example.com"
                />
              </label>
              <p className="type-small text-text-muted">
                These fields only demonstrate the form. We do not send or save
                them. No delivery address or payment information is needed.
              </p>
              <label className="check-control">
                <input type="checkbox" required />
                <span>I understand this is a demo order.</span>
              </label>
              <Button type="submit" size="lg">
                Place demo order
              </Button>
              <Button href="/cart" variant="ghost">
                Back to bag
              </Button>
            </form>
            <OrderSummary
              subtotal={items.reduce(
                (sum, item) => sum + item.product.price * item.quantity,
                0,
              )}
            />
          </div>
        ) : (
          <EmptyBag />
        )}
      </Container>
    </main>
  );
}
export function ConfirmationView({ order }: { order?: DemoOrder }) {
  return (
    <main id="main-content" className="section">
      <Container>
        <div className="confirmation-hero on-brand">
          <p className="type-label">
            {order ? `Demo order / ${order.reference}` : "Demo checkout"}
          </p>
          <h1 className="type-h1">
            {order ? (
              <>
                A little care,
                <br />
                all <Accent>lined up.</Accent>
              </>
            ) : (
              <>
                Your next routine
                <br />
                starts here.
              </>
            )}
          </h1>
          <p>
            {order
              ? "Your demo order is complete. No payment was taken, and nothing will be shipped or emailed."
              : "There is no demo order in this visit. Explore the collection and try the checkout whenever you like."}
          </p>
          <Button variant="secondary-on-brand" href="/shop">
            Keep exploring
          </Button>
        </div>
        {order && (
          <section className="section confirmation-items">
            <h2 className="type-h2 mb-6">Your demo routine</h2>
            <ul>
              {order.items.map((item) => (
                <li key={item.product.id}>
                  <span>
                    {item.quantity} × {item.product.name}
                  </span>
                  <span>
                    ${(item.quantity * item.product.price).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
            <p className="type-h3 mt-6">
              Demo total · ${order.total.toFixed(2)} USD
            </p>
            <p className="type-small text-text-muted mt-4">
              This summary lives only in this visit. Refreshing clears the demo
              order.
            </p>
          </section>
        )}
      </Container>
    </main>
  );
}
