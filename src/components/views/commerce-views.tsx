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
    <main id="main-content" tabIndex={-1} className="section">
      <Container>
        <p className="type-label text-brand mb-3">Your bag</p>
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
                Keep shopping
              </Button>
            </div>
            <OrderSummary subtotal={subtotal}>
              <Button href="/checkout">Go to checkout</Button>
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
    <main id="main-content" tabIndex={-1} className="section">
      <Container>
        <p className="type-label text-brand mb-3">Checkout</p>
        <h1 className="type-h1 mb-6">
          Almost <Accent>yours.</Accent>
        </h1>
        <p className="demo-banner mb-8">
          This is a demo store. Nothing is charged, shipped or emailed.
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
              <h2 className="type-h3">Your details</h2>
              <label className="field-label">
                <span>
                  First name{" "}
                  <span className="text-text-muted">(optional)</span>
                </span>
                <input
                  className="text-control"
                  name="demo-name"
                  autoComplete="off"
                  maxLength={80}
                  placeholder="Alex"
                />
              </label>
              <label className="field-label">
                <span>
                  Email address{" "}
                  <span className="text-text-muted">(optional)</span>
                </span>
                <input
                  className="text-control"
                  name="demo-email"
                  type="email"
                  autoComplete="off"
                  maxLength={160}
                  placeholder="alex@example.com"
                />
              </label>
              <p className="type-small text-text-muted">
                Leave these blank if you like. Nothing you type here is sent or
                saved, and no address or payment is needed.
              </p>
              <label className="check-control">
                <input type="checkbox" required />
                <span>I understand this is a demo and nothing will ship.</span>
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
    <main id="main-content" tabIndex={-1} className="pb-12">
      <Container>
        <div className="confirmation-hero on-brand">
          <p className="type-label">
            {order ? `Demo order / ${order.reference}` : "Demo checkout"}
          </p>
          <h1 className="type-h1">
            {order ? (
              <>
                Your routine is
                <br />
                <Accent>all set.</Accent>
              </>
            ) : (
              <>
                Nothing to
                <br />
                confirm yet.
              </>
            )}
          </h1>
          <p>
            {order
              ? "Demo order placed. Nothing was charged, and nothing will be shipped or emailed."
              : "You haven’t placed a demo order in this visit yet."}
          </p>
          <Button variant="secondary-on-brand" href="/shop">
            Keep shopping
          </Button>
        </div>
        {order && (
          <section className="section confirmation-items">
            <h2 className="type-h2 mb-6">What you ordered</h2>
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
              This summary disappears when you refresh the page.
            </p>
          </section>
        )}
      </Container>
    </main>
  );
}
