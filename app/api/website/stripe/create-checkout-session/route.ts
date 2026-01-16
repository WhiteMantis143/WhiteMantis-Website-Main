import { NextRequest, NextResponse } from "next/server";
import { stripe } from "../../../../../lib/stripe";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../../lib/nextauth";


const NEXT_PUBLIC_WP_URL = process.env.NEXTAUTH_URL || process.env.NEXTAUTH_URL;
const EMAIL_COOKIE_MAX_AGE = 60 * 60 * 3;

export async function POST(req: NextRequest) {
  try {
    const session = (await getServerSession(authOptions)) as any;
    const body = await req.json();

    const { checkout, deliveryOption, address, paymentMethodId, email } = body;
    let shippingCost = 0;
    let shippingMethodId = "";
    let taxRateId = "";
    let taxPercent = 0;
    let taxLabel = "";

    if (!checkout) {
      return NextResponse.json({ success: false, message: "Invalid checkout type" }, { status: 400 });
    }

    if (!deliveryOption) {
      return NextResponse.json({ success: false, message: "Please Provide delivery option" }, { status: 400 });
    }

    if (!paymentMethodId) {
      return NextResponse.json({ success: false, message: "Please Provide payment method" }, { status: 400 });
    }

    if (!email) {
      return NextResponse.json({ success: false, message: "Please Provide email" }, { status: 400 });
    }

    if (!address) {
      return NextResponse.json({ success: false, message: "Please Provide address" }, { status: 400 });
    }

    try {
      const response = await fetch(`${NEXT_PUBLIC_WP_URL}/api/website/get-shipping-tax`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        }
      });
      const result = await response.json();

      if (result.success && result.data) {
        // Extract shipping data
        if (result.data.shipping) {
          shippingCost = result.data.shipping.cost || 0;
          shippingMethodId = result.data.shipping.method_id || "";
        }
        // Extract tax data
        if (result.data.tax) {
          taxRateId = result.data.tax.rate_id || "";
          taxPercent = result.data.tax.percent || 0;
          taxLabel = result.data.tax.label || "";
        }
        console.log("✅ Shipping/Tax loaded:", { shippingCost, shippingMethodId, taxRateId, taxPercent, taxLabel });
      } else {
        console.log("⚠️ Failed to load shipping/tax, using defaults");
      }
    } catch (error) {
      console.log("❌ Error fetching shipping/tax:", error);
    }

    if (checkout.type === "subscription") {
      try {
        const response = await fetch(`${NEXT_PUBLIC_WP_URL}/api/website/products/${checkout.subscriptionProductId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          }
        })
        // console.log(response)
        const data = await response.json();

        if (data.type !== 'subscription' && data.type !== "variable-subscription") {
          return NextResponse.json({ success: false, message: "Invalid Product Id" }, { status: 400 })
        }

        let productDetails = null;
        if (data.type === "subscription") {
          productDetails = data
        }
        else {
          if (!checkout.subscriptionProductVariationId) {
            return NextResponse.json({ success: false, message: "Invalid Product Id" }, { status: 400 })
          }
          productDetails =
            data.variation_options.find(
              (variation: any) => variation.id === Number(checkout.subscriptionProductVariationId)
            )
        }

        if (!productDetails) {
          return NextResponse.json({ success: false, message: "Invalid Product Id" }, { status: 400 })
        }

        // ✅ VALIDATE STOCK STATUS
        if (productDetails.stock_status === "outofstock") {
          return NextResponse.json({ success: false, message: "Product is out of stock" }, { status: 400 });
        }

        // ✅ VALIDATE STOCK QUANTITY
        const stockQuantity = productDetails.stock_quantity;
        if (stockQuantity !== null && stockQuantity !== undefined && stockQuantity < 1) {
          return NextResponse.json({
            success: false,
            message: `Only ${stockQuantity} units available in stock`
          }, { status: 400 });
        }

        let subscriptionData: any = null;

        try {
          const response = await fetch(`${NEXT_PUBLIC_WP_URL}/api/website/subscription/create`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              cookie: req.headers.get("cookie") || "",
            },
            body: JSON.stringify({
              checkout,
              deliveryOption,
              productDetails,
              address,
              email,
              taxData: { taxRateId, taxPercent, taxLabel },
              shippingData: { shippingCost, shippingMethodId }
            })
          })
          let responseText = "";
          try {
            responseText = await response.text();
            const data = responseText ? JSON.parse(responseText) : {};

            if (!data.success) {
              return NextResponse.json({ success: false, message: data.message || "Failed to create subscription" }, { status: 400 });
            }
            subscriptionData = data.subscriptionData;
          } catch (e) {
            console.error("Failed to parse subscription response:", responseText);
            return NextResponse.json({ success: false, message: "Invalid response from subscription service" }, { status: 500 });
          }
        } catch (error) {
          console.log(error)
          return NextResponse.json({ success: false, message: "Invalid Product Id" }, { status: 400 })
        }

        if (!subscriptionData) {
          return NextResponse.json({ success: false, message: "Invalid Product Id" }, { status: 400 })
        }

        try {
          const existingCustomers = await stripe.customers.list({
            email: email,
            limit: 1,
          });

          let stripeCustomerId: any;

          if (existingCustomers.data.length > 0) {
            // Customer exists - get their ID
            stripeCustomerId = existingCustomers.data[0].id;

            await stripe.paymentMethods.attach(paymentMethodId, {
              customer: stripeCustomerId,
            });

            await stripe.customers.update(stripeCustomerId, {
              invoice_settings: { default_payment_method: paymentMethodId },
            });
          } else {
            // Create new customer
            const customer = await stripe.customers.create({
              email: email,
              payment_method: paymentMethodId,
              invoice_settings: { default_payment_method: paymentMethodId },
            });
            stripeCustomerId = customer.id;
          }
          const frequency =
            productDetails.attributes["attribute_pa_simple-subscription-frequenc"];

          const [interval, period] = frequency.split("-");

          const frequencyInterval = Number(interval);
          const frequencyPeriod = period;

          const discount = productDetails.subscription_details.subscription_discount;
          const priceInAED = Number(productDetails.price) - ((productDetails.price * discount) / 100);
          const finalPriceInAED = Number(
            (priceInAED + (priceInAED * taxPercent) / 100).toFixed(2)
          );
          const finalPrice = Math.round(finalPriceInAED * 100); // Convert AED to fils (1 AED = 100 fils)

          const subscription: any = await stripe.subscriptions.create({
            customer: stripeCustomerId,
            items: [
              {
                price_data: {
                  currency: "aed",
                  product: process.env.STRIPE_MASTER_PRODUCT_ID,
                  unit_amount: finalPrice,
                  recurring: {
                    interval: frequencyPeriod.toLowerCase(), // must be: day, week, month, year
                    interval_count: frequencyInterval,
                  },
                },
              },
            ],
            payment_behavior: "default_incomplete", // better alternative
            payment_settings: { save_default_payment_method: "on_subscription" },
            metadata: {
              wp_subscription_id: subscriptionData.id,
            },
            expand: [
              "latest_invoice.confirmation_secret"
            ]
          });

          const clientSecret = subscription.latest_invoice?.confirmation_secret?.client_secret;

          return NextResponse.json({
            success: true,
            message: "Subscription created successfully",
            subscriptionId: subscription.id,
            clientSecret,
          });
        } catch (error) {
          console.log("Stripe checkout error:", error.message);
          return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 })
        }
      } catch (error) {
        console.error("❌ Stripe checkout error:", error.message);
        return NextResponse.json({ error: "Internal server error", message: error.message }, { status: 500 });
      }
    }
    else if (checkout.type === "cart") {
      try {
        // ───────── 1. FETCH CART ─────────
        let cart = null;
        try {
          const cartData = await fetch(`${NEXT_PUBLIC_WP_URL}/api/website/cart/get`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              cookie: req.headers.get("cookie") || "",
            },
          }).then(res => res.json());

          cart = cartData?.cart || { products: [] };
          if (!Array.isArray(cart.products)) cart.products = [];
        } catch (e) {
          console.log("Error fetching cart in stripe checkout", e);
          return NextResponse.json({ success: false, message: "Failed to fetch cart" }, { status: 500 });
        }

        if (!cart.products || cart.products.length === 0) {
          return NextResponse.json({ success: false, message: "Cart is empty" }, { status: 400 });
        }

        // ───────── 2. VALIDATE STOCK FOR ALL CART ITEMS ─────────
        const stockValidationErrors: string[] = [];

        for (const item of cart.products) {
          try {
            const productResponse = await fetch(`${NEXT_PUBLIC_WP_URL}/api/website/products/${item.product_id}`, {
              method: "GET",
              headers: { "Content-Type": "application/json" },
            });
            const productData = await productResponse.json();

            if (!productData || productData.error) {
              stockValidationErrors.push(`Product ${item.name || item.product_id} is no longer available`);
              continue;
            }

            // Check for simple products
            if (productData.type === "simple") {
              if (productData.stock_status === "outofstock") {
                stockValidationErrors.push(`${item.name || 'Product'} is out of stock`);
              } else {
                const stockQty = productData.stock_quantity;
                if (stockQty !== null && stockQty !== undefined && item.quantity > stockQty) {
                  stockValidationErrors.push(`${item.name || 'Product'}: Only ${stockQty} units available (requested ${item.quantity})`);
                }
              }
            }
            // Check for variable products
            else if (productData.type === "variable" && item.variation_id) {
              const variation = productData.variation_options?.find(
                (v: any) => v.id === Number(item.variation_id)
              );

              if (!variation) {
                stockValidationErrors.push(`${item.name || 'Product'} variation is no longer available`);
              } else if (variation.stock_status === "outofstock") {
                stockValidationErrors.push(`${item.name || 'Product'} is out of stock`);
              } else {
                const stockQty = variation.stock_quantity;
                if (stockQty !== null && stockQty !== undefined && item.quantity > stockQty) {
                  stockValidationErrors.push(`${item.name || 'Product'}: Only ${stockQty} units available (requested ${item.quantity})`);
                }
              }
            }
          } catch (error) {
            console.error(`Error validating stock for product ${item.product_id}:`, error);
            stockValidationErrors.push(`Unable to validate stock for ${item.name || item.product_id}`);
          }
        }

        // If there are any stock validation errors, return them
        if (stockValidationErrors.length > 0) {
          return NextResponse.json({
            success: false,
            message: stockValidationErrors.join("; "),
            errors: stockValidationErrors
          }, { status: 400 });
        }

        // ───────── 3. CALCULATE SUBTOTAL ─────────
        let subtotal = 0;
        cart.products.forEach((item: any) => {
          const qty = Number(item.quantity || 1);
          const itemSubtotal =
            Number(item.price?.product_subtotal) ||
            Number(item.price?.final_price || item.price || 0) * qty;
          subtotal += itemSubtotal;
        });

        // ───────── 3. PREPARE CART CLONES ─────────
        const originalCart = JSON.parse(JSON.stringify(cart));

        let couponApplyMode = "none"; // simple | specific | none
        let appliedCoupon = null;

        // ───────── 4. FETCH COUPON IF EXISTS ─────────
        let appliedCouponCode = null;

        const cookieVal = req.cookies.get("applied_coupon")?.value;
        if (cookieVal && cookieVal !== "[object Object]") {
          try {
            // Attempt to parse if it looks like JSON
            if (cookieVal.startsWith("{") || cookieVal.startsWith("[")) {
              const parsed = JSON.parse(cookieVal);
              appliedCouponCode = parsed?.code || null;
            } else {
              // Otherwise treat as raw code
              appliedCouponCode = cookieVal;
            }
          } catch {
            appliedCouponCode = cookieVal;
          }
        }

        if (appliedCouponCode === "[object Object]") appliedCouponCode = null;

        if (appliedCouponCode) {
          try {
            const couponResult = await fetch(`${NEXT_PUBLIC_WP_URL}/api/website/cart/coupan/apply?code=${appliedCouponCode}`, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                cookie: req.headers.get("cookie") || "",
              },
            }).then(res => res.json());

            if (couponResult.success) {
              appliedCoupon = couponResult.coupon;
              couponApplyMode =
                appliedCoupon.meta_data?.find((m: any) => m.key === "apply_coupon_to")?.value

              if (couponApplyMode === "none") { }

              // simple discount amount
              if (couponApplyMode === "simple") {
                if (appliedCoupon.discount_type === "fixed_cart") {
                  subtotal -= Number(appliedCoupon.amount);
                }
                else if (appliedCoupon.discount_type === "percent") {
                  subtotal -= Number(appliedCoupon.amount) * subtotal / 100;
                }
              }
              // specific discount amount
              if (couponApplyMode === "specific") {
                const appliedIds = appliedCoupon.meta_data.find((m: any) => m.key === "coupan_applied_products")?.value || [];

                if (appliedCoupon.discount_type === "fixed_cart") {
                  cart.products.forEach((item: any) => {
                    if (appliedIds.includes(String(item.product_id))) {
                      const newPrice = Math.max(0, item.price.final_price - Number(appliedCoupon.amount));
                      item.price.final_price = Number(newPrice.toFixed(2));
                      item.price.product_subtotal = Number((item.price.final_price * item.quantity).toFixed(2));
                    }
                  });
                }
                else if (appliedCoupon.discount_type === "percent") {
                  const discountPercent = Number(appliedCoupon.amount); // convert once

                  cart.products.forEach((item: any) => {
                    if (appliedIds.includes(String(item.product_id))) {
                      const discounted = item.price.final_price - (item.price.final_price * discountPercent) / 100;
                      const newPrice = Math.max(0, discounted);

                      item.price.final_price = Number(newPrice.toFixed(2));
                      item.price.product_subtotal = Number((item.price.final_price * item.quantity).toFixed(2));
                    }
                  });
                }
                originalCart.products.forEach((item: any) => {
                  const qty = Number(item.quantity || 1);
                  const itemSubtotal =
                    Number(item.price?.product_subtotal) ||
                    Number(item.price?.final_price || item.price || 0) * qty;
                  subtotal += itemSubtotal;
                });
              }
            } else {
              console.log("❌ Coupon fetch failed - not successful");
            }
          } catch (e) {
            console.log("❌ Coupon fetch error:", e);
          }
        }

        // ───────── 8. CREATE ORDER ─────────
        let orderData: any = null;
        let guestAccessToken: string | null = null;

        try {
          const response = await fetch(`${NEXT_PUBLIC_WP_URL}/api/website/order/create`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              cookie: req.headers.get("cookie") || "",
            },
            body: JSON.stringify({
              deliveryOption,
              address,
              email,
              couponCode: appliedCouponCode,
              cart: originalCart,  // Correct cart for WooCommerce
              couponApplyMode,
              taxLabel,
              taxPercent,
              taxRateId,
              shippingCost,
              shippingMethodId,
              finalPrice: subtotal
            })
          });

          const data = await response.json();
          if (!data.success) {
            return NextResponse.json({ success: false, message: data.message || "Failed to create order" }, { status: 400 });
          }

          orderData = data.orderData;
          guestAccessToken = data.guestAccessToken; // Capture guest token if present

          if (guestAccessToken) {
            console.log("🔑 Guest access token received for order:", orderData.id);
          }
        } catch (error) {
          return NextResponse.json({ success: false, message: "Failed to create order" }, { status: 500 });
        }

        if (!orderData) {
          return NextResponse.json({ success: false, message: "Failed to create order" }, { status: 500 });
        }

        if (deliveryOption === "ship") {
          subtotal = Number((subtotal + shippingCost).toFixed(2));
          subtotal = Number((subtotal + ((subtotal * taxPercent) / 100)).toFixed(2));
        }

        if (deliveryOption === "pickup") {
          subtotal = Number((subtotal + ((subtotal * taxPercent) / 100)).toFixed(2));
        }

        let amountInFils = Number((subtotal * 100).toFixed(2));

        // ───────── 9. STRIPE CUSTOMER + PAYMENT ─────────
        try {
          const existingCustomers = await stripe.customers.list({ email, limit: 1 });
          let stripeCustomerId: any;

          if (existingCustomers.data.length > 0) {
            stripeCustomerId = existingCustomers.data[0].id;
            await stripe.paymentMethods.attach(paymentMethodId, { customer: stripeCustomerId });
            await stripe.customers.update(stripeCustomerId, { invoice_settings: { default_payment_method: paymentMethodId } });
          } else {
            const customer = await stripe.customers.create({ email, payment_method: paymentMethodId, invoice_settings: { default_payment_method: paymentMethodId } });
            stripeCustomerId = customer.id;
          }

          const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInFils,
            currency: "aed",
            customer: stripeCustomerId,
            payment_method: paymentMethodId,
            metadata: {
              wp_order_id: orderData.id,
              order_type: "product",
              guest_access_token: guestAccessToken || "", // Store token in Stripe metadata
            },
          });

          const responseData: any = {
            success: true,
            message: "Order created successfully",
            orderId: orderData.id,
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
          };

          // Include guest access token for guest users
          if (guestAccessToken) {
            responseData.guestAccessToken = guestAccessToken;
            console.log("� Returning guest access token in response");
          }

          return NextResponse.json(responseData);

        } catch (error: any) {
          console.log("Stripe payment error:", error.message);
          return NextResponse.json({ success: false, message: "Payment processing failed" }, { status: 500 });
        }

      } catch (error: any) {
        console.error("❌ Product checkout error:", error.message);
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
      }
    } else {
      return NextResponse.json({
        success: false,
        message: "Invalid checkout type"
      }, { status: 400 });
    }
  } catch (error: any) {
    console.error("❌ Stripe checkout error:", error.message);
    return NextResponse.json({ error: "Internal server error", message: error.message }, { status: 500 });
  }
}
