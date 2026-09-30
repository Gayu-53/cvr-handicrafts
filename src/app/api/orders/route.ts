import { prisma } from "@/lib/prisma";
import { checkoutSchema } from "@/lib/validation";
import { apiSuccess, apiError, withErrorHandling } from "@/lib/apiResponse";
import { getRazorpayClient } from "@/lib/razorpay";

async function generateOrderNumber() {
  const count = await prisma.order.count();
  return `CVR-${String(count + 1).padStart(6, "0")}`;
}

/**
 * Creates the Order in our DB using SERVER-TRUSTED prices (never trusting
 * any price sent by the client) and then creates a matching Razorpay order.
 * The frontend uses the returned razorpayOrderId to open the checkout widget.
 */
export const POST = withErrorHandling(async (req: Request) => {
  const body = await req.json();
  const parsed = checkoutSchema.parse(body);

  const productIds = parsed.items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, isActive: true },
  });
  type ProductRow = (typeof products)[number];
  const findProduct = (id: string) => products.find((p: ProductRow) => p.id === id)!;

  if (products.length !== productIds.length) {
    return apiError("One or more items in your cart are no longer available.", 409);
  }

  for (const item of parsed.items) {
    const product = findProduct(item.productId);
    if (!product.inStock || product.stockQuantity < item.quantity) {
      return apiError(`"${product.name}" doesn't have enough stock available.`, 409);
    }
  }

  const subtotal = parsed.items.reduce((sum, item) => {
    const product = findProduct(item.productId);
    const effectivePrice = product.salePrice ?? product.price;
    return sum + Number(effectivePrice) * item.quantity;
  }, 0);

  const shippingFee = subtotal >= 2000 ? 0 : 99; // simple example rule, editable later via settings
  const total = subtotal + shippingFee;

  const customer = await prisma.customer.upsert({
    where: { phone: parsed.phone },
    update: { name: parsed.name, email: parsed.email || undefined },
    create: { name: parsed.name, phone: parsed.phone, email: parsed.email || undefined },
  });

  const orderNumber = await generateOrderNumber();

  const order = await prisma.order.create({
    data: {
      orderNumber,
      customerId: customer.id,
      addressLine: parsed.addressLine,
      city: parsed.city,
      state: parsed.state,
      pincode: parsed.pincode,
      subtotal,
      shippingFee,
      total,
      status: "PENDING",
      items: {
        create: parsed.items.map((item) => {
          const product = findProduct(item.productId);
          const unitPrice = Number(product.salePrice ?? product.price);
          return {
            productId: product.id,
            productName: product.name,
            productCode: product.code,
            unitPrice,
            quantity: item.quantity,
            lineTotal: unitPrice * item.quantity,
          };
        }),
      },
    },
    include: { items: true },
  });

  const razorpay = getRazorpayClient();
  const razorpayOrder = await razorpay.orders.create({
    amount: Math.round(total * 100), // paise
    currency: "INR",
    receipt: orderNumber,
    notes: { orderId: order.id },
  });

  await prisma.payment.create({
    data: {
      orderId: order.id,
      razorpayOrderId: razorpayOrder.id,
      amount: total,
      status: "CREATED",
    },
  });

  await prisma.order.update({ where: { id: order.id }, data: { status: "PAYMENT_PENDING" } });

  return apiSuccess({
    orderId: order.id,
    orderNumber,
    razorpayOrderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
  }, 201);
});
