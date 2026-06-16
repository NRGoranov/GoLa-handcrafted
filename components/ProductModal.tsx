"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { giftBoxImageForPaperColor } from "@/lib/giftBoxAssets";
import {
  dispatchInquiryPrefill,
  scrollToInquirySection
} from "@/lib/inquiry-prefill";
import {
  defaultInquiryMeta,
  loadHandbagConfiguration,
  loadModalConfiguration,
  loadModelGiftBoxConfiguration,
  saveGiftBoxConfiguration,
  saveHandbagConfiguration,
  saveInquiryMeta,
  saveModelGiftBoxConfiguration,
  type InquiryMetaState
} from "@/lib/product-configuration-storage";
import { commitModalToCart } from "@/lib/inquiry-cart-commit";
import {
  getInquiryCartCount,
  INQUIRY_CART_CHANGED_EVENT,
  emptyInquiryCart,
  loadInquiryCart,
  removeHandbagFromCart,
  removeStandaloneGiftBoxFromCart,
  saveInquiryCart,
  type InquiryCart
} from "@/lib/inquiry-cart";
import {
  buildInquiryCartMessage,
  defaultGiftBoxConfiguration,
  defaultHandbagConfiguration,
  type GiftBoxConfigurationState,
  type HandbagConfigurationState
} from "@/lib/product-inquiry-prefill";
import { type Product, isGiftBox, isHandbag } from "@/lib/products";
import ProductViewer from "./ProductViewer";

type ProductModalCopy = {
  close: string;
  requestThisPiece: string;
  labels: {
    model: string;
    dimensions: string;
    dimensionsHint: string;
    price: string;
    availability: string;
    customization: string;
    inside: string;
    liningColor: string;
    insidePockets: string;
    engraving: string;
    woodCoatingColor: string;
    chainColor: string;
    paperColor: string;
  };
  values: {
    availabilityByInquiry: string;
    customizationYes: string;
    customizationNo: string;
    insideLeather: string;
  };
  prefill: {
    pocketsYes: string;
    pocketsNo: string;
    engravingYes: string;
    engravingNo: string;
  };
  placeholders: {
    engravingText: string;
  };
  giftBoxAddonHeading: string;
  handbagAddonHeading: string;
  standaloneGiftBoxHeading: string;
  requestItemHeading: string;
  includeGiftBox: string;
  includeHandbag: string;
  selectHandbag: string;
  giftBoxAddonAdds: string;
  addToRequest: string;
  addBoxOnly: string;
  addModelToRequest: string;
  sendInquiry: string;
  inYourRequest: string;
  removeFromRequest: string;
  options: {
    colors: string[];
    woodCoatingColors: string[];
    chainColors: string[];
    paperColors: string[];
    pocketsAdds: string;
    engravingAdds: string;
    engravingNoSurcharge: string;
  };
  aria: {
    modalLabel: string;
    viewImage: string;
    viewNamedImage: string;
    thumbnail: string;
  };
};

type ProductModalProps = {
  product: Product | null;
  giftBoxProduct?: Product | null;
  handbagItems?: Product[];
  onClose: () => void;
  copy: ProductModalCopy;
};

const paperSwatches = [
  "#faf8f5",
  "#f5ead8",
  "#c4a574",
  "#0b0b0b",
  "#e8c4c8",
  "#1e2a4a"
] as const;

const liningSwatches = [
  "#d8c3a5",
  "#556b2f",
  "#6b1f2b",
  "#0f766e",
  "#d8a7b1",
  "#0b0b0b",
  "#36454f",
  "#ff7f50",
  "#8b5a2b"
] as const;

const woodCoatingSwatches = ["#d6b88f", "#6b4a2f", "#5a2a27", "#111111"] as const;
const chainSwatches = ["#d4af37", "#c0c0c0", "#cd7f32", "#0b0b0b"] as const;

export default function ProductModal({
  product,
  giftBoxProduct,
  handbagItems = [],
  onClose,
  copy
}: ProductModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const optionsGroupId = useId();
  const hydratedRef = useRef(false);
  const defaultHandbagIdRef = useRef(handbagItems[0]?.id);

  const [handbagConfig, setHandbagConfig] = useState<HandbagConfigurationState>(defaultHandbagConfiguration);
  const [giftBoxConfig, setGiftBoxConfig] = useState<GiftBoxConfigurationState>(defaultGiftBoxConfiguration);
  const [modelGiftBoxConfig, setModelGiftBoxConfig] = useState<GiftBoxConfigurationState>(
    defaultGiftBoxConfiguration
  );
  const [meta, setMeta] = useState<InquiryMetaState>(defaultInquiryMeta);
  const [cart, setCart] = useState<InquiryCart>(() => loadInquiryCart());

  const effectiveGiftBoxProduct =
    giftBoxProduct ?? (product && isGiftBox(product) ? product : null);

  const activeHandbagId =
    product && isHandbag(product) ? product.id : meta.selectedHandbagId;

  const selectedHandbag =
    handbagItems.find((item) => item.id === meta.selectedHandbagId) ?? handbagItems[0] ?? null;

  const updateHandbagField = useCallback(
    <K extends keyof HandbagConfigurationState>(key: K, value: HandbagConfigurationState[K]) => {
      setHandbagConfig((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const updateGiftBoxField = useCallback(
    <K extends keyof GiftBoxConfigurationState>(key: K, value: GiftBoxConfigurationState[K]) => {
      setGiftBoxConfig((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const updateMeta = useCallback(<K extends keyof InquiryMetaState>(key: K, value: InquiryMetaState[K]) => {
    setMeta((prev) => ({ ...prev, [key]: value }));
  }, []);

  const updateModelGiftBoxField = useCallback(
    <K extends keyof GiftBoxConfigurationState>(key: K, value: GiftBoxConfigurationState[K]) => {
      setModelGiftBoxConfig((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const refreshCart = useCallback(() => {
    setCart(loadInquiryCart());
  }, []);

  useEffect(() => {
    refreshCart();
    const onCartChanged = () => refreshCart();
    window.addEventListener(INQUIRY_CART_CHANGED_EVENT, onCartChanged);
    return () => window.removeEventListener(INQUIRY_CART_CHANGED_EVENT, onCartChanged);
  }, [refreshCart]);

  useEffect(() => {
    if (handbagItems[0]?.id) {
      defaultHandbagIdRef.current = handbagItems[0].id;
    }
  }, [handbagItems]);

  useEffect(() => {
    if (!product) {
      hydratedRef.current = false;
      return;
    }

    const loaded = loadModalConfiguration(
      product.id,
      product.productKind,
      defaultHandbagIdRef.current
    );
    setHandbagConfig(loaded.handbag);
    setGiftBoxConfig(loaded.giftBox);
    setModelGiftBoxConfig(loadModelGiftBoxConfiguration());
    setMeta(loaded.meta);
    hydratedRef.current = true;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab" || !modalRef.current) return;

      const selectors =
        'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])';
      const focusables = modalRef.current.querySelectorAll<HTMLElement>(selectors);
      if (!focusables.length) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      hydratedRef.current = false;
    };
  }, [product?.id, product?.productKind, onClose]);

  useEffect(() => {
    if (!product || !isGiftBox(product) || !meta.includeHandbag) return;
    if (!hydratedRef.current) return;
    setHandbagConfig(loadHandbagConfiguration(meta.selectedHandbagId));
  }, [product?.id, meta.selectedHandbagId, meta.includeHandbag]);

  useEffect(() => {
    if (!hydratedRef.current || !activeHandbagId) return;
    saveHandbagConfiguration(activeHandbagId, handbagConfig);
  }, [handbagConfig, activeHandbagId]);

  useEffect(() => {
    if (!hydratedRef.current) return;
    saveGiftBoxConfiguration(giftBoxConfig);
  }, [giftBoxConfig]);

  useEffect(() => {
    if (!hydratedRef.current) return;
    saveModelGiftBoxConfiguration(modelGiftBoxConfig);
  }, [modelGiftBoxConfig]);

  useEffect(() => {
    if (!hydratedRef.current) return;
    saveInquiryMeta(meta);
  }, [meta]);

  const commitCurrentSelection = useCallback(() => {
    if (!product) return loadInquiryCart();

    const nextCart = commitModalToCart(loadInquiryCart(), {
      product,
      handbagConfig,
      giftBoxConfig,
      modelGiftBoxConfig,
      meta,
      giftBoxProduct: effectiveGiftBoxProduct,
      selectedHandbag
    });
    saveInquiryCart(nextCart);
    setCart(nextCart);
    return nextCart;
  }, [
    product,
    handbagConfig,
    giftBoxConfig,
    modelGiftBoxConfig,
    meta,
    effectiveGiftBoxProduct,
    selectedHandbag
  ]);

  const handleAddToRequest = () => {
    commitCurrentSelection();
  };

  const handleSendInquiry = () => {
    const baseCart = loadInquiryCart();
    const cartForMessage =
      getInquiryCartCount(baseCart) > 0
        ? baseCart
        : product
          ? commitModalToCart(emptyInquiryCart(), {
              product,
              handbagConfig,
              giftBoxConfig,
              modelGiftBoxConfig,
              meta,
              giftBoxProduct: effectiveGiftBoxProduct,
              selectedHandbag
            })
          : baseCart;

    const message = buildInquiryCartMessage(cartForMessage, copy);
    if (!message.trim()) return;

    dispatchInquiryPrefill({ message, inquiryType: "customRequest" });
    onClose();
    window.requestAnimationFrame(() => scrollToInquirySection());
  };

  const cartCount = getInquiryCartCount(cart);

  const addButtonLabel = product
    ? isHandbag(product)
      ? copy.addModelToRequest
      : meta.includeHandbag
        ? copy.addModelToRequest
        : copy.addBoxOnly
    : copy.addToRequest;

  const handbagAddonPrice =
    selectedHandbag && isHandbag(selectedHandbag)
      ? selectedHandbag.priceEur +
        (handbagConfig.insidePockets ? selectedHandbag.pocketsAddOnEur : 0) +
        (handbagConfig.customEngraving ? selectedHandbag.engravingAddOnEur : 0)
      : 0;

  const displayPrice =
    product && isGiftBox(product)
      ? product.priceEur + (meta.includeHandbag ? handbagAddonPrice : 0)
      : product && isHandbag(product)
        ? product.priceEur +
          (handbagConfig.insidePockets ? product.pocketsAddOnEur : 0) +
          (handbagConfig.customEngraving ? product.engravingAddOnEur : 0) +
          (meta.includeGiftBox && effectiveGiftBoxProduct ? effectiveGiftBoxProduct.priceEur : 0)
        : 0;

  return (
    <AnimatePresence>
      {product ? (
        <motion.div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/75 p-0 sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          aria-modal="true"
          role="dialog"
          aria-label={copy.aria.modalLabel.replace("{name}", product.name)}
        >
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="h-[92vh] w-full overflow-auto rounded-t-2xl border border-ivory/15 bg-[#111] p-5 sm:h-auto sm:max-h-[90vh] sm:max-w-5xl sm:rounded-2xl sm:p-7"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <h3 className="font-serif text-3xl text-ivory">{product.name}</h3>
              <button
                type="button"
                onClick={onClose}
                className="focus-ring rounded-full border border-ivory/20 px-3 py-1.5 text-sm text-ivory"
              >
                {copy.close}
              </button>
            </div>

            <div className="grid gap-7 md:grid-cols-2">
              <ProductViewer
                key={product.id}
                name={product.name}
                images={product.images}
                copy={{ aria: copy.aria }}
                syncActiveSrc={
                  isGiftBox(product) ? giftBoxImageForPaperColor(giftBoxConfig.paperColor) : undefined
                }
              />
              <div className="space-y-5">
                <p className="whitespace-pre-line text-mist">{product.description}</p>
                <dl className="space-y-2 text-sm text-ivory/90">
                  {isHandbag(product) ? (
                    <div>
                      <dt className="font-medium text-caramel">{copy.labels.model}</dt>
                      <dd>{product.model}</dd>
                    </div>
                  ) : null}
                  <div>
                    <dt className="font-medium text-caramel">{copy.labels.dimensions}</dt>
                    <dd>
                      <span className="block text-xs uppercase tracking-[0.14em] text-mist">
                        {copy.labels.dimensionsHint}
                      </span>
                      {product.dimensions}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-caramel">{copy.labels.price}</dt>
                    <dd>EUR {displayPrice}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-caramel">{copy.labels.availability}</dt>
                    <dd>{copy.values.availabilityByInquiry}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-caramel">{copy.labels.customization}</dt>
                    <dd>{product.customizable ? copy.values.customizationYes : copy.values.customizationNo}</dd>
                  </div>
                  {isHandbag(product) ? (
                    <div>
                      <dt className="font-medium text-caramel">{copy.labels.inside}</dt>
                      <dd>{copy.values.insideLeather}</dd>
                    </div>
                  ) : null}
                </dl>

                {isHandbag(product) ? (
                  <>
                    <section
                      aria-label={copy.handbagAddonHeading}
                      className="rounded-2xl border border-ivory/10 bg-black/20 p-4"
                    >
                      <p className="mb-4 text-xs uppercase tracking-[0.16em] text-caramel">
                        {copy.handbagAddonHeading}
                      </p>
                      <HandbagOptionsPanel
                        groupId={`${optionsGroupId}-model`}
                        copy={copy}
                        config={handbagConfig}
                        pocketsAddOnEur={product.pocketsAddOnEur}
                        engravingAddOnEur={product.engravingAddOnEur}
                        onUpdate={updateHandbagField}
                      />
                    </section>

                    {effectiveGiftBoxProduct ? (
                      <section
                        aria-label={copy.giftBoxAddonHeading}
                        className="rounded-2xl border border-ivory/10 bg-black/20 p-4"
                      >
                        <label className="flex cursor-pointer items-start gap-3">
                          <input
                            type="checkbox"
                            className="mt-1 h-4 w-4 accent-[#b78b5a]"
                            checked={meta.includeGiftBox}
                            onChange={(event) => updateMeta("includeGiftBox", event.target.checked)}
                          />
                          <span className="text-sm text-ivory/90">
                            <span className="font-medium text-caramel">{copy.includeGiftBox}</span>{" "}
                            <span className="text-mist">
                              (
                              {copy.giftBoxAddonAdds.replace(
                                "{amount}",
                                String(effectiveGiftBoxProduct.priceEur)
                              )}
                              )
                            </span>
                          </span>
                        </label>

                        {meta.includeGiftBox ? (
                          <div className="mt-4 border-t border-ivory/10 pt-4">
                            <p className="mb-4 text-xs uppercase tracking-[0.16em] text-caramel">
                              {copy.giftBoxAddonHeading}
                            </p>
                            <GiftBoxOptionsPanel
                              groupId={`${optionsGroupId}-box`}
                              copy={copy}
                              config={giftBoxConfig}
                              engravingSurchargeLabel={copy.options.engravingNoSurcharge}
                              onUpdate={updateGiftBoxField}
                            />
                          </div>
                        ) : null}
                      </section>
                    ) : null}
                  </>
                ) : (
                  <>
                    <section
                      aria-label={copy.giftBoxAddonHeading}
                      className="rounded-2xl border border-ivory/10 bg-black/20 p-4"
                    >
                      <p className="mb-4 text-xs uppercase tracking-[0.16em] text-caramel">
                        {copy.giftBoxAddonHeading}
                      </p>
                      <GiftBoxOptionsPanel
                        groupId={`${optionsGroupId}-box`}
                        copy={copy}
                        config={giftBoxConfig}
                        engravingSurchargeLabel={copy.options.engravingNoSurcharge}
                        onUpdate={updateGiftBoxField}
                      />
                    </section>

                    {handbagItems.length > 0 ? (
                      <section
                        aria-label={copy.handbagAddonHeading}
                        className="rounded-2xl border border-ivory/10 bg-black/20 p-4"
                      >
                        <label className="flex cursor-pointer items-start gap-3">
                          <input
                            type="checkbox"
                            className="mt-1 h-4 w-4 accent-[#b78b5a]"
                            checked={meta.includeHandbag}
                            onChange={(event) => updateMeta("includeHandbag", event.target.checked)}
                          />
                          <span className="text-sm text-ivory/90">
                            <span className="font-medium text-caramel">{copy.includeHandbag}</span>
                          </span>
                        </label>

                        {meta.includeHandbag ? (
                          <div className="mt-4 border-t border-ivory/10 pt-4">
                            <p className="mb-4 text-xs uppercase tracking-[0.16em] text-caramel">
                              {copy.handbagAddonHeading}
                            </p>

                            <label className="mb-4 block space-y-1.5">
                              <span className="text-xs uppercase tracking-[0.16em] text-mist">
                                {copy.selectHandbag}
                              </span>
                              <select
                                className="focus-ring w-full rounded-xl border border-ivory/20 bg-transparent px-4 py-3 text-sm"
                                value={meta.selectedHandbagId}
                                onChange={(event) =>
                                  updateMeta("selectedHandbagId", event.target.value)
                                }
                              >
                                {handbagItems.map((item) => (
                                  <option key={item.id} value={item.id} className="bg-ink text-ivory">
                                    {item.name}
                                  </option>
                                ))}
                              </select>
                            </label>

                            {selectedHandbag && isHandbag(selectedHandbag) ? (
                              <>
                                <HandbagOptionsPanel
                                  groupId={`${optionsGroupId}-model-addon`}
                                  copy={copy}
                                  config={handbagConfig}
                                  pocketsAddOnEur={selectedHandbag.pocketsAddOnEur}
                                  engravingAddOnEur={selectedHandbag.engravingAddOnEur}
                                  onUpdate={updateHandbagField}
                                />

                                {effectiveGiftBoxProduct ? (
                                  <div className="mt-4 border-t border-ivory/10 pt-4">
                                    <label className="flex cursor-pointer items-start gap-3">
                                      <input
                                        type="checkbox"
                                        className="mt-1 h-4 w-4 accent-[#b78b5a]"
                                        checked={meta.includeGiftBox}
                                        onChange={(event) =>
                                          updateMeta("includeGiftBox", event.target.checked)
                                        }
                                      />
                                      <span className="text-sm text-ivory/90">
                                        <span className="font-medium text-caramel">
                                          {copy.includeGiftBox}
                                        </span>{" "}
                                        <span className="text-mist">
                                          (
                                          {copy.giftBoxAddonAdds.replace(
                                            "{amount}",
                                            String(effectiveGiftBoxProduct.priceEur)
                                          )}
                                          )
                                        </span>
                                      </span>
                                    </label>

                                    {meta.includeGiftBox ? (
                                      <div className="mt-4">
                                        <p className="mb-4 text-xs uppercase tracking-[0.16em] text-caramel">
                                          {copy.giftBoxAddonHeading}
                                        </p>
                                        <GiftBoxOptionsPanel
                                          groupId={`${optionsGroupId}-model-box`}
                                          copy={copy}
                                          config={modelGiftBoxConfig}
                                          engravingSurchargeLabel={copy.options.engravingNoSurcharge}
                                          onUpdate={updateModelGiftBoxField}
                                        />
                                      </div>
                                    ) : null}
                                  </div>
                                ) : null}
                              </>
                            ) : null}
                          </div>
                        ) : null}
                      </section>
                    ) : null}
                  </>
                )}

                <InquiryCartSummary
                  cart={cart}
                  copy={copy}
                  onRemoveHandbag={(entryId) => {
                    const nextCart = removeHandbagFromCart(cart, entryId);
                    saveInquiryCart(nextCart);
                    setCart(nextCart);
                  }}
                  onRemoveStandaloneBox={() => {
                    const nextCart = removeStandaloneGiftBoxFromCart(cart);
                    saveInquiryCart(nextCart);
                    setCart(nextCart);
                  }}
                />

                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <button
                    type="button"
                    onClick={handleAddToRequest}
                    className="focus-ring inline-flex min-h-11 items-center justify-center rounded-full border border-caramel px-5 py-2.5 text-sm font-medium text-caramel transition hover:bg-caramel hover:text-ink"
                  >
                    {addButtonLabel}
                  </button>
                  <button
                    type="button"
                    onClick={handleSendInquiry}
                    className="focus-ring inline-flex min-h-11 items-center justify-center rounded-full bg-caramel px-5 py-2.5 text-sm font-medium text-ink"
                  >
                    {copy.sendInquiry}
                    {cartCount > 0 ? ` (${cartCount})` : ""}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function InquiryCartSummary({
  cart,
  copy,
  onRemoveHandbag,
  onRemoveStandaloneBox
}: {
  cart: InquiryCart;
  copy: ProductModalCopy;
  onRemoveHandbag: (entryId: string) => void;
  onRemoveStandaloneBox: () => void;
}) {
  const count = getInquiryCartCount(cart);
  if (count === 0) return null;

  return (
    <div className="rounded-2xl border border-caramel/25 bg-caramel/5 p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-caramel">
        {copy.inYourRequest} ({count})
      </p>
      <ul className="mt-3 space-y-2 text-sm text-ivory/90">
        {cart.handbags.map((entry, index) => (
          <li
            key={entry.id}
            className="flex items-start justify-between gap-3 rounded-xl border border-ivory/10 bg-black/20 px-3 py-2"
          >
            <span>
              {index + 1}. {entry.handbagName}
              {entry.giftBox ? ` + ${entry.giftBox.name}` : ""}
            </span>
            <button
              type="button"
              onClick={() => onRemoveHandbag(entry.id)}
              className="focus-ring shrink-0 text-xs text-mist underline decoration-ivory/30 underline-offset-2 hover:text-caramel"
            >
              {copy.removeFromRequest}
            </button>
          </li>
        ))}
        {cart.standaloneGiftBox ? (
          <li className="flex items-start justify-between gap-3 rounded-xl border border-ivory/10 bg-black/20 px-3 py-2">
            <span>{cart.standaloneGiftBox.name}</span>
            <button
              type="button"
              onClick={onRemoveStandaloneBox}
              className="focus-ring shrink-0 text-xs text-mist underline decoration-ivory/30 underline-offset-2 hover:text-caramel"
            >
              {copy.removeFromRequest}
            </button>
          </li>
        ) : null}
      </ul>
    </div>
  );
}

function HandbagOptionsPanel({
  groupId,
  copy,
  config,
  pocketsAddOnEur,
  engravingAddOnEur,
  onUpdate
}: {
  groupId: string;
  copy: ProductModalCopy;
  config: HandbagConfigurationState;
  pocketsAddOnEur: number;
  engravingAddOnEur: number;
  onUpdate: <K extends keyof HandbagConfigurationState>(
    key: K,
    value: HandbagConfigurationState[K]
  ) => void;
}) {
  return (
    <>
      <SwatchOptionFieldset
        legend={copy.labels.liningColor}
        labels={copy.options.colors}
        swatches={liningSwatches}
        activeIndex={config.liningColor}
        groupId={`${groupId}-lining`}
        onSelect={(index) => onUpdate("liningColor", index)}
      />

      <SwatchOptionFieldset
        legend={copy.labels.woodCoatingColor}
        labels={copy.options.woodCoatingColors}
        swatches={woodCoatingSwatches}
        activeIndex={config.woodCoatingColor}
        groupId={`${groupId}-wood`}
        onSelect={(index) => onUpdate("woodCoatingColor", index)}
        className="mt-4"
      />

      <SwatchOptionFieldset
        legend={copy.labels.chainColor}
        labels={copy.options.chainColors}
        swatches={chainSwatches}
        activeIndex={config.chainColor}
        groupId={`${groupId}-chain`}
        onSelect={(index) => onUpdate("chainColor", index)}
        className="mt-4"
      />

      <label className="mt-4 flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 accent-[#b78b5a]"
          checked={config.insidePockets}
          onChange={(event) => onUpdate("insidePockets", event.target.checked)}
        />
        <span className="text-sm text-ivory/90">
          <span className="font-medium text-caramel">{copy.labels.insidePockets}</span>{" "}
          <span className="text-mist">
            ({copy.options.pocketsAdds.replace("{amount}", String(pocketsAddOnEur))})
          </span>
        </span>
      </label>

      <label className="mt-3 flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 accent-[#b78b5a]"
          checked={config.customEngraving}
          onChange={(event) => onUpdate("customEngraving", event.target.checked)}
        />
        <span className="text-sm text-ivory/90">
          <span className="font-medium text-caramel">{copy.labels.engraving}</span>{" "}
          <span className="text-mist">
            ({copy.options.engravingAdds.replace("{amount}", String(engravingAddOnEur))})
          </span>
        </span>
      </label>

      {config.customEngraving ? (
        <input
          type="text"
          value={config.engravingText}
          onChange={(event) => onUpdate("engravingText", event.target.value)}
          placeholder={copy.placeholders.engravingText}
          className="focus-ring mt-3 w-full rounded-xl border border-ivory/20 bg-transparent px-4 py-2.5 text-sm text-ivory"
        />
      ) : null}
    </>
  );
}

function GiftBoxOptionsPanel({
  groupId,
  copy,
  config,
  engravingSurchargeLabel,
  onUpdate
}: {
  groupId: string;
  copy: ProductModalCopy;
  config: GiftBoxConfigurationState;
  engravingSurchargeLabel: string;
  onUpdate: <K extends keyof GiftBoxConfigurationState>(
    key: K,
    value: GiftBoxConfigurationState[K]
  ) => void;
}) {
  return (
    <>
      <SwatchOptionFieldset
        legend={copy.labels.paperColor}
        labels={copy.options.paperColors}
        swatches={paperSwatches}
        activeIndex={config.paperColor}
        groupId={`${groupId}-paper`}
        onSelect={(index) => onUpdate("paperColor", index)}
      />

      <SwatchOptionFieldset
        legend={copy.labels.woodCoatingColor}
        labels={copy.options.woodCoatingColors}
        swatches={woodCoatingSwatches}
        activeIndex={config.woodCoatingColor}
        groupId={`${groupId}-wood`}
        onSelect={(index) => onUpdate("woodCoatingColor", index)}
        className="mt-4"
      />

      <label className="mt-4 flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 accent-[#b78b5a]"
          checked={config.customEngraving}
          onChange={(event) => onUpdate("customEngraving", event.target.checked)}
        />
        <span className="text-sm text-ivory/90">
          <span className="font-medium text-caramel">{copy.labels.engraving}</span>{" "}
          <span className="text-mist">({engravingSurchargeLabel})</span>
        </span>
      </label>

      {config.customEngraving ? (
        <input
          type="text"
          value={config.engravingText}
          onChange={(event) => onUpdate("engravingText", event.target.value)}
          placeholder={copy.placeholders.engravingText}
          className="focus-ring mt-3 w-full rounded-xl border border-ivory/20 bg-transparent px-4 py-2.5 text-sm text-ivory"
        />
      ) : null}
    </>
  );
}

function SwatchOptionFieldset({
  legend,
  labels,
  swatches,
  activeIndex,
  groupId,
  onSelect,
  className = ""
}: {
  legend: string;
  labels: string[];
  swatches: readonly string[];
  activeIndex: number;
  groupId: string;
  onSelect: (index: number) => void;
  className?: string;
}) {
  return (
    <fieldset className={`space-y-3 ${className}`.trim()}>
      <legend className="text-xs uppercase tracking-[0.16em] text-mist">{legend}</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {labels.map((label, index) => {
          const isActive = activeIndex === index;
          return (
            <button
              key={`${groupId}-${index}`}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => onSelect(index)}
              className={`focus-ring grid min-h-11 grid-cols-[1fr_auto_auto] items-center gap-3 rounded-xl border px-4 py-2 text-sm ${
                isActive
                  ? "border-caramel bg-caramel/10 text-ivory"
                  : "border-ivory/15 bg-transparent text-ivory/85 hover:border-ivory/30"
              }`}
            >
              <span className="min-w-0 truncate text-left">{label}</span>
              <span
                aria-hidden="true"
                className="h-4 w-4 rounded-full border border-ivory/25"
                style={{ backgroundColor: swatches[index] ?? "#808080" }}
              />
              <span
                aria-hidden="true"
                className={`inline-flex h-5 w-5 items-center justify-center rounded-full border ${
                  isActive ? "border-caramel bg-caramel text-ink" : "border-ivory/30"
                }`}
              >
                {isActive ? "✓" : ""}
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
