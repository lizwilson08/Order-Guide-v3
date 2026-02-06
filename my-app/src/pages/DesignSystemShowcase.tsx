import {
  Button,
  Input,
  Card,
  Table,
  Badge,
  Heading,
  Text,
  TextSm,
  TextXs,
  Caption,
  Small,
  Label,
  Select,
  Checkbox,
  Loading,
} from "../components";
import { ProductComparisonGroup } from "../components/ProductComparisonGroup";
import type { ProductRow } from "../components/ProductComparisonGroup";
import styles from "./DesignSystemShowcase.module.css";

function DiamondIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 2L2 12l10 10 10-10L12 2z" />
    </svg>
  );
}

const sampleTableData = [
  { id: 1, name: "Product A", vendor: "Vendor 1", price: "$2.50/dozen" },
  { id: 2, name: "Product B", vendor: "Vendor 2", price: "$2.20/dozen" },
  { id: 3, name: "Product C", vendor: "Vendor 3", price: "$2.80/dozen" },
];

const sampleComparisonProducts: ProductRow[] = [
  {
    id: 1,
    name: "Lettuce Greens Leaf Fresh with Liner",
    vendorName: "Sysco",
    quantity: 40,
    unit: "lb",
    price: 250,
    unitPrice: 6.25,
    unitPriceDisplay: "$6.25/lb",
    isBestPrice: true,
  },
  {
    id: 2,
    name: "Organic Mixed Greens Case",
    vendorName: "US Foods",
    quantity: 24,
    unit: "lb",
    price: 192,
    unitPrice: 8,
    unitPriceDisplay: "$8.00/lb",
    isBestPrice: false,
  },
  {
    id: 3,
    name: "Romaine Hearts Case",
    vendorName: "Restaurant Depot",
    quantity: 30,
    unit: "lb",
    price: 243,
    unitPrice: 8.1,
    unitPriceDisplay: "$8.10/lb",
    isBestPrice: false,
  },
];

export function DesignSystemShowcase() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Heading as="h1">Design System</Heading>
        <Caption>Core UI components for Order Guide</Caption>
      </header>

      <nav className={styles.nav}>
        <a href="#typography">Typography</a>
        <a href="#buttons">Buttons</a>
        <a href="#forms">Forms</a>
        <a href="#cards">Cards</a>
        <a href="#tables">Tables</a>
        <a href="#badges">Badges</a>
        <a href="#product-comparison">Product comparison group</a>
        <a href="#loading">Loading</a>
      </nav>

      <main className={styles.main}>
        <section id="typography" className={styles.section}>
          <Heading as="h2">Typography</Heading>
          <div className={styles.demo}>
            <Caption className={styles.captionBlock}>Headings (Cash Sans medium)</Caption>
            <Heading as="h1">Heading 1 — 25px</Heading>
            <Heading as="h2">Heading 2 — 19px</Heading>
            <Heading as="h3">Heading 3 — 16px</Heading>
            <Caption className={styles.captionBlock}>Body text (three sizes)</Caption>
            <Text>Body 16px (default): The quick brown fox jumps over the lazy dog.</Text>
            <TextSm>Body 14px: The quick brown fox jumps over the lazy dog.</TextSm>
            <TextXs>Body 12px: The quick brown fox jumps over the lazy dog.</TextXs>
            <Caption className={styles.captionBlock}>Muted (caption / small)</Caption>
            <Caption>Caption 14px — secondary text</Caption>
            <Small>Small 12px — tertiary text</Small>
            <Caption className={styles.captionBlock}>Label</Caption>
            <Label>Label 14px medium — for column headers, field labels</Label>
          </div>
        </section>

        <section id="buttons" className={styles.section}>
          <Heading as="h2">Buttons</Heading>
          <div className={styles.demo}>
            <Caption className={styles.captionBlock}>Filled (pill-shaped)</Caption>
            <div className={styles.row}>
              <Button variant="primary">Button</Button>
              <Button variant="secondary">Button</Button>
              <Button variant="ghost">Button</Button>
              <Button variant="danger">Danger</Button>
            </div>
            <Caption className={styles.captionBlock}>Sizes</Caption>
            <div className={styles.row}>
              <Button variant="primary" size="small">Button</Button>
              <Button variant="primary" size="medium">Button</Button>
              <Button variant="primary" size="large">Button</Button>
            </div>
            <Caption className={styles.captionBlock}>States: disabled</Caption>
            <div className={styles.row}>
              <Button variant="primary" disabled>Button</Button>
              <Button variant="secondary" disabled>Button</Button>
              <Button variant="ghost" disabled>Button</Button>
            </div>
            <Caption className={styles.captionBlock}>Icon buttons (circle)</Caption>
            <div className={styles.row}>
              <Button variant="primary" shape="circle" aria-label="Action">
                <DiamondIcon />
              </Button>
              <Button variant="secondary" shape="circle" aria-label="Action">
                <DiamondIcon />
              </Button>
              <Button variant="ghost" shape="circle" aria-label="Action">
                <DiamondIcon />
              </Button>
            </div>
            <Caption className={styles.captionBlock}>Loading</Caption>
            <div className={styles.row}>
              <Button variant="primary" loading>Button</Button>
              <Button variant="secondary" loading>Button</Button>
              <Button variant="primary" shape="circle" loading aria-label="Loading">{null}</Button>
            </div>
            <Caption className={styles.captionBlock}>Dropdown buttons (primary and secondary)</Caption>
            <div className={styles.row}>
              <div className={styles.dropdownButtonWrap}>
                <Select
                  options={[
                    { value: "", label: "Actions" },
                    { value: "a", label: "Option A" },
                  ]}
                  value=""
                  onChange={() => {}}
                  className={`${styles.dropdownPrimary} ${styles.dropdownMedium}`}
                  aria-label="Actions"
                />
              </div>
              <div className={styles.dropdownButtonWrap}>
                <Select
                  options={[
                    { value: "", label: "Actions" },
                    { value: "a", label: "Option A" },
                  ]}
                  value=""
                  onChange={() => {}}
                  className={`${styles.dropdownSecondary} ${styles.dropdownMedium}`}
                  aria-label="Actions"
                />
              </div>
            </div>
            <Caption className={styles.captionBlock}>Dropdown button sizes (primary)</Caption>
            <div className={styles.row}>
              <div className={styles.dropdownButtonWrap}>
                <Select
                  options={[{ value: "", label: "Actions" }]}
                  value=""
                  onChange={() => {}}
                  className={`${styles.dropdownPrimary} ${styles.dropdownSmall}`}
                  aria-label="Actions"
                />
              </div>
              <div className={styles.dropdownButtonWrap}>
                <Select
                  options={[{ value: "", label: "Actions" }]}
                  value=""
                  onChange={() => {}}
                  className={`${styles.dropdownPrimary} ${styles.dropdownMedium}`}
                  aria-label="Actions"
                />
              </div>
              <div className={styles.dropdownButtonWrap}>
                <Select
                  options={[{ value: "", label: "Actions" }]}
                  value=""
                  onChange={() => {}}
                  className={`${styles.dropdownPrimary} ${styles.dropdownLarge}`}
                  aria-label="Actions"
                />
              </div>
            </div>
            <Caption className={styles.captionBlock}>Dropdown button sizes (secondary)</Caption>
            <div className={styles.row}>
              <div className={styles.dropdownButtonWrap}>
                <Select
                  options={[{ value: "", label: "Actions" }]}
                  value=""
                  onChange={() => {}}
                  className={`${styles.dropdownSecondary} ${styles.dropdownSmall}`}
                  aria-label="Actions"
                />
              </div>
              <div className={styles.dropdownButtonWrap}>
                <Select
                  options={[{ value: "", label: "Actions" }]}
                  value=""
                  onChange={() => {}}
                  className={`${styles.dropdownSecondary} ${styles.dropdownMedium}`}
                  aria-label="Actions"
                />
              </div>
              <div className={styles.dropdownButtonWrap}>
                <Select
                  options={[{ value: "", label: "Actions" }]}
                  value=""
                  onChange={() => {}}
                  className={`${styles.dropdownSecondary} ${styles.dropdownLarge}`}
                  aria-label="Actions"
                />
              </div>
            </div>
          </div>
        </section>

        <section id="forms" className={styles.section}>
          <Heading as="h2">Forms</Heading>
          <div className={styles.demo}>
            <Input label="Text input" placeholder="Enter text" />
            <Input
              label="With error"
              placeholder="Invalid value"
              error="This field is required"
            />
            <Input label="Number" type="number" defaultValue="42" />
            <Select
              label="Select"
              options={[
                { value: "", label: "Choose..." },
                { value: "a", label: "Option A" },
                { value: "b", label: "Option B" },
              ]}
            />
            <Checkbox label="Checkbox option" />
            <Checkbox label="Checked by default" defaultChecked />
          </div>
        </section>

        <section id="cards" className={styles.section}>
          <Heading as="h2">Cards</Heading>
          <div className={styles.demo}>
            <Card title="Card with title">
              <Text>Card body content goes here.</Text>
            </Card>
            <Card
              title="Card with footer"
              footer={
                <Button variant="primary" size="small">
                  Action
                </Button>
              }
            >
              <Text>Content and a footer action.</Text>
            </Card>
            <Card>
              <Text>Card without title or footer.</Text>
            </Card>
          </div>
        </section>

        <section id="tables" className={styles.section}>
          <Heading as="h2">Tables</Heading>
          <div className={styles.demo}>
            <Table
              columns={[
                { key: "name", header: "Product" },
                { key: "vendor", header: "Vendor" },
                { key: "price", header: "Unit price" },
              ]}
              data={sampleTableData}
              keyExtractor={(row) => row.id}
            />
          </div>
        </section>

        <section id="badges" className={styles.section}>
          <Heading as="h2">Badges</Heading>
          <div className={styles.demo}>
            <div className={styles.row}>
              <Badge variant="default">Default</Badge>
              <Badge variant="primary">Primary</Badge>
              <Badge variant="success">Best price</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="error">Error</Badge>
            </div>
          </div>
        </section>

        <section id="product-comparison" className={styles.section}>
          <Heading as="h2">Product comparison group</Heading>
          <Caption className={styles.captionBlock}>
            Ingredient header with collapsible section and product table. Best price badge and comparison text.
          </Caption>
          <div className={styles.demo}>
            <ProductComparisonGroup
              ingredientName="Lettuce"
              ingredientImageUrl="/images/ingredients/Lettuce.png"
              products={sampleComparisonProducts}
              productIdLabel={(row) => `SKU ${row.id}`}
              onEdit={() => {}}
              onProductAction={() => {}}
            />
          </div>
        </section>

        <section id="loading" className={styles.section}>
          <Heading as="h2">Loading</Heading>
          <div className={styles.demo}>
            <Loading />
          </div>
        </section>
      </main>
    </div>
  );
}
